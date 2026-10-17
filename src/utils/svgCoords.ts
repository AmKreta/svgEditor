export interface SvgPoint {
    x: number;
    y: number;
}

export function clientToSvgPoint(
    svg: SVGSVGElement,
    clientX: number,
    clientY: number
): SvgPoint {
    const ctm = svg.getScreenCTM();
    if (!ctm) {
        const rect = svg.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    }
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const mapped = pt.matrixTransform(ctm.inverse());
    return { x: mapped.x, y: mapped.y };
}

export function eventToSvgPoint(
    svg: SVGSVGElement | null | undefined,
    event: { clientX: number; clientY: number }
): SvgPoint {
    if (!svg) {
        return { x: event.clientX, y: event.clientY };
    }
    return clientToSvgPoint(svg, event.clientX, event.clientY);
}

export function pointDistance(
    a: SvgPoint | [number, number],
    b: SvgPoint | [number, number]
): number {
    const ax = Array.isArray(a) ? a[0] : a.x;
    const ay = Array.isArray(a) ? a[1] : a.y;
    const bx = Array.isArray(b) ? b[0] : b.x;
    const by = Array.isArray(b) ? b[1] : b.y;
    return Math.hypot(bx - ax, by - ay);
}

export function trySetPointerCapture(element: Element, pointerId: number) {
    try {
        element.setPointerCapture(pointerId);
    } catch {
        // SVG / detached nodes can throw; drag still works via window listeners.
    }
}

export function tryReleasePointerCapture(element: Element, pointerId: number) {
    try {
        if (element.hasPointerCapture(pointerId)) {
            element.releasePointerCapture(pointerId);
        }
    } catch {
        // ignore
    }
}
