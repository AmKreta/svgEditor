import { gsap } from 'gsap';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { applyFlatState, flattenShape } from './animatable';
import { orderedCutscenes, targetFor } from './model';
import { DEFAULT_EASE, FLAT_STATE, TIMELINE_TRACK } from './timeline.types';

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
    private timelines: TIMELINE_TRACK[] = [];
    private shapes: SHAPES = {};
    // reducers update shapes inside the same object, so changes are detected per shape
    private shapeRefs: AVAILABLE_SHAPES[] = [];
    private dirty = true;

    /** Cheap: only marks the timeline for a rebuild when its inputs changed. */
    sync(timelines: TIMELINE_TRACK[], shapes: SHAPES) {
        const refs = Object.values(shapes);
        const shapesChanged = refs.length !== this.shapeRefs.length || refs.some((shape, i) => shape !== this.shapeRefs[i]);
        if (timelines !== this.timelines || shapesChanged) {
            this.timelines = timelines;
            this.shapeRefs = refs;
            this.dirty = true;
        }
        this.shapes = shapes;
    }

    private ensureBuilt(): gsap.core.Timeline {
        if (this.tl && !this.dirty) {
            return this.tl;
        }
        this.tl?.kill();
        this.proxies = {};
        const tl = gsap.timeline({ paused: true });
        const ordered = orderedCutscenes(this.timelines);

        Object.keys(this.shapes).forEach(id => {
            const shape = this.shapes[id];
            if (!shape.render) {
                return;
            }
            const base = flattenShape(shape);
            const proxy: FLAT_STATE = { ...base };
            // state the next cutscene starts from
            let current: FLAT_STATE = { ...base };
            let animated = false;

            ordered.forEach(cutscene => {
                const to = targetFor(cutscene, id, base);
                const keys = Object.keys(to);
                if (!keys.length) {
                    return;
                }
                const from: FLAT_STATE = {};
                keys.forEach(key => {
                    from[key] = current[key];
                });
                tl.fromTo(proxy, from, {
                    ...to,
                    duration: Math.max(cutscene.end - cutscene.start, 0.01),
                    ease: cutscene.ease || DEFAULT_EASE,
                    immediateRender: false,
                }, cutscene.start);
                current = { ...current, ...to };
                animated = true;
            });
            if (animated) {
                this.proxies[id] = proxy;
            }
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

    /** End of the last cutscene, including ones that don't change anything yet. */
    get duration() {
        return Math.max(0, ...this.timelines.flatMap(t => t.cutscenes.map(c => c.end)));
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
        // play to the end of the last cutscene even if its final ones are still empty
        const end = this.duration;
        const startedAt = performance.now() - from * 1000;
        tl.eventCallback('onUpdate', null);
        tl.eventCallback('onComplete', null);
        gsap.ticker.remove(this.tick);
        this.tick = () => {
            const t = Math.min(end, (performance.now() - startedAt) / 1000);
            tl.seek(t, true);
            onFrame(t, this.frame());
            if (t >= end) {
                gsap.ticker.remove(this.tick);
                onEnd();
            }
        };
        gsap.ticker.add(this.tick);
    }

    private tick = () => { };

    pause() {
        gsap.ticker.remove(this.tick);
        this.tl?.pause();
    }
}

export const timelinePlayer = new TimelinePlayer();
