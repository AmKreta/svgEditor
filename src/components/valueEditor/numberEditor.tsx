import React, { useRef, useState } from 'react';
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
    const [isFocused, setIsFocused] = useState(false);
    const [focusedVal, setFocusedVal] = useState(0);

    const cancelTimerRef = function () {
        timerRef.current && clearInterval(timerRef.current);
        timerRef.current = null;
    }

    const minusPressedHandler = function () {
        const val = value;
        let times = step;
        if (!timerRef.current) {
            timerRef.current = setInterval(function () {
                onChange(val - times);
                times += step;
            }, 200);
            window.onmouseup = function () {
                cancelTimerRef();
                window.onmouseup = null;
            }
        }
    }

    const plusPressedHandler = function (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        const val = value;
        let times = step;
        if (!timerRef.current) {
            timerRef.current = setInterval(function () {
                onChange(val + times);
                times += step;
            }, 200);
            window.onmouseup = function () {
                cancelTimerRef();
                window.onmouseup = null;
            }
        }
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
        let val = parseInt(e.target.value);
        if (isNaN(val)) {
            val = 0;
        }
        setFocusedVal(val);
    }

    const focusHandler = function (e: React.FocusEvent<HTMLInputElement>) {
        setIsFocused(true);
        setFocusedVal(value);
        e.target.onkeydown = ev => {
            if (ev.key === 'Enter') {
                const val = parseInt(e.target.value);
                val !== value && onChange(val);
                e.target.onkeydown = null;
                e.target.blur();
                setFocusedVal(0);
                setIsFocused(false);
            }
        }
    }

    return (
        <Editor disabled={disabled}>
            {
                label
                    ? <div className='label'>{label}</div>
                    : null
            }
            <div className='editorContainer'>
                <Button startIcon={FaMinus} onMouseDown={minusPressedHandler} onClick={minusHandler} />
                <input type='text' value={isFocused ? focusedVal : value} onChange={changeHandler} onFocus={focusHandler} />
                <Button startIcon={FaPlus} onMouseDown={plusPressedHandler} onClick={plusHandler} />
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
                
                ${() => props.disabled && css`
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