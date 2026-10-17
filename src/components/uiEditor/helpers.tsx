import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HELPERS } from '../../actions/helpers/helpers.interface';
import { getHelpers } from '../../selector/selector';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { BsBullseye, BsGrid3X3 } from 'react-icons/bs';
import { UI_COLORS } from '../../theme/uiTokens';
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
            <button className={helpers.gridHelpers ? 'on' : ''} aria-pressed={helpers.gridHelpers} onClick={onGridHelperTOggle}>
                <BsGrid3X3 />
                <span>Grid</span>
            </button>
            <button className={helpers.pointerHelpers ? 'on' : ''} aria-pressed={helpers.pointerHelpers} onClick={onPointerHelperToggle}>
                <BsBullseye />
                <span>Pointer guides</span>
            </button>
            {/* <Checkbox checked={helpers.shapeHelpers} onChange={onShapeHelperToggle} label='Shape Helpers' /> */}
        </HelpersContainer>
    );
}

export default Helpers;

const HelpersContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing(1)}px;

            &>button.on{
                border-color: ${UI_COLORS.accent} !important;
                background-color: ${UI_COLORS.accentSoft} !important;
                color: ${UI_COLORS.accent} !important;
            }
        `;
    }}
`;