import React from 'react';
import { IconType } from 'react-icons/lib';
import styled, { css } from 'styled-components';
import { THEME } from '../theme/theme';
import Icon from './icon.component';

interface props {
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    label?: string;
    startIcon?: IconType;
    endIcon?: IconType;
    style?: any;
}

const Input: React.FC<props> = function ({ value, onChange, placeholder, label, startIcon, endIcon, style = {} }) {
    return (
        <FormControl style={style}>
            {label ? <label htmlFor="input">{label}</label> : null}
            <div>
                {startIcon ? <Icon Icon={startIcon} /> : null}
                <input type='text' id='input' value={value} onChange={onChange} placeholder={placeholder} />
                {endIcon ? <Icon Icon={endIcon} /> : null}
            </div>
        </FormControl>
    );
}

const FormControl = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            display:flex;
            align-items:center;
            flex-direction: row;

            &>label{
                display: inline-block;
                margin: ${theme.spacing(1)}px;
                font-weight: bold;
                font-size: .9em;
                text-transform: capitalize;
                text-align: left;
            }

            &>div{
                display:flex;
                align-items: center;
                justify-content: center;
                border:1px solid #ccc;
                border-radius: ${theme.spacing(.5)}px;
                flex-grow: 1;
                padding:${theme.spacing(.5)}px ${theme.spacing(1)}px;

                &>input{
                    border:none;
                    outline:none;
                    flex-grow: 1;
                    padding:${theme.spacing(.5)}px ${theme.spacing(1)}px;
                }
            }
        `;
    }}
`;

export default Input;