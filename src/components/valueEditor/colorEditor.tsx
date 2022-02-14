import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';

interface props {
    value: string;
    onChange: (value: string) => void;
    label: string | JSX.Element;
    disabled?: boolean;
};

const NumberEditor: React.FC<props> = function ({ value, onChange, label, disabled = false }) {

    const changeHandler = function (e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        val !== value && onChange(val)
    }

    return (
        <Editor disabled={disabled}>
            <div className='label'>{label}</div>
            <input type='color' value={value} onChange={changeHandler} />
        </Editor>
    );
}

interface styleProps {
    disabled: boolean;
}

const Editor = styled.div<styleProps>`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            
            margin:${theme.spacing(1.5)}px ${theme.spacing(.5)}px;
            display: inline-block;
            vertical-align: middle;
            text-align: center;
            
            &>input{
                    height: 25px;
                    width:35px;
                    margin:0 ${theme.spacing(.5)}px;
                    text-align: center;
                    border: none;
                    outline: none;
                    border-radius: ${theme.spacing(.5)}px;
                    ${() => props.disabled && css`
                        pointer-events: none;
                        opacity:.5;
                `}
                }
            &>input:hover{
                cursor:pointer;
            }    

            &>.label{
                margin-right: ${theme.spacing(1.5)}px;
                font-weight: bold;
                font-size: .8em;
                text-align: center;
                position:relative;
                transform: translate(2px,-2px);
            }
        `;
    }}
`;

export default NumberEditor;