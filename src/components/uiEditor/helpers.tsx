import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HELPERS } from '../../actions/helpers/helpers.interface';
import { getHelpers } from '../../selector/selector';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import Checkbox from '../checkBox.component';
import { toggleGridHelpers, togglePointerHelpers, toggleShapeHelpers } from '../../actions/helpers/helpers.actions';

const Helpers: React.FC = function () {
    const helpers: HELPERS = useSelector(getHelpers);
    const dispatch = useDispatch();

    function onGridHelperTOggle() {
        dispatch(toggleGridHelpers());
    }

    function onPointerHelperToggle() {
        dispatch(togglePointerHelpers());
    }

    function onShapeHelperToggle() {
        dispatch(toggleShapeHelpers());
    }

    return (
        <HelpersContainer>
            <Checkbox checked={helpers.gridHelpers} onChange={onGridHelperTOggle} label='Grid Helpers' />
            <Checkbox checked={helpers.pointerHelpers} onChange={onPointerHelperToggle} label='Pointer Helpers' />
            {/* <Checkbox checked={helpers.shapeHelpers} onChange={onShapeHelperToggle} label='Shape Helpers' /> */}
        </HelpersContainer>
    );
}

export default Helpers;

const HelpersContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            &>*{
                margin:0 4px;
            }
        `;
    }}
`;