import React from 'react';
import { useSelector } from 'react-redux';
import { getShapesOfCurrentPage } from '../selector/selector';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { GROUP_SHAPE } from '../shapes/group';
import { State } from '../store/store';
import { SHAPE_TYPES } from '../utils/constant';
import BaseShapeEditor, { EditorProps } from './baseShapeEditor';
import CircleEditor from './circleEditor';
import EllipseEditor from './ellipseEditor';
import ImageEditor from './imageEditor';
import LineEditor from './lineEditor';
import PathEditor from './pathEditor';
import PolygonEditor from './polygonEditor';
import PolylineEditor from './polylineEditor';
import RectangleEditor from './rectangleEditor';
import SvgTextEditor from './SvgTextEditor';

const GroupEditor: React.FC<EditorProps> = function ({ shape }) {
    const shapesOfCurrentPage = useSelector<State, { [key: string]: AVAILABLE_SHAPES; }>(getShapesOfCurrentPage);

    return (
        <>
            {
                (shape as GROUP_SHAPE).children.map(shapeId => {
                    const childShape = shapesOfCurrentPage[shapeId];
                    return (
                        <details key={childShape.id} style={{ textAlign: 'left' }}>
                            <summary>{childShape.name}</summary>
                            {
                                (
                                    function () {
                                        switch (childShape.type) {
                                            case SHAPE_TYPES.CIRCLE: return <CircleEditor shape={childShape} />;
                                            case SHAPE_TYPES.ELLIPSE: return <EllipseEditor shape={childShape} />;
                                            case SHAPE_TYPES.IMAGE: return <ImageEditor shape={childShape} />;
                                            case SHAPE_TYPES.LINE: return <LineEditor shape={childShape} />;
                                            case SHAPE_TYPES.PATH: return <PathEditor shape={childShape} />;
                                            case SHAPE_TYPES.POLYGON: return <PolygonEditor shape={childShape} />;
                                            case SHAPE_TYPES.POLYLINE: return <PolylineEditor shape={childShape} />;
                                            case SHAPE_TYPES.RECTANGLE: return <RectangleEditor shape={childShape} />;
                                            case SHAPE_TYPES.TEXT: return <SvgTextEditor shape={childShape} />;
                                            case SHAPE_TYPES.GROUP: {
                                                const Editor = BaseShapeEditor(GroupEditor);
                                                return <Editor shape={childShape} />
                                            }
                                            default: return null;
                                        }
                                    }
                                )()
                            }
                        </details>
                    );
                })
            }
        </>
    )
}

export default BaseShapeEditor(GroupEditor);