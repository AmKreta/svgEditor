import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getActiveShapesInfo, getActiveTool, getHoveredShapeId, getShapesOfCurrentPage, getContextMenuState, getHelpers, getSvgStyle } from '../../selector/selector';
import { State } from '../../store/store';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import { MIN_PATH_POINT_DISTANCE, multiPointShpes, POINTER_BUTTON, SHAPE_TYPES } from '../../utils/constant';
import { useDispatch } from 'react-redux';
import { addShape, formatActiveShape, setActiveShape, toggleContextMenu } from '../../actions/pages/pages.actions';
import DrawShapes from './drawShape';
import ShapeSelector, { SHAPE_SELECTOR_PROPS, initialShapeSelectorProps } from './shapeSelector';
import { areColliding } from '../../utils/utils';
import ContextMenu from './contextMenu';
import { CONTEXT_MENU_INTERFACE } from '../../actions/pages/pages.interface';
import PointsArrayFigureViewer from './pointsArrayFigureViewer';
import Filters from './filters';
import Gradients from './gradients';
import FillColors from './fillColors';
import { isEqual } from 'lodash';
import { HELPERS } from '../../actions/helpers/helpers.interface';
import PointerHelper from './pointerHelper';
import GridHelper from './gridHelper';
import { useRAFThrottled, useSvgPointerPosition, useTransformMode } from '../../hooks';
import { eventToSvgPoint, pointDistance, tryReleasePointerCapture, trySetPointerCapture } from '../../utils/svgCoords';
import { BOX_DRAWN_SHAPES, getDrawnShapeGeometry } from '../../utils/shapeGeometry';
import { CURSORS } from '../../utils/cursor';
import SelectionOverlay from './selectionOverlay';

type CanvasGesture = 'none' | 'path' | 'marquee' | 'create' | 'line';

/** Pointer travel (svg units) before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 3;

interface CreateGesture {
    tool: SHAPE_TYPES;
    start: { x: number, y: number };
    /** set once the drag passes DRAG_THRESHOLD and the shape is added */
    shapeId: string | null;
}

const SvgEditor: React.FC<{}> = function () {
    const shapesOfCurrentPage = useSelector<State, { [key: string]: AVAILABLE_SHAPES; }>(getShapesOfCurrentPage);
    const activeTool = useSelector<State, SHAPE_TYPES>(getActiveTool, isEqual);
    const activeShapes = useSelector<State, string[]>(getActiveShapesInfo, isEqual);
    const hoveredShapeId = useSelector<State, string | null>(getHoveredShapeId);
    const helpers = useSelector<State, HELPERS>(getHelpers, isEqual);
    const svgStyle = useSelector(getSvgStyle);

    const [shapeSelectorProps, setShapeSelectorProps] = useState<SHAPE_SELECTOR_PROPS>(initialShapeSelectorProps);
    const [pointsArray, setPointsArray] = useState<Array<[number, number]>>([]);
    const pointsArrayRef = useRef<Array<[number, number]>>([]);
    const contextMenu = useSelector<State, CONTEXT_MENU_INTERFACE>(getContextMenuState);
    const svgEditorRef = useRef<SVGSVGElement>(null);
    const gestureRef = useRef<CanvasGesture>('none');
    const pendingPathPoint = useRef<[number, number] | null>(null);
    const marqueeRef = useRef<SHAPE_SELECTOR_PROPS>(initialShapeSelectorProps);
    const lastMarqueePoint = useRef({ x: 0, y: 0 });
    const readSvgPoint = useSvgPointerPosition(svgEditorRef);
    const createRef = useRef<CreateGesture | null>(null);
    const pendingCreatePoint = useRef<{ x: number, y: number, shiftKey: boolean } | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const dispatch = useDispatch();
    useTransformMode();

    const flushPathPoint = useRAFThrottled(() => {
        const next = pendingPathPoint.current;
        if (!next) {
            return;
        }
        pendingPathPoint.current = null;
        const last = pointsArrayRef.current[pointsArrayRef.current.length - 1];
        if (last && pointDistance(last, next) < MIN_PATH_POINT_DISTANCE) {
            return;
        }
        const nextPoints = [...pointsArrayRef.current, next];
        pointsArrayRef.current = nextPoints;
        setPointsArray(nextPoints);
    });

    const flushMarquee = useRAFThrottled(() => {
        setShapeSelectorProps({ ...marqueeRef.current });
    });

    const flushCreate = useRAFThrottled(() => {
        const gesture = createRef.current;
        const point = pendingCreatePoint.current;
        if (!gesture || !point) {
            return;
        }
        if (!gesture.shapeId) {
            if (pointDistance(gesture.start, point) < DRAG_THRESHOLD) {
                return;
            }
            const action = addShape({ shape: gesture.tool, x: gesture.start.x, y: gesture.start.y });
            if (!action) {
                return;
            }
            dispatch(action);
            gesture.shapeId = action.payload.id;
        }
        dispatch(formatActiveShape({
            id: gesture.shapeId,
            properties: getDrawnShapeGeometry(gesture.tool, gesture.start, point, point.shiftKey)
        }));
    });

    function pointerDownHandler(e: React.PointerEvent<SVGSVGElement>) {
        e.preventDefault();
        e.stopPropagation();

        const element = e.currentTarget;
        const { x, y } = readSvgPoint(e);

        if (e.button === POINTER_BUTTON.SECONDARY) {
            if ((activeTool === SHAPE_TYPES.POLYGON || activeTool === SHAPE_TYPES.POLYLINE) && pointsArray.length >= 2) {
                dispatch(addShape({ shape: activeTool, x, y, pointsArray }));
                pointsArrayRef.current = [];
                setPointsArray([]);
            }
            else {
                dispatch(toggleContextMenu({ x, y }));
            }
            return;
        }

        if (e.button !== POINTER_BUTTON.PRIMARY) {
            return;
        }

        if (contextMenu.show) {
            dispatch(toggleContextMenu());
            return;
        }

        if (activeShapes.length) {
            dispatch(setActiveShape([]));
        }

        if (multiPointShpes.includes(activeTool)) {
            if (activeTool === SHAPE_TYPES.LINE && pointsArray.length === 1) {
                dispatch(addShape({ shape: activeTool, x, y, pointsArray: [...pointsArray, [x, y]] }));
                pointsArrayRef.current = [];
                setPointsArray([]);
            }
            else if (activeTool === SHAPE_TYPES.LINE) {
                // drag out a line; a plain click falls back to click-to-place the end point
                gestureRef.current = 'line';
                pointsArrayRef.current = [[x, y]];
                setPointsArray([[x, y]]);
                trySetPointerCapture(element, e.pointerId);
            }
            else if (activeTool === SHAPE_TYPES.PATH) {
                gestureRef.current = 'path';
                pendingPathPoint.current = null;
                pointsArrayRef.current = [[x, y]];
                setPointsArray([[x, y]]);
                trySetPointerCapture(element, e.pointerId);
            }
            else {
                const nextPoints = [...pointsArrayRef.current, [x, y]] as Array<[number, number]>;
                pointsArrayRef.current = nextPoints;
                setPointsArray(nextPoints);
            }
        }

        else if (BOX_DRAWN_SHAPES.includes(activeTool)) {
            gestureRef.current = 'create';
            createRef.current = { tool: activeTool, start: { x, y }, shapeId: null };
            pendingCreatePoint.current = null;
            setIsCreating(true);
            trySetPointerCapture(element, e.pointerId);
        }

        else if (activeTool !== SHAPE_TYPES.PAN) {
            dispatch(addShape({ shape: activeTool, x, y, pointsArray: [[x, y]] }));
        }

        else {
            gestureRef.current = 'marquee';
            lastMarqueePoint.current = { x, y };
            marqueeRef.current = { show: true, x, y, height: 0, width: 0 };
            setShapeSelectorProps(marqueeRef.current);
            trySetPointerCapture(element, e.pointerId);
        }
    }

    const pointerMoveHandler = (e: React.PointerEvent<SVGSVGElement>) => {
        if (gestureRef.current === 'none') {
            return;
        }

        const { x: x1, y: y1 } = eventToSvgPoint(svgEditorRef.current, e);

        if (gestureRef.current === 'path') {
            pendingPathPoint.current = [x1, y1];
            flushPathPoint();
            return;
        }

        if (gestureRef.current === 'create') {
            pendingCreatePoint.current = { x: x1, y: y1, shiftKey: e.shiftKey };
            flushCreate();
            return;
        }

        if (gestureRef.current === 'marquee') {
            const dx = x1 - lastMarqueePoint.current.x;
            const dy = y1 - lastMarqueePoint.current.y;
            lastMarqueePoint.current = { x: x1, y: y1 };
            marqueeRef.current = {
                ...marqueeRef.current,
                height: marqueeRef.current.height + dy,
                width: marqueeRef.current.width + dx
            };
            flushMarquee();
        }
    }

    const pointerUpHandler = (e: React.PointerEvent<SVGSVGElement>) => {
        const element = e.currentTarget;
        tryReleasePointerCapture(element, e.pointerId);

        if (gestureRef.current === 'path') {
            flushPathPoint.flush();
            gestureRef.current = 'none';
            pendingPathPoint.current = null;
            const drawnPoints = pointsArrayRef.current;
            if (drawnPoints.length) {
                dispatch(addShape({ shape: activeTool, pointsArray: drawnPoints, x: 0, y: 0 }));
            }
            pointsArrayRef.current = [];
            setPointsArray([]);
            return;
        }

        if (gestureRef.current === 'create') {
            flushCreate.flush();
            gestureRef.current = 'none';
            const gesture = createRef.current;
            createRef.current = null;
            pendingCreatePoint.current = null;
            setIsCreating(false);
            if (gesture && !gesture.shapeId) {
                // plain click: add the shape at its default size
                dispatch(addShape({ shape: gesture.tool, x: gesture.start.x, y: gesture.start.y }));
            }
            return;
        }

        if (gestureRef.current === 'line') {
            gestureRef.current = 'none';
            const start = pointsArrayRef.current[0];
            const { x, y } = eventToSvgPoint(svgEditorRef.current, e);
            if (start && pointDistance(start, [x, y]) >= DRAG_THRESHOLD) {
                dispatch(addShape({ shape: SHAPE_TYPES.LINE, x, y, pointsArray: [start, [x, y]] }));
                pointsArrayRef.current = [];
                setPointsArray([]);
            }
            return;
        }

        if (gestureRef.current === 'marquee') {
            flushMarquee.flush();
            gestureRef.current = 'none';
            const selectedShapes: string[] = [];
            const selector = (document.querySelector('#Shape-Selector') as SVGPolygonElement | null)?.getBoundingClientRect();
            const currentMarquee = marqueeRef.current;
            setShapeSelectorProps(initialShapeSelectorProps);
            marqueeRef.current = initialShapeSelectorProps;
            if (selector && currentMarquee.show) {
                element.childNodes.forEach((node) => {
                    const shape = (node as SVGElement).getBoundingClientRect();
                    if (areColliding(selector, shape)) {
                        const el = node as SVGElement;
                        if (el.id && el.id !== 'Shape-Selector') {
                            selectedShapes.push(el.id);
                        }
                    }
                });
                selectedShapes.length && dispatch(setActiveShape(selectedShapes));
            }
        }
    }

    return (
        <SvgContainer onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }} style={{ overflow: 'scroll' }}>
            {
                helpers.gridHelpers
                    ? <GridHelper />
                    : null
            }
            <StyledSvg
                height={`${svgStyle.height}%`}
                width={`${svgStyle.width}%`}
                onPointerDown={pointerDownHandler}
                onPointerMove={pointerMoveHandler}
                onPointerUp={pointerUpHandler}
                onPointerCancel={pointerUpHandler}
                id='svgEditor'
                data-tool={activeTool}
                ref={svgEditorRef}
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                version='1.1'
                style={{ backgroundColor: svgStyle.backgroundColor, backgroundImage: 'url("#gridHelper")' }}
            >
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
                            const shapesToDraw: any = [];
                            for (let id in shapesOfCurrentPage) {
                                if (shapesOfCurrentPage[id].render && !activeShapes.find(shapeId => shapeId === id)) {
                                    shapesToDraw.push(
                                        <DrawShapes
                                            shape={shapesOfCurrentPage[id]}
                                            isActive={false}
                                            hovered={hoveredShapeId === id}
                                            key={id}
                                        />
                                    )
                                }
                            }
                            activeShapes.forEach((shapeId) => {
                                if (shapesOfCurrentPage[shapeId].render) {
                                    shapesToDraw.push(
                                        <DrawShapes
                                            shape={shapesOfCurrentPage[shapeId]}
                                            isActive={true}
                                            hovered={hoveredShapeId === shapeId}
                                            key={shapeId}
                                        />
                                    )
                                }
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
                            svgEditorRef={svgEditorRef}
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
            <SelectionOverlay svgEditorRef={svgEditorRef} hidden={isCreating} />
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
    touch-action: none;

    /* drawing tools: every press starts a new shape, even on top of another one */
    cursor: crosshair;
    &:not([data-tool='${SHAPE_TYPES.PAN}']) *{
        cursor: inherit;
    }
    &[data-tool='${SHAPE_TYPES.TEXT}']{
        cursor: text;
    }

    /* select tool: pointer to pick a shape, grab to drag the selected one */
    &[data-tool='${SHAPE_TYPES.PAN}']{
        cursor: default;
        &>.inactive, &>.hovered{
            cursor: pointer;
        }
        &>.active{
            cursor: grab;
        }
    }
    body[data-transform-mode='SCALE'] &[data-tool='${SHAPE_TYPES.PAN}']>:is(.active, .inactive, .hovered){
        cursor: ${CURSORS.SCALE};
    }
    body[data-transform-mode='ROTATE'] &[data-tool='${SHAPE_TYPES.PAN}']>:is(.active, .inactive, .hovered){
        cursor: ${CURSORS.ROTATE};
    }
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
