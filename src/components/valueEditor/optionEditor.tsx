import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';

interface props {
    value: string;
    onChange: (value: string) => void;
    label: string;
    options: string[];
};

const OptionEditor: React.FC<props> = function ({ value, onChange, label, options }) {

    const changeHandler = function (e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        val !== value && onChange(val);
    }

    return (
        <Editor className='valueEditor optionEditor'>
            <div className='label'>{label}</div>
            <select value={value} onChange={changeHandler}>
                {
                    options.map((item, index) => (
                        <option key={index}>{item}</option>
                    ))
                }
            </select>
        </Editor>
    );
}

const Editor = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            
            margin:${theme.spacing(1.5)}px ${theme.spacing(.6)}px;
            display: inline-block;
            text-align: center;
            vertical-align: middle;

            &>.label{
                margin-right: ${theme.spacing(1.5)}px;
                font-weight: bold;
                font-size: .8em;
                text-transform:capitalize;
                position:relative;
                transform: translate(2px,-2px);
            }

            &>select{
                border:1px solid #d1d5db;
                background-color: white;
                height:28px;
                padding:0 4px;
                border-radius:4px;
                font-size: 12px;
                text-transform: capitalize;
                outline: none;
                    &:focus{
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, .2);
                    }
                &:hover{
                    cursor: pointer;
                }
            }

        `;
    }}
`;

export default OptionEditor;