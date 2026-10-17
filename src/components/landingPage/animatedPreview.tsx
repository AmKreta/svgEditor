import React, { useEffect, useMemo, useRef } from 'react';
import { PAGES } from '../../actions/pages/pages.interface';
import { TimelinePlayer } from '../../timeline/player';
import { gradientDefs, shapesToMarkup } from '../../timeline/svgMarkup';

interface props {
    doc: PAGES;
    /** play on repeat; otherwise show the document's thumbnail frame */
    playing: boolean;
    className?: string;
}

/** The document's first page, drawn outside the editor and optionally animated. */
const AnimatedPreview: React.FC<props> = function ({ doc, playing, className }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const page = doc.pages[0];
    const defs = useMemo(() => gradientDefs(doc.gradients || {}), [doc]);
    // each preview has its own player so several can run without touching the editor's
    const player = useMemo(() => {
        const p = new TimelinePlayer();
        p.sync(page.timelines || []);
        return p;
    }, [page]);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) {
            return;
        }
        if (!playing || !page.timelines?.length) {
            svg.innerHTML = doc.snapshots[0] || defs + shapesToMarkup(page.shapes);
            return;
        }
        // the gradient ids are shared, so only one copy of the defs needs to be in the page
        player.play(0, (_, preview) => {
            svg.innerHTML = defs + shapesToMarkup(preview);
        }, () => { }, true);
        return () => player.pause();
    }, [playing, player, page, doc, defs]);

    return (
        <svg
            ref={svgRef}
            className={className}
            viewBox='0 0 1100 560'
            preserveAspectRatio='xMidYMid slice'
            style={{ display: 'block', width: '100%', height: '100%', backgroundColor: page.svgStyle.backgroundColor }}
            aria-hidden='true'
        />
    );
}

export default AnimatedPreview;
