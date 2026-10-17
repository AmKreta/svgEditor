import { RefObject, useCallback } from 'react';
import { eventToSvgPoint, SvgPoint } from '../utils/svgCoords';

export function useSvgPointerPosition(svgRef: RefObject<SVGSVGElement>) {
    return useCallback((event: { clientX: number; clientY: number }): SvgPoint => {
        return eventToSvgPoint(svgRef.current, event);
    }, [svgRef]);
}
