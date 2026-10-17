import { gsap } from 'gsap';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { applyFlatState, flattenShape } from './animatable';
import { RESOLVED, resolveTimeline } from './model';
import { DEFAULT_EASE, FLAT_STATE, SLIDE_DISTANCE, TIMELINE_TRACK, TRANSITION } from './timeline.types';

/** Every shape on screen at a moment, as it looks then. */
export type PREVIEW = { [id: string]: AVAILABLE_SHAPES };

/** The off-screen state an entering shape starts from (or an exiting one ends at). */
function transitionState(state: FLAT_STATE, type: TRANSITION): FLAT_STATE {
    const out: FLAT_STATE = { ...state, 'style.opacity': 0 };
    const num = (key: string) => Number(state[key]) || 0;
    switch (type) {
        case 'zoom':
            out['style.scale.0'] = num('style.scale.0') * 0.3;
            out['style.scale.1'] = num('style.scale.1') * 0.3;
            break;
        case 'slideLeft':
            out['style.translate.0'] = num('style.translate.0') - SLIDE_DISTANCE;
            break;
        case 'slideRight':
            out['style.translate.0'] = num('style.translate.0') + SLIDE_DISTANCE;
            break;
        case 'slideUp':
            out['style.translate.1'] = num('style.translate.1') - SLIDE_DISTANCE;
            break;
        case 'slideDown':
            out['style.translate.1'] = num('style.translate.1') + SLIDE_DISTANCE;
            break;
    }
    return out;
}

interface TRACK_PLAN {
    resolved: RESOLVED[];
    /** every shape that ever appears in the timeline */
    ids: string[];
}

/**
 * Builds a paused GSAP timeline from the page's timelines. Every shape gets a "proxy" object
 * holding its flattened animatable properties; GSAP tweens the proxies (morphs between
 * cutscenes, entries and exits) and `frame` turns them back into shapes for the canvas.
 */
export class TimelinePlayer {
    private tl: gsap.core.Timeline | null = null;
    private proxies: { [id: string]: FLAT_STATE } = {};
    private plans: TRACK_PLAN[] = [];
    private timelines: TIMELINE_TRACK[] = [];
    private dirty = true;
    private tick = () => { };

    sync(timelines: TIMELINE_TRACK[]) {
        if (timelines !== this.timelines) {
            this.timelines = timelines;
            this.dirty = true;
        }
    }

    private ensureBuilt(): gsap.core.Timeline {
        if (this.tl && !this.dirty) {
            return this.tl;
        }
        this.tl?.kill();
        this.proxies = {};
        const tl = gsap.timeline({ paused: true });

        this.plans = this.timelines.map(track => {
            const resolved = resolveTimeline(track);
            const ids = Array.from(new Set(resolved.flatMap(r => Object.keys(r.state))));
            ids.forEach(id => {
                const first = resolved.find(r => r.state[id])!.state[id];
                const proxy: FLAT_STATE = flattenShape(first);
                this.proxies[id] = proxy;

                resolved.forEach(({ cutscene, state }, i) => {
                    const before = i > 0 ? resolved[i - 1].state[id] : undefined;
                    const after = state[id];
                    const position = cutscene.start;
                    const vars = {
                        duration: Math.max(cutscene.end - cutscene.start, 0.01),
                        ease: cutscene.ease || DEFAULT_EASE,
                        immediateRender: false,
                    };
                    if (before && after) {
                        const from = flattenShape(before);
                        const to = flattenShape(after);
                        const keys = Object.keys(to).filter(key => key in from && from[key] !== to[key]);
                        if (keys.length) {
                            const f: FLAT_STATE = {};
                            const t: FLAT_STATE = {};
                            keys.forEach(key => { f[key] = from[key]; t[key] = to[key]; });
                            tl.fromTo(proxy, f, { ...t, ...vars }, position);
                        }
                    } else if (after) {
                        const to = flattenShape(after);
                        const type = cutscene.enter[id] || 'none';
                        type === 'none'
                            ? tl.set(proxy, to, position)
                            : tl.fromTo(proxy, transitionState(to, type), { ...to, ...vars }, position);
                    } else if (before) {
                        const type = cutscene.exit[id] || 'none';
                        if (type !== 'none') {
                            const from = flattenShape(before);
                            tl.fromTo(proxy, from, { ...transitionState(from, type), ...vars }, position);
                        }
                    }
                });
            });
            return { resolved, ids };
        });

        this.tl = tl;
        this.dirty = false;
        return tl;
    }

    /** Which shapes are on screen at `time`, as they look then. */
    private frame(time: number): PREVIEW {
        const preview: PREVIEW = {};
        this.plans.forEach(({ resolved, ids }) => {
            // the last cutscene that has started
            let k = -1;
            resolved.forEach((r, i) => {
                if (r.cutscene.start <= time + 1e-9) {
                    k = i;
                }
            });
            if (k === -1) {
                return;
            }
            const current = resolved[k];
            ids.forEach(id => {
                let base = current.state[id];
                if (!base && k > 0) {
                    // still exiting during this cutscene
                    const leaving = resolved[k - 1].state[id];
                    const exit = current.cutscene.exit[id] || 'none';
                    if (leaving && exit !== 'none' && time < current.cutscene.end) {
                        base = leaving;
                    }
                }
                if (base) {
                    preview[id] = applyFlatState(base, this.proxies[id]);
                }
            });
        });
        return preview;
    }

    /** End of the last cutscene. */
    get duration() {
        return Math.max(0, ...this.timelines.flatMap(t => t.cutscenes.map(c => c.end)));
    }

    /** The page as it looks at `time`. */
    evaluate(time: number): PREVIEW {
        const tl = this.ensureBuilt();
        tl.pause();
        tl.seek(time, true);
        return this.frame(time);
    }

    /** Plays from `from`; with `loop` it starts over at the end instead of stopping. */
    play(from: number, onFrame: (time: number, preview: PREVIEW) => void, onEnd: () => void, loop = false) {
        const tl = this.ensureBuilt();
        const end = this.duration;
        let startedAt = performance.now() - from * 1000;
        gsap.ticker.remove(this.tick);
        this.tick = () => {
            let t = (performance.now() - startedAt) / 1000;
            if (loop && end > 0 && t >= end) {
                startedAt += Math.floor(t / end) * end * 1000;
                t = (performance.now() - startedAt) / 1000;
            }
            t = Math.min(end, t);
            tl.seek(t, true);
            onFrame(t, this.frame(t));
            if (!loop && t >= end) {
                gsap.ticker.remove(this.tick);
                onEnd();
            }
        };
        gsap.ticker.add(this.tick);
    }

    pause() {
        gsap.ticker.remove(this.tick);
        this.tl?.pause();
    }
}

export const timelinePlayer = new TimelinePlayer();
