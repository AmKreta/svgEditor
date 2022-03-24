import React from 'react';
import styled from 'styled-components';
import { State } from '../../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveShapesInfo, getHoveredShapeId, getShapesOfCurrentPage } from '../../selector/selector';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
//import { THEME } from '../../theme/theme';
import { setHoveredShape } from '../../actions/pages/pages.actions';
import { setActiveShape } from '../../actions/pages/pages.actions';
import { ACTIVE_SHAPE_INFO } from '../../actions/pages/pages.interface';


const ElementTree: React.FC<{}> = function () {
    const elements = useSelector<State, {[key: string]: AVAILABLE_SHAPES;}>(getShapesOfCurrentPage);
    const hoveredElementId = useSelector<State, string | null>(getHoveredShapeId);
    const activeShapeInfo = useSelector<State, string[]>(getActiveShapesInfo);
    const dispatch = useDispatch();

    const mouseEnterHandler = (e: React.MouseEvent<HTMLDivElement>) => {
        const id = e.currentTarget.dataset['id'];
        id && dispatch(setHoveredShape(id));
    }

    const mouseLeaveHandler = (e: React.MouseEvent<HTMLDivElement>) => {
        dispatch(setHoveredShape(null));
    }

    const clickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
        const id = e.currentTarget.dataset['id']!;
        const index = parseInt(e.currentTarget.dataset['index']!);
        dispatch(setActiveShape([id]));
    }

    return (
        <StyledDiv>
            <h4>ElementTree</h4>
            <div>
                {
                    Object.keys(elements).map((shapeId, index) => (
                        <div key={shapeId}>
                            <div
                                style={{ border: hoveredElementId === shapeId || activeShapeInfo.includes(shapeId) ? '1px solid red' : 'none' }}
                                onMouseEnter={mouseEnterHandler}
                                onMouseLeave={mouseLeaveHandler}
                                onClick={clickHandler}
                                data-id={shapeId}
                                data-index={index}
                            >
                                {elements[shapeId].name}
                            </div>
                        </div>
                    ))
                }
            </div>
        </StyledDiv>
    );
}

const StyledDiv = styled.div``;
//     ${(props) => {
//         const theme = props.theme as THEME;
//         return css`

//         `;
//     }}
// `;

export default ElementTree;