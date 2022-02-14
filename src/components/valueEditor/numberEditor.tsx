import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import Button from '../button.component';
import { THEME } from '../../theme/theme';
import { FaPlus, FaMinus } from 'react-icons/fa';

interface props {
    value: number;
    onChange: (value: number) => void;
    label?: string | JSX.Element;
    step?: number;
    disabled?: boolean;
};

const NumberEditor: React.FC<props> = function ({ value, onChange, label, step = 1, disabled = false }) {

    const timerRef = useRef<any>(null);

    const minusPressedHandler = function () {
        const val = value;
        let times = step;
        timerRef.current = setInterval(function () {
            onChange(val - times);
            times += step;
        }, 200);
    }

    const plusPressedHandler = function (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        const val = value;
        let times = step;
        timerRef.current = setInterval(function () {
            onChange(val + times);
            times += step;
        }, 200);
    }

    const plusHandler = function () {
        const inc = step >= 1 ? 1 : step;
        onChange(value + inc);
    }

    const minusHandler = function () {
        const dec = step >= 1 ? 1 : step;
        onChange(value - dec);
    }

    const changeHandler = function (e: React.ChangeEvent<HTMLInputElement>) {
        const val = parseInt(e.target.value);
        val !== value && onChange(val);
    }

    const cancelTimerRef = function () {
        timerRef.current && clearInterval(timerRef.current);
    }

    return (
        <Editor disabled={disabled}>
            {
                label
                    ? <div className='label'>{label}</div>
                    : null
            }
            <div className='editorContainer'>
                <Button startIcon={FaMinus} onMouseDown={minusPressedHandler} onMouseUp={cancelTimerRef} onClick={minusHandler} />
                <input type='text' value={value} onChange={changeHandler} />
                <Button startIcon={FaPlus} onMouseDown={plusPressedHandler} onMouseUp={cancelTimerRef} onClick={plusHandler} />
            </div>
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
            
            margin:${theme.spacing(1.5)}px ${theme.spacing(.6)}px;
            display:inline-block;
            vertical-align: middle;
            text-align: center;

            &>.label{
                margin-right: ${theme.spacing(1.5)}px;
                font-weight: bold;
                font-size: .8em;
                text-transform:capitalize;
                position:relative;
                transform: translate(2px,-2px);
            }

            &>.editorContainer{
                display: flex;
                align-items: stretch;
                justify-content: center;
                
                ${()=>props.disabled&& css`
                    pointer-events: none;
                    opacity:.5;
                `}
                
                &>button{
                    height: 25px;
                    width:25px;

                }

                &>input{
                    height: 25px;
                    width:50px;
                    margin:0 ${theme.spacing(.5)}px;
                    text-align: center;
                    border: 1px solid #555;
                    outline: none;
                    border-radius: ${theme.spacing(.5)}px;
                }
            }

        `;
    }}
`;

export default NumberEditor;