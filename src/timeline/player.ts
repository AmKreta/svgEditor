import { gsap } from 'gsap';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { applyFlatState, flattenShape } from './animatable';
import { DEFAULT_EASE, FLAT_STATE, TIMELINE } from './timeline.types';

type SHAPES = { [id: string]: AVAILABLE_SHAPES };
export type PREVIEW = { [id: string]: AVAILABLE_SHAPES };

/**
 * Builds a paused GSAP timeline from the page's cutscenes and turns it into
 * per-shape preview objects. GSAP tweens plain "proxy" objects holding the
 * flattened properties, so the shapes in the store are never modified.
 */
class TimelinePlayer {
    private tl: gsap.core.Timeline | null = null;
    private proxies: { [id: string]: FLAT_STATE } = {};
    private timeline: TIMELINE = {};
    private shapes: SHAPES = {};
    private dirty = true;

    /** Cheap: only marks the timeline for a rebuild when its inputs changed. */
    sync(timeline: TIMELINE, shapes: SHAPES) {
        if (timeline !== this.timeline || shapes !== this.shapes) {
            this.timeline = timeline;
            this.shapes = shapes;
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

        Object.keys(this.timeline).forEach(id => {
            const shape = this.shapes[id];
            const cutscenes = this.timeline[id]?.cutscenes || [];
            if (!shape || !shape.render || !cutscenes.length) {
                return;
            }
            const base = flattenShape(shape);
            const proxy: FLAT_STATE = { ...base };
            // state the next cutscene starts from
            let current: FLAT_STATE = { ...base };

            [...cutscenes].sort((a, b) => a.start - b.start).forEach(cutscene => {
                const keys = Object.keys(cutscene.state).filter(key => key in base);
                if (!keys.length) {
                    return;
                }
                const from: FLAT_STATE = {};
                const to: FLAT_STATE = {};
                keys.forEach(key => {
                    from[key] = current[key];
                    to[key] = cutscene.state[key];
                });
                tl.fromTo(proxy, from, {
                    ...to,
                    duration: Math.max(cutscene.end - cutscene.start, 0.01),
                    ease: cutscene.ease || DEFAULT_EASE,
                    immediateRender: false,
                }, cutscene.start);
                current = { ...current, ...to };
            });
            this.proxies[id] = proxy;
        });

        this.tl = tl;
        this.dirty = false;
        return tl;
    }

    private frame(): PREVIEW {
        const preview: PREVIEW = {};
        Object.keys(this.proxies).forEach(id => {
            preview[id] = applyFlatState(this.shapes[id], this.proxies[id]);
        });
        return preview;
    }

    get duration() {
        return this.ensureBuilt().duration();
    }

    get isEmpty() {
        this.ensureBuilt();
        return Object.keys(this.proxies).length === 0;
    }

    /** Shapes as they look at `time` (only shapes that have animation). */
    evaluate(time: number): PREVIEW {
        const tl = this.ensureBuilt();
        tl.pause();
        tl.seek(time, true);
        return this.frame();
    }

    play(from: number, onFrame: (time: number, preview: PREVIEW) => void, onEnd: () => void) {
        const tl = this.ensureBuilt();
        tl.eventCallback('onUpdate', () => onFrame(tl.time(), this.frame()));
        tl.eventCallback('onComplete', onEnd);
        tl.play(from);
    }

    pause(): number {
        if (!this.tl) {
            return 0;
        }
        this.tl.pause();
        this.tl.eventCallback('onUpdate', null);
        this.tl.eventCallback('onComplete', null);
        return this.tl.time();
    }
}

export const timelinePlayer = new TimelinePlayer();
