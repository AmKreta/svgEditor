import React, { useState, useRef } from 'react';
import { THEME } from '../theme/theme';
import styled, { css } from 'styled-components';


interface props {
    label?: string;
    placeholder?: string;
    onChange: Function;
    children: { renderItem: JSX.Element, details: any }[];
    style?: any;
    initialValue?: { renderItem: JSX.Element, details: any }
}

const DropDown: React.FC<props> = function ({ label, placeholder, onChange, children, style, initialValue }) {

    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showOptions, setShowOptions] = useState(false);
    const dropDownRef = useRef<HTMLDivElement | null>(null);

    function openOptionsTab() {
        setShowOptions(true);
    }

    function closeOptionsTab() {
        setShowOptions(false);
    }

    function onChildSelect(details: any, index: number) {
        setSelectedIndex(index);
        onChange(details);
        closeOptionsTab();
        dropDownRef.current?.blur();
    }

    return (
        <DropDownContainer tabIndex={-1} onFocus={openOptionsTab} onBlur={closeOptionsTab} disabled={children.length === 0} style={style} ref={dropDownRef}>
            <div className='label'>{label}</div>
            {
                selectedIndex > -1
                    ? <div className='selectedItem'>{children[selectedIndex].renderItem}</div>
                    : initialValue
                        ? initialValue.renderItem
                        : placeholder
                            ? <div className='placeholder' title='no value selected'>{placeholder}</div>
                            : null
            }
            <div className='optionsContainer'>
                {
                    showOptions
                        ? (
                            <div className='options'>
                                {
                                    children.map(({ renderItem, details }, index) => (
                                        <div key={index} className='option' onClick={() => onChildSelect(details, index)}>{renderItem}</div>
                                    ))
                                }
                            </div>
                        )
                        : null
                }
            </div>
        </DropDownContainer>
    );
}

export default DropDown;

const DropDownContainer = styled.div<{ disabled: boolean }>`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            padding:2px 4px;
            display:flex;
            flex-flow: column nowrap;
            align-items: stretch;
            pointer-events: ${props.disabled ? 'none' : 'initial'};
            opacity:${props.disabled ? .5 : 1};

            &>div.label{
                font-weight: bold;
                font-size: .8em;
            }

            &>div:nth-child(2){
                // label or selected item
                border:1px solid #333;
                padding:2px 4px;
                border-radius:${theme.spacing(.5)}px;

                &.placeholder{
                    background-color: #ccc;
                }

                &:hover{
                    cursor:pointer;
                }
            }

            &>.optionsContainer{
                background-color: white;
                position:relative;

                &>.options{
                    background-color: white;
                    position:absolute;
                    max-height: 100px;
                    overflow-y: scroll;
                    z-index:10;
                    border:1px solid #ccc;
                    box-shadow:0 0 3px #ccc, 1px 3px 4px #333;

                    &>.option{
                        border:1px solid #ccc;
                        padding:2px 4px;
                        text-align: left;
                        transition:.25s ease-in-out;
                        
                        &:hover{
                            cursor: pointer;
                            background-color: #ccc;
                        }
                    }
                }
            }
        `;
    }}
`;