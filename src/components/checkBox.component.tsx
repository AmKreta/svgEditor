import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../theme/theme';

interface props {
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    label?: string;
}

const Checkbox: React.FC<props> = function ({ checked, onChange, label }) {
    return (
        <CheckBoxContainer>
            <input type='checkbox' checked={checked} onChange={onChange} />
            {
                label
                    ? <label>{label}</label>
                    : null
            }
        </CheckBoxContainer>
    );
}

export default Checkbox;

const CheckBoxContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            display: inline-flex;
            align-items: center;
            &>input[type='checkbox']{
                margin-right:${theme.spacing(.5)}px;
                &:hover{
                    cursor: pointer;
                }
            }

            &:not(:first-child):not(:last-child){
                margin:0 ${theme.spacing(2)}px;
            }

            &:hover{
                &>label{
                    text-decoration: underline;
                }
            }
        `;
    }}
`;

