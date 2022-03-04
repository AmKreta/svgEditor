import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getActiveShapesInfo, getActiveTool, getHoveredShapeId, getShapesOfCurrentPage, getContextMenuState, getHelpers } from '../../selector/selector';
import { State } from '../../store/store';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import { multiPointShpes, SHAPE_TYPES } from '../../utils/constant';
import { useDispatch } from 'react-redux';
import { addShape, setActiveShape, toggleContextMenu } from '../../actions/pages/pages.actions';
import DrawShapes from './drawShape';
import ShapeSelector, { SHAPE_SELECTOR_PROPS, initialShapeSelectorProps } from './shapeSelector';
import { areColliding } from '../../utils/utils';
import ContextMenu from './contextMenu';
import { CONTEXT_MENU_INTERFACE, ACTIVE_SHAPE_INFO } from '../../actions/pages/pages.interface';
import PointsArrayFigureViewer from './pointsArrayFigureViewer';
import Filters from './filters';
import Gradients from './gradients';
import FillColors from './fillColors';
import { isEqual } from 'lodash';
import { HELPERS } from '../../actions/helpers/helpers.interface';
import PointerHelper from './pointerHelper';
import GridHelper from './gridHelper';

const SvgEditor: React.FC<{}> = function () {
    const shapesOfCurrentPage = useSelector<State, Array<AVAILABLE_SHAPES>>(getShapesOfCurrentPage);
    const activeTool = useSelector<State, SHAPE_TYPES>(getActiveTool, isEqual);
    const activeShapes = useSelector<State, ACTIVE_SHAPE_INFO>(getActiveShapesInfo, isEqual);
    const hoveredShapeId = useSelector<State, string | null>(getHoveredShapeId);
    const helpers = useSelector<State, HELPERS>(getHelpers, isEqual);

    const [shapeSelectorProps, setShapeSelectorProps] = useState<SHAPE_SELECTOR_PROPS>(initialShapeSelectorProps);
    const [pointsArray, setPointsArray] = useState<Array<[number, number]>>([]);
    const contextMenu = useSelector<State, CONTEXT_MENU_INTERFACE>(getContextMenuState);
    const svgEditorRef = useRef<SVGSVGElement>(null);

    const dispatch = useDispatch();


    function mouseDownHandler(e: React.MouseEvent<SVGSVGElement>) {
        e.preventDefault();
        e.stopPropagation();

        const element = e.currentTarget as SVGElement;
        const boundingRect = element.getBoundingClientRect();
        let x = e.clientX - boundingRect.x;
        let y = e.clientY - boundingRect.y;

        if (e.buttons === 2) {
            if ((activeTool === SHAPE_TYPES.POLYGON || activeTool === SHAPE_TYPES.POLYLINE) && pointsArray.length >= 2) {
                // if active tool is polygon, polyline
                dispatch(addShape({ shape: activeTool, x, y, pointsArray }));
                setPointsArray([]);
            }
            else {
                // right click
                // show context menu
                dispatch(toggleContextMenu({ x, y }));
            }
            return;
        }

        if (contextMenu.show) {
            // if context menu is already geting displayed
            // hide it on click
            dispatch(toggleContextMenu());
            return;
        }


        // check if there is any active shape, empty active shape array
        // if polygon , polyline or line are selected , add points to  points array
        // if any  tool is selected other than PAN, add active tool shape
        // shape selected logic

        if (activeShapes.length) {
            // if not clicked on any shape (clicked on svg canvas)
            // removed all elements from active shape array
            dispatch(setActiveShape([]));
        }

        else if (multiPointShpes.includes(activeTool)) {
            // adding points to array
            if (activeTool === SHAPE_TYPES.LINE && pointsArray.length === 1) {
                dispatch(addShape({ shape: activeTool, x, y, pointsArray: [...pointsArray, [x, y]] }));
                setPointsArray([]);
            }
            else if (activeTool === SHAPE_TYPES.PATH) {
                let timeout: any = null;
                element.onmousemove = function (ev) {
                    if (!timeout) {
                        timeout = setTimeout(function () {
                            const x1 = ev.clientX - boundingRect.x, y1 = ev.clientY - boundingRect.y;
                            setPointsArray(prevState => [...prevState, [x1, y1]]);
                            clearTimeout(timeout);
                            timeout = null;
                        }, 20);
                    }
                }
            }
            else {
                setPointsArray(prevState => ([...prevState, [x, y]]));
            }
        }

        else if (activeTool !== SHAPE_TYPES.PAN) {
            // id active tool is not pan 
            // add shape according to the selected tool
            dispatch(addShape({ shape: activeTool, x, y, pointsArray: [[x, y]] }));
        }

        else {
            // shape selector logic
            // if clicked on any tool or shape selector is in use
            // select shapes
            setShapeSelectorProps(prevState => ({ ...prevState, show: true, x, y }));
            e.currentTarget.onmousemove = ev => {
                const x1 = ev.clientX - boundingRect.x, y1 = ev.clientY - boundingRect.y;
                const dx = x1 - x, dy = y1 - y;
                x = x1; y = y1;
                setShapeSelectorProps(prevState => ({
                    ...prevState,
                    height: prevState.height + dy,
                    width: prevState.width + dx
                }));
            }
        }
    }

    const mouseUpHandler = (e: React.MouseEvent<SVGElement>) => {
        e.currentTarget.onmousemove = null;

        if (activeTool === SHAPE_TYPES.PATH && pointsArray.length) {
            dispatch(addShape({ shape: activeTool, pointsArray, x: 0, y: 0 }));
            setPointsArray([]);
            return;
        }

        if (shapeSelectorProps.show) {
            const selectedShapes: { id: string, index: number }[] = [];
            const selector = (document.querySelector('#Shape-Selector') as SVGPolygonElement).getBoundingClientRect();
            setShapeSelectorProps(initialShapeSelectorProps);
            e.currentTarget.childNodes.forEach((node) => {
                const shape = (node as SVGElement).getBoundingClientRect();
                if (areColliding(selector, shape)) {
                    const el = node as SVGElement;
                    if (el.id !== 'Shape-Selector') {
                        selectedShapes.push({
                            id: el.id,
                            index: parseInt(el.dataset['index']!)
                        });
                    }
                }
            });
            selectedShapes.length && dispatch(setActiveShape(selectedShapes));
        }
    }

    return (
        <SvgContainer onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}>
            {
                helpers.gridHelpers
                    ? <GridHelper />
                    : null
            }
            <StyledSvg height='100%' width='100%' onMouseDown={mouseDownHandler} onMouseUp={mouseUpHandler} id='svgEditor' ref={svgEditorRef}>
                <defs>
                    <Filters />
                    <Gradients />
                    <FillColors />
                </defs>
                {
                    helpers.pointerHelpers
                        ? <PointerHelper svgEditorRef={svgEditorRef} />
                        : null
                }
                {
                    (
                        function () {
                            const shapesToDraw = [];
                            for (let i = 0; i < shapesOfCurrentPage.length; i++) {
                                if (!activeShapes.find(shape => i === shape.index)) {
                                    shapesToDraw.push(
                                        <DrawShapes
                                            shape={shapesOfCurrentPage[i]}
                                            index={i}
                                            isActive={false}
                                            hovered={hoveredShapeId === shapesOfCurrentPage[i].id}
                                            key={shapesOfCurrentPage[i].id}
                                        />
                                    )
                                }
                            }
                            // rendering active shape at last so that there is no 
                            // problem in moving active element
                            activeShapes.forEach((shape, index) => {
                                shapesToDraw.push(
                                    <DrawShapes
                                        shape={shapesOfCurrentPage[shape.index]}
                                        index={shape.index}
                                        isActive={true}
                                        hovered={hoveredShapeId === shape.id}
                                        key={shape.id}
                                    />
                                )
                            })
                            return shapesToDraw;
                        }
                    )()
                }
                {
                    pointsArray.length && multiPointShpes.includes(activeTool)
                        ? <PointsArrayFigureViewer
                            pointsArray={pointsArray}
                            type={activeTool}
                        />
                        : null
                }
                <ShapeSelector
                    x={shapeSelectorProps.x}
                    y={shapeSelectorProps.y}
                    height={shapeSelectorProps.height}
                    width={shapeSelectorProps.width}
                    show={shapeSelectorProps.show}
                />
            </StyledSvg>
            <ContextMenu />
        </SvgContainer>
    );
}

const StyledSvg = styled.svg`
    min-width: 0;
    z-index: 2;
    background-color: transparent;
    position: absolute;
    top:0;
    left: 0;
`;

const SvgContainer = styled.div`
    grid-area:svgEditor;
    min-width: 0;
    height:100%;
    width:100%;
    position:relative;
    overflow: scroll;
`;

export default SvgEditor;