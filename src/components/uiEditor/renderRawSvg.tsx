import React, { useRef } from 'react';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { SHAPE_TYPES } from '../../utils/constant';
import { CIRCLE_SHAPE } from '../../shapes/circle';
import { getBoundingRectMidPoint, getStyleObj, getTransformOrigin } from '../../utils/utils';
import { RECTANGLE_SHAPE } from '../../shapes/rectangle';
import { POLYGON_SHAPE } from '../../shapes/polygon';
import { POLYLINE_SHAPE } from '../../shapes/polyline';
import { IMAGE_SHAPE } from '../../shapes/image';
import { LINE_SHAPE } from '../../shapes/line';
import { ELLIPSE_SHAPE } from '../../shapes/ellipse';
import { TEXT_SHAPE } from '../../shapes/text';
import { PATH_SHAPE } from '../../shapes/path';
import { GROUP_SHAPE } from '../../shapes/group';

interface props {
    shapes: {
        [key: string]: AVAILABLE_SHAPES
    },
    isActive: boolean,
    clickHandler: React.MouseEventHandler<SVGSVGElement> | undefined;
    index: number;
}

const RenderRaw: React.FC<{ s: AVAILABLE_SHAPES }> = function ({ s }) {
    const ref = useRef<any>(null);
    switch (s.type) {
        case SHAPE_TYPES.CIRCLE: {
            const shape = s as CIRCLE_SHAPE;
            return (
                <circle
                    cx={`${shape.x}${shape.x_unit}`}
                    cy={`${shape.y}${shape.y_unit}`}
                    r={`${shape.radius}${shape.radius_unit}`}
                    id={shape.id}
                    {...getStyleObj(shape.style)}
                    transform-origin={`${shape.x} ${shape.y}`}
                />
            );
        }
        case SHAPE_TYPES.RECTANGLE: {
            const shape = s as RECTANGLE_SHAPE;
            return (
                <rect
                    x={shape.x}
                    y={shape.y}
                    height={shape.height}
                    width={shape.width}
                    {...getStyleObj(shape.style)}
                    transform-origin={`${shape.x + shape.width / 2} ${shape.y + shape.height / 2}`}
                    rx={shape.rx}
                    ry={shape.ry}
                />
            );
        }

        case SHAPE_TYPES.POLYGON: {
            const shape = s as POLYGON_SHAPE;
            const transformOrigin = getBoundingRectMidPoint(ref.current?.getBBox());
            return (
                <polygon
                    id={shape.id}
                    {...getStyleObj(shape.style)}
                    points={shape.points.toString()}
                    transform-origin={`${transformOrigin.x} ${transformOrigin.y}`}
                    ref={ref}
                />
            );
        }

        case SHAPE_TYPES.POLYLINE: {
            const shape = s as POLYLINE_SHAPE;
            const transformOrigin = getBoundingRectMidPoint(ref.current?.getBBox());
            return (
                <polyline
                    id={shape.id}
                    {...getStyleObj(shape.style)}
                    points={shape.points.toString()}
                    transform-origin={`${transformOrigin.x} ${transformOrigin.y}`}
                    key={shape.id}
                    ref={ref}
                />
            );
        }

        case SHAPE_TYPES.IMAGE: {
            const shape = s as IMAGE_SHAPE;
            return (
                <image
                    x={shape.x}
                    y={shape.y}
                    height={shape.height}
                    width={shape.width}
                    {...getStyleObj(shape.style)}
                    transform-origin={`${shape.x + shape.width / 2} ${shape.y + shape.height / 2}`}
                    href={shape.base64Url}
                />
            );
        }

        case SHAPE_TYPES.LINE: {
            const shape = s as LINE_SHAPE;
            const [[x1, y1], [x2, y2]] = shape.points;
            const transformOrigin = getTransformOrigin(shape.points);
            return (
                <line
                    {...getStyleObj(shape.style)}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    transform-origin={transformOrigin}
                />
            );
        }

        case SHAPE_TYPES.ELLIPSE: {
            const shape = s as ELLIPSE_SHAPE;
            return (
                <ellipse
                    cx={shape.x}
                    cy={shape.y}
                    rx={shape.radiusX}
                    ry={shape.radiusY}
                    {...getStyleObj(shape.style)}
                    transform-origin={`${shape.x} ${shape.y}`}
                />
            );
        }

        case SHAPE_TYPES.TEXT: {
            const shape = s as TEXT_SHAPE;
            const textMidPoint = getBoundingRectMidPoint(ref.current?.getBBox());
            return (
                <text
                    x={shape.x}
                    y={shape.y}
                    {...getStyleObj(shape.style)}
                    transform-origin={`${textMidPoint.x} ${textMidPoint.y}`}
                    fontSize={shape.fontSize}
                    fontWeight={shape.fontWeight}
                    fontStyle={shape.fontStyle}
                    font-family={`${shape.fontFamily}, ${shape.genericFontFamily}`}
                    ref={ref}
                >
                    {shape.text}
                </text>
            );
        }

        case SHAPE_TYPES.PATH: {
            const shape = s as PATH_SHAPE;
            const transformOrigin = getBoundingRectMidPoint(ref.current?.getBBox());
            return (
                <path
                    id={shape.id}
                    {...getStyleObj(shape.style)}
                    d={(function () {
                        let [p1, ...p] = shape.points || [[0, 0], [0, 0]];
                        if (p1 && p) {
                            return `M ${p1[0]} ${p1[1]} C ${p.toString()} Z`;
                        }
                        return '';
                    })()}
                    transform-origin={`${transformOrigin.x} ${transformOrigin.y}`}
                    ref={ref}
                />
            );
        }

        case SHAPE_TYPES.GROUP: {
            const shape = s as GROUP_SHAPE;
            const groupMidPoint = getBoundingRectMidPoint(ref.current?.getBBox());
            return (
                <g
                    id={shape.id}
                    {...getStyleObj(shape.style)}
                    transform-origin={`${groupMidPoint.x} ${groupMidPoint.y}`}
                    ref={ref}
                >

                </g>
            );
        }

        default: return null;
    }
}

const RenderRawSvg: React.FC<props> = function ({ shapes, isActive = false, clickHandler, index }) {
    return (
        <StyledSvg
            viewBox='0 0 1175 580'
            width='100%'
            onClick={clickHandler}
            isActive={isActive}
            data-index={index}
        >
            {
                (function () {
                    const shapesToDraw: any = [];
                    for (let id in shapes) {
                        console.log(id)
                        shapesToDraw.push(
                            <RenderRaw s={shapes[id]} />
                        )

                    }
                    return shapesToDraw;
                })()
            }
        </StyledSvg>
    );
}

export default RenderRawSvg;


const StyledSvg = styled.svg<{ isActive: boolean }>`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            background-color: white;
            outline:${props.isActive ? '2px solid red' : 'none'};
            margin:${theme.spacing(.5)}px 0;
            transition:.3s ease-in-out;
            &:hover{
                cursor: pointer;
                outline:2px solid red;
            }
        `;
    }}
`;