import React, { useRef } from 'react';
import { useEventListener } from '../../hooks/useEventListener';
import { useRAFThrottled } from '../../hooks/useRAFThrottled';
import { eventToSvgPoint } from '../../utils/svgCoords';

interface props {
    svgEditorRef: React.RefObject<SVGSVGElement>
}

const PointerHelper: React.FC<props> = function ({ svgEditorRef }) {
    const horizontalLineRef = useRef<SVGLineElement>(null);
    const verticalLineRef = useRef<SVGLineElement>(null);

    const updateGuides = useRAFThrottled((x: number, y: number) => {
        const h = horizontalLineRef.current;
        const v = verticalLineRef.current;
        if (h) {
            h.setAttribute('y1', String(y));
            h.setAttribute('y2', String(y));
        }
        if (v) {
            v.setAttribute('x1', String(x));
            v.setAttribute('x2', String(x));
        }
    });

    useEventListener('pointermove', (e: PointerEvent) => {
        const svg = svgEditorRef.current;
        if (!svg) {
            return;
        }
        const { x, y } = eventToSvgPoint(svg, e);
        updateGuides(x, y);
    });

    return (
        <>
            <line ref={horizontalLineRef} x1={0} y1={0} x2='100%' y2={0} stroke='black' strokeWidth={1} strokeOpacity={.5} />
            <line ref={verticalLineRef} x1={0} y1={0} x2={0} y2='100%' stroke='black' strokeWidth={1} strokeOpacity={.5} />
        </>
    );
}

export default PointerHelper;
