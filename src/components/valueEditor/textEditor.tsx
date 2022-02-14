import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';

interface props {
    value: string | number[];
    onChange: (value: string | number[]) => void;
    label: string;
    fullWidth?: boolean;
    placeholder?: string;
};

const InputEditor: React.FC<props> = function ({ value, onChange, label, fullWidth = false, placeholder = '' }) {

    const [val, setVal] = useState('');

    function setValueInInputElement() {
        const tempVal = typeof (value) === 'string' ? value : value.join(',');
        setVal(tempVal);
    }

    useEffect(function () {
        setValueInInputElement();
    }, []);

    const changeHandler = function (e: React.ChangeEvent<HTMLInputElement>) {
        setVal(e.target.value);
    }

    function triggetOnChange(tempVal: string) {

        if (typeof (value) === 'string') {
            onChange(tempVal);
        }
        else {
            const val = tempVal.split(',').map(item => parseInt(item));
            val.length && onChange(val);
        }
    }

    const blurHandler = function (e: React.FocusEvent<HTMLInputElement>) {
        triggetOnChange(e.target.value);
    }

    const onKeyDown = function (e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            triggetOnChange(val);
            (e.target as any).blur()
        }
    }

    return (
        <Editor fullWidth={fullWidth}>
            <div className='label'>{label}</div>
            <input type='text' value={val} onChange={changeHandler} onFocus={setValueInInputElement} onBlur={blurHandler} onKeyDown={onKeyDown} placeholder={placeholder} />
        </Editor>
    );
}

interface styleProps {
    fullWidth: boolean;
}

const Editor = styled.div<styleProps>`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            
            margin:${theme.spacing(1)}px ${theme.spacing(.6)}px;
            display: ${props.fullWidth ? 'flex' : 'inline-block'};
            vertical-align: middle;
            text-align: center;
            align-items: center;
            justify-content: space-between;

            &>.label{
                font-weight: bold;
                font-size: .8em;
                position:relative;
                transform: translate(-2px,-2px);
            }

            &>input{
                height: 25px;
                width:${props.fullWidth ? 'auto' : '70px'};
                margin:0 ${theme.spacing(.5)}px;
                text-align: center;
                border: 1px solid #555;
                outline: none;
                border-radius: ${theme.spacing(.5)}px;
                flex-grow: 1;
            }

        `;
    }}
`;

export default InputEditor;