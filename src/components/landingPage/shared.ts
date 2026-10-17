import styled from 'styled-components';
import { UI_COLORS } from '../../theme/uiTokens';

export interface LANDING_ACTIONS {
    onCreateNew: () => void;
    onImport: () => void;
}

/** Primary / secondary buttons shared by the landing page sections. */
export const LandingButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    transition: background-color .15s, border-color .15s, filter .15s;
    border: 1px solid ${props => props.variant === 'primary' ? UI_COLORS.accent : UI_COLORS.inputBorder};
    background-color: ${props => props.variant === 'primary' ? UI_COLORS.accent : UI_COLORS.surface};
    color: ${props => props.variant === 'primary' ? 'white' : UI_COLORS.text};

    &:hover{
        ${props => props.variant === 'primary' ? 'filter: brightness(.94);' : `background-color: ${UI_COLORS.hover};`}
    }
    &:focus-visible{
        outline: 2px solid ${UI_COLORS.accent};
        outline-offset: 2px;
    }
    &>svg{
        flex-shrink: 0;
    }
`;
