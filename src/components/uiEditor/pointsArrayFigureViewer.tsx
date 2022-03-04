import React, { useEffect, useState, useRef } from 'react';
import { multiPointShpes, SHAPE_TYPES } from '../../utils/constant';

interface Props {
    pointsArray: [number, number][];
    type: SHAPE_TYPES;
}

const PointsArrayFigureViewer: React.FC<Props> = function ({ pointsArray, type }) {
    const [tempPoints, setTempPoints] = useState<[number, number]>(pointsArray[0]);
    const svgEditorRef = useRef(document.querySelector('svg#svgEditor'));

    const mouseMoveHandler = function (e: MouseEvent) {
        const element = svgEditorRef.current as SVGElement;
        const boundingRect = element.getBoundingClientRect();
        let x = e.clientX - boundingRect.x;
        let y = e.clientY - boundingRect.y;
        if (type !== SHAPE_TYPES.PATH) {
            setTempPoints([x, y]);
        }
    };

    useEffect(function () {
        window.addEventListener('mousemove', mouseMoveHandler);
        return () => window.removeEventListener('mousemove', mouseMoveHandler);
    }, []);

    if (!multiPointShpes.includes(type)) {
        return null;
    }

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
                    ? <polygon points={[...pointsArray, tempPoints].toString()} fill='transparent' stroke='black' />
                    : null
            }

            {
                type === SHAPE_TYPES.POLYLINE
                    ? <polyline points={[...pointsArray, tempPoints].toString()} fill='transparent' stroke='black' />
                    : null
            }
            {
                type === SHAPE_TYPES.LINE
                    ? (
                        <line
                            x1={pointsArray[0][0]}
                            y1={pointsArray[0][1]}
                            x2={tempPoints[0]}
                            y2={tempPoints[1]}
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
                            //d={`M ${pointsArray[0][0]} ${pointsArray[0][1]} C ${.toString()}`}
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