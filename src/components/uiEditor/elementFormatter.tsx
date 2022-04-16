import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getShapeWithId, getActiveShapesInfo } from '../../selector/selector';
import { State } from '../../store/store';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import RectangleEditor from '../../shapeEditor/rectangleEditor';
import { SHAPE_TYPES } from '../../utils/constant';
import CircleEditor from '../../shapeEditor/circleEditor';
import LineEditor from '../../shapeEditor/lineEditor';
import PolygonEditor from '../../shapeEditor/polygonEditor';
import PolylineEditor from '../../shapeEditor/polylineEditor';
import EllipseEditor from '../../shapeEditor/ellipseEditor';
import SvgTextEditor from '../../shapeEditor/SvgTextEditor';
import ImageEditor from '../../shapeEditor/imageEditor';
import GroupEditor from '../../shapeEditor/groupEditor';
import PathEditor from '../../shapeEditor/pathEditor';
import SvgContainerEditor from '../../shapeEditor/svgEditor';

const ElementFormatter: React.FC<{}> = function () {

    // edits dimensions, add filters and edit styles, add masks, add pattern fills,
    const activeShapesInfo = useSelector<State, string[]>(getActiveShapesInfo);
    const shapeWithId = useSelector<State, (id: string) => AVAILABLE_SHAPES>(getShapeWithId);

    return (
        <StyledDiv>
            <h4>ElementFormatter</h4>
            {
                activeShapesInfo?.length
                    ? (
                        <div className='formatterList'>
                            {
                                activeShapesInfo.map((shapeId, idx) => {
                                    const shape = shapeWithId(shapeId);
                                    switch (shape.type) {
                                        case SHAPE_TYPES.CIRCLE: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <CircleEditor shape={shape} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.RECTANGLE: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <RectangleEditor shape={shape} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.LINE: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <LineEditor shape={shape} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.POLYGON: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <PolygonEditor shape={shape} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.POLYLINE: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <PolylineEditor shape={shape} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.ELLIPSE: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <EllipseEditor shape={shape} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.TEXT: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <SvgTextEditor shape={shape} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.IMAGE: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <ImageEditor shape={shape} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.GROUP: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <GroupEditor shape={shape} />
                                            </details>
                                        )

                                        case SHAPE_TYPES.PATH: return (
                                            <details key={shape.id} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <PathEditor shape={shape} />
                                            </details>
                                        )

                                        default: return null;
                                    }
                                })
                            }
                        </div>
                    )
                    :<SvgContainerEditor />
            }
        </StyledDiv>
    );
}

const StyledDiv = styled.div`
    grid-area:elementformatter;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    height:100%;

    &>.formatterList{
        flex-grow: 1;
        overflow-y: scroll;
        margin-top:8px;

        &>details>summary{
            text-align: left;
            margin: 4px;
        }
    }
`;
export default ElementFormatter;