import React from 'react';
import styled from 'styled-components';
import Icon from './icon.component';
import { IconType } from 'react-icons';

interface props {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    title?: string;
    startIcon?: IconType;
    endIcon?: IconType;
    style?: React.CSSProperties;
    onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const Button: React.FC<props> = function ({ onClick, title, startIcon, endIcon, style, onMouseDown, onMouseUp }) {
    return (
        <StyledButton onClick={onClick} style={style} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
            {startIcon ? <Icon Icon={startIcon} height={12} width={12} /> : null}
            {title ? title : null}
            {endIcon ? <Icon Icon={endIcon} height={12} width={12} /> : null}
        </StyledButton>
    );
}

const StyledButton = styled.button`
    padding:4px 8px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    &:hover{
        cursor:pointer;
        opacity:.8;
    }
    &:active{
        opacity:.6;
    }
`;

export default Button;