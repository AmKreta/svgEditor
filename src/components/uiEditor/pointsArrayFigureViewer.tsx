import React, { useRef } from 'react';
import { MIN_PATH_POINT_DISTANCE, multiPointShpes, SHAPE_TYPES } from '../../utils/constant';
import { useEventListener } from '../../hooks/useEventListener';
import { useRAFThrottled } from '../../hooks/useRAFThrottled';
import { eventToSvgPoint } from '../../utils/svgCoords';

interface Props {
    pointsArray: [number, number][];
    type: SHAPE_TYPES;
    svgEditorRef?: React.RefObject<SVGSVGElement>;
}

const PointsArrayFigureViewer: React.FC<Props> = function ({ pointsArray, type, svgEditorRef }) {
    const tempPointRef = useRef<[number, number]>(pointsArray[0]);
    const previewRef = useRef<SVGElement | null>(null);

    const updatePreview = useRAFThrottled((x: number, y: number) => {
        tempPointRef.current = [x, y];
        const node = previewRef.current;
        if (!node) {
            return;
        }
        if (type === SHAPE_TYPES.LINE) {
            node.setAttribute('x2', String(x));
            node.setAttribute('y2', String(y));
            return;
        }
        if (type === SHAPE_TYPES.POLYGON || type === SHAPE_TYPES.POLYLINE) {
            node.setAttribute('points', [...pointsArray, [x, y]].toString());
        }
    });

    useEventListener('pointermove', (e: PointerEvent) => {
        if (type === SHAPE_TYPES.PATH) {
            return;
        }
        const svg = svgEditorRef?.current ?? (document.querySelector('svg#svgEditor') as SVGSVGElement | null);
        if (!svg) {
            return;
        }
        const { x, y } = eventToSvgPoint(svg, e);
        const last = tempPointRef.current;
        if (last && Math.hypot(x - last[0], y - last[1]) < MIN_PATH_POINT_DISTANCE / 4) {
            return;
        }
        updatePreview(x, y);
    });

    if (!multiPointShpes.includes(type)) {
        return null;
    }

    const [tx, ty] = tempPointRef.current;

    return (
        <>
            {
                type !== SHAPE_TYPES.PATH
                    ? pointsArray.map((points, index) => (
                        <circle
                            cx={points[0]}
                            cy={points[1]}
                            r={4}
                            fill='black'
                            key={index + points.toString()}
                        />
                    ))
                    : null
            }
            {
                type === SHAPE_TYPES.POLYGON
                    ? <polygon ref={previewRef as React.Ref<SVGPolygonElement>} points={[...pointsArray, [tx, ty]].toString()} fill='transparent' stroke='black' />
                    : null
            }

            {
                type === SHAPE_TYPES.POLYLINE
                    ? <polyline ref={previewRef as React.Ref<SVGPolylineElement>} points={[...pointsArray, [tx, ty]].toString()} fill='transparent' stroke='black' />
                    : null
            }
            {
                type === SHAPE_TYPES.LINE
                    ? (
                        <line
                            ref={previewRef as React.Ref<SVGLineElement>}
                            x1={pointsArray[0][0]}
                            y1={pointsArray[0][1]}
                            x2={tx}
                            y2={ty}
                            fill='transparent'
                            stroke='black'
                        />
                    )
                    : null
            }
            {
                type === SHAPE_TYPES.PATH
                    ? (
                        <path
                            fill='transparent'
                            stroke='black'
                            d={(function () {
                                const [p1, ...p] = pointsArray;
                                return `M ${p1[0]} ${p1[1]} C ${p.toString()}`;
                            })()}
                        />
                    )
                    : null
            }
        </>
    );
}

export default PointsArrayFigureViewer;
