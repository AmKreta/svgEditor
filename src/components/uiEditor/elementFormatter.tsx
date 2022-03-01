import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getShapeAtIndex, getActiveShapesInfo } from '../../selector/selector';
import { State } from '../../store/store';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import { ACTIVE_SHAPE_INFO } from '../../actions/pages/pages.interface';
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

const ElementFormatter: React.FC<{}> = function () {

    // edits dimensions, add filters and edit styles, add masks, add pattern fills,
    const activeShapesInfo = useSelector<State, ACTIVE_SHAPE_INFO>(getActiveShapesInfo);
    const shapeAtIndex = useSelector<State, (index: number) => AVAILABLE_SHAPES>(getShapeAtIndex);

    return (
        <StyledDiv>
            <h4>ElementFormatter</h4>
            {
                activeShapesInfo?.length
                    ? (
                        <div className='formatterList'>
                            {
                                activeShapesInfo.map((shapeInfo, idx) => {
                                    const index = shapeInfo.index;
                                    const shape = shapeAtIndex(index);
                                    switch (shape.type) {
                                        case SHAPE_TYPES.CIRCLE: return (
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <CircleEditor shape={shape} index={index} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.RECTANGLE: return (
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <RectangleEditor shape={shape} index={index} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.LINE: return (
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <LineEditor shape={shape} index={index} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.POLYGON: return (
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <PolygonEditor shape={shape} index={index} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.POLYLINE: return (
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <PolylineEditor shape={shape} index={index} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.ELLIPSE: return (
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <EllipseEditor shape={shape} index={index} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.TEXT: return (
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <SvgTextEditor shape={shape} index={index} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.IMAGE: return (
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <ImageEditor shape={shape} index={index} />
                                            </details>
                                        );

                                        case SHAPE_TYPES.GROUP:return(
                                            <details key={index} open={idx === 0}>
                                                <summary>{shape.name}</summary>
                                                <GroupEditor shape={shape} index={index} />
                                            </details>
                                        )

                                        default: return null;
                                    }
                                })
                            }
                        </div>
                    )
                    : null
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