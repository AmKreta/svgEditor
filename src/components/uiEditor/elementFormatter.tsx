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
import CutsceneProperties from '../timeline/cutsceneProperties';
import { getTimelineUi } from '../../selector/selector';
import { EditorProps } from '../../shapeEditor/baseShapeEditor';

const SHAPE_EDITORS: Partial<Record<SHAPE_TYPES, React.ComponentType<EditorProps>>> = {
    [SHAPE_TYPES.CIRCLE]: CircleEditor,
    [SHAPE_TYPES.RECTANGLE]: RectangleEditor,
    [SHAPE_TYPES.LINE]: LineEditor,
    [SHAPE_TYPES.POLYGON]: PolygonEditor,
    [SHAPE_TYPES.POLYLINE]: PolylineEditor,
    [SHAPE_TYPES.ELLIPSE]: EllipseEditor,
    [SHAPE_TYPES.TEXT]: SvgTextEditor,
    [SHAPE_TYPES.IMAGE]: ImageEditor,
    [SHAPE_TYPES.GROUP]: GroupEditor,
    [SHAPE_TYPES.PATH]: PathEditor,
};

const ElementFormatter: React.FC<{}> = function () {

    // edits dimensions, add filters and edit styles, add masks, add pattern fills,
    const activeShapesInfo = useSelector<State, string[]>(getActiveShapesInfo);
    const shapeWithId = useSelector<State, (id: string) => AVAILABLE_SHAPES>(getShapeWithId);
    const isEditingCutscene = Boolean(useSelector(getTimelineUi).editing);

    return (
        <StyledDiv>
            <div className='panelHeader'>
                <span className='title'>{isEditingCutscene && activeShapesInfo?.length ? 'Properties' : isEditingCutscene ? 'Cutscene' : 'Canvas'}</span>
                {
                    activeShapesInfo?.length > 1
                        ? <span className='badge'>{activeShapesInfo.length} selected</span>
                        : null
                }
            </div>
            <CutsceneProperties />
            {
                !isEditingCutscene
                    ? <p className='cutsceneHint'>The canvas is showing the animation. Select a cutscene in the timeline to edit its shapes.</p>
                    : !activeShapesInfo?.length
                        ? <p className='cutsceneHint'>Select a shape on the canvas to change it in this cutscene, or draw a new one to bring it in.</p>
                        : null
            }
            {
                isEditingCutscene && activeShapesInfo?.length
                    ? (
                        <div className='formatterList'>
                            {
                                activeShapesInfo.map((shapeId, idx) => {
                                    const shape = shapeWithId(shapeId);
                                    const Editor = SHAPE_EDITORS[shape.type];
                                    if (!Editor) return null;
                                    return (
                                        <details key={shape.id} open={idx === 0}>
                                            <summary>
                                                <span className='shapeName'>{shape.name}</span>
                                                <span className='shapeType'>{shape.type === SHAPE_TYPES.IMAGE ? 'Image' : shape.type}</span>
                                            </summary>
                                            <Editor shape={shape} />
                                        </details>
                                    );
                                })
                            }
                        </div>
                    )
                    : <SvgContainerEditor />
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

    &>.panelHeader{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #e3e5e8;

        &>.title{
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
        }

        &>.badge{
            font-size: 11px;
            font-weight: 500;
            color: #3b82f6;
            background-color: #eff6ff;
            padding: 2px 8px;
            border-radius: 999px;
        }
    }

    &>.cutsceneHint{
        margin: 8px 16px;
        color: #6b7280;
        font-size: 12px;
        line-height: 1.4;
        text-align: left;
    }

    &>.formatterList{
        flex-grow: 1;
        overflow-y: auto;
        padding: 4px 0;

        & details>summary{
            display: flex;
            align-items: center;
            gap: 8px;
            list-style: none;
            cursor: pointer;
            margin: 4px 8px 0;
            padding: 6px 8px;
            border-radius: 6px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #1f2937;

            &::-webkit-details-marker{
                display: none;
            }
            &::before{
                content: '';
                flex-shrink: 0;
                width: 0;
                height: 0;
                border-top: 4px solid transparent;
                border-bottom: 4px solid transparent;
                border-left: 5px solid #6b7280;
                transition: transform .15s ease-in-out;
            }
            &:hover{
                background-color: #f3f4f6;
            }

            &>.shapeName{
                flex-grow: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            &>.shapeType{
                flex-shrink: 0;
                font-size: 10px;
                font-weight: 500;
                letter-spacing: .04em;
                text-transform: uppercase;
                color: #6b7280;
                background-color: #f3f4f6;
                padding: 2px 6px;
                border-radius: 4px;
            }
        }

        & details[open]>summary::before{
            transform: rotate(90deg);
        }
    }
`;
export default ElementFormatter;