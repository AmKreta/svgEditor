import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { useSelector } from 'react-redux';
import { getCurrentProjectColors, getCurrentProjectGradients } from '../../selector/selector';
import { State } from '../../store/store';
import { GRADIENT } from '../../actions/pages/pages.interface';
import DropDown from '../dropDown';
import GradientRenderer from '../uiEditor/gradientRenderer';
import FillColorRenderer from '../uiEditor/fillColorRenderer';

interface props {
    value: string | number;
    onChange: (value: string) => void;
    label: string | JSX.Element;
    disabled?: boolean;
    showPalette?: boolean;
};

const ColorEditor: React.FC<props> = function ({ value, onChange, label, disabled = false, showPalette = false }) {

    const colors = useSelector<State, { [key: string]: string }>(getCurrentProjectColors);
    const gradients = useSelector<State, { [key: string]: GRADIENT; }>(getCurrentProjectGradients);

    const changeHandler = function (e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        val !== value && onChange(val)
    }

    const onDropDownValueChange = function (details: any) {
        // details is id
        value !== `url(#${details})` && onChange(`url(#${details})`);
    }

    function getDropDownChildren() {
        const colorsArray = Object.keys(colors).map(colorId => ({
            renderItem: <div className='dropDownOptions' key={colorId} data-id={colorId} >
                <FillColorRenderer colorId={colorId} />
            </div>,
            details: colorId
        }))

        const gradientsArray = Object.keys(gradients).map(gradientId => ({
            renderItem: <div className='dropDownOptions' data-id={gradientId} key={gradientId}>
                <GradientRenderer gradientId={gradientId} />
            </div>,
            details: gradientId
        }))

        return [...colorsArray, ...gradientsArray];
    }

    return (
        <Editor disabled={disabled}>
            <div className='label'>{label}</div>
            {
                showPalette
                    ? (
                        <div style={{ display: 'flex', alignItems: 'center' }} title='choose from palette'>
                            <div style={{ width: '60px' }}>
                                <DropDown
                                    placeholder='select'
                                    style={{ width: '60px' }}
                                    onChange={onDropDownValueChange}
                                    initialValue={(value as string).includes('url') ? {
                                        renderItem: <div className='dropDownOptions' >
                                            <FillColorRenderer colorId={(value as string).slice(5, -1)} />
                                        </div>,
                                        details: ''
                                    } : undefined}
                                >
                                    {getDropDownChildren() as any}
                                </DropDown>
                            </div>
                            <input type='color' value={value} onChange={changeHandler} title='choose from color picker'/>
                        </div>
                    )
                    : <input type='color' value={value} onChange={changeHandler} title='choose from color picker'/>

            }
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

            & .dropDownOptions{
                height:25px;
                &>svg{
                    height:100%;
                    width:100%
                }
            }
        `;
    }}
`;



export default ColorEditor;