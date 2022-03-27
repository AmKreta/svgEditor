import React from 'react';
import styled, { css } from 'styled-components';
import Icon from './icon.component';
import { IconType } from 'react-icons';
import { THEME } from '../theme/theme';

interface props {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    title?: string;
    startIcon?: IconType;
    endIcon?: IconType;
    style?: React.CSSProperties;
    onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    iconSize?:number
};

const Button: React.FC<props> = function ({ onClick, title, startIcon, endIcon, style, onMouseDown, onMouseUp, disabled = false, onMouseLeave,iconSize }) {
    return (
        <StyledButton onClick={onClick} style={style} onMouseDown={onMouseDown} onMouseUp={onMouseUp} disabled={disabled} onMouseLeave={onMouseLeave}>
            {startIcon ? <Icon Icon={startIcon} height={iconSize || 12} width={iconSize || 12} /> : null}
            {title ? title : null}
            {endIcon ? <Icon Icon={endIcon} height={iconSize || 12} width={iconSize || 12} /> : null}
        </StyledButton>
    );
}

const StyledButton = styled.button`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            padding:4px 8px;
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            font-weight: 700;
    
        &>svg{
            &:first-child{
                margin-right:${theme.spacing(.5)}px;
            }
            &:last-child{
                margin-left:${theme.spacing(.5)}px;
            }
        }

        &:hover{
            cursor:pointer;
            opacity:.8;
        }

        &:active{
            opacity:.6;
        }
    `;
    }}
`;

export default Button;