import React from 'react';
import styled, { css } from 'styled-components';
import { State } from '../../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveShapesInfo, getHoveredShapeId, getShapesOfCurrentPage } from '../../selector/selector';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import { THEME } from '../../theme/theme';
import { setHoveredShape } from '../../actions/pages/pages.actions';
import { setActiveShape } from '../../actions/pages/pages.actions';
import { ACTIVE_SHAPE_INFO } from '../../actions/pages/pages.interface';


const ElementTree: React.FC<{}> = function () {
    const elements = useSelector<State, Array<AVAILABLE_SHAPES>>(getShapesOfCurrentPage);
    const hoveredElementId = useSelector<State, string | null>(getHoveredShapeId);
    const activeShapeInfo = useSelector<State, ACTIVE_SHAPE_INFO>(getActiveShapesInfo);
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
        dispatch(setActiveShape([{ id, index }]));
    }

    return (
        <StyledDiv>
            <h4>ElementTree</h4>
            <div>
                {
                    elements.map((item, index) => (
                        <div key={item.id}>
                            <div
                                style={{ border: hoveredElementId === item.id || activeShapeInfo.find(shapeInfo => shapeInfo.id === item.id) ? '1px solid red' : 'none' }}
                                onMouseEnter={mouseEnterHandler}
                                onMouseLeave={mouseLeaveHandler}
                                onClick={clickHandler}
                                data-id={item.id}
                                data-index={index}
                            >
                                {item.name}
                            </div>
                        </div>
                    ))
                }
            </div>
        </StyledDiv>
    );
}

const StyledDiv = styled.div`
    ${(props) => {
        const theme = props.theme as THEME;
        return css`
            
        `;
    }}
`;

export default ElementTree;