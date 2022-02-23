import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentProjectColors } from '../../selector/selector';
import { addColorInPalette } from '../../actions/pages/pages.actions';
import { State } from '../../store/store';
import Button from '../button.component';
import { SiAddthis } from 'react-icons/si';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { editColorPaletteAtIndex, removePaletteColorAtIndex } from '../../actions/pages/pages.actions';
import Icon from '../icon.component';
import { AiOutlineClose } from 'react-icons/ai';

const ColorPalette: React.FC = function () {
    const colors = useSelector<State, string[]>(getCurrentProjectColors);
    const [pickerColor, setPickerColor] = useState<string>('rgba(0,0,0,1)');
    const [showEditorAt, setshowEditorAt] = useState<number>(-1);
    const dispatch = useDispatch();

    const addHandler = function (e: React.MouseEvent<HTMLButtonElement>) {
        if (!colors.includes(pickerColor)) {
            dispatch(addColorInPalette(pickerColor));
        }
    }

    const onEdit = function (e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        e.cancelable=true;
        const index = parseInt(e.currentTarget.dataset['index']!);
        setshowEditorAt(index);
    }

    const removeEditor = function (e: React.FocusEvent<HTMLInputElement>) {
        setshowEditorAt(-1);
    }

    const editPredefinedPaletteColor = function (e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset['index']!);
        dispatch(editColorPaletteAtIndex({ index, color: e.target.value }));
    }

    const deleteColor = function (e: React.MouseEvent<SVGElement, MouseEvent>) {
        const index = parseInt(e.currentTarget.dataset['index']!);
        console.log(index)
        dispatch(removePaletteColorAtIndex(index));
    }

    return (
        <>
            <div style={{ display: 'flex', flexGrow: 1 }}>
                {
                    colors.map((color, index) => (
                        <ColorContainer
                            key={index + color}
                            onMouseUp={onEdit}
                            data-index={index}
                            color={color}
                        >
                            {
                                showEditorAt === index
                                    ? <input type='color' onBlur={removeEditor} value={color} onChange={editPredefinedPaletteColor} data-index={index} />
                                    : null
                            }
                            <Icon Icon={AiOutlineClose} onClick={deleteColor} data-index={index} />
                        </ColorContainer>
                    ))
                }
            </div>
            <input type='color' value={pickerColor} onChange={e => setPickerColor(e.target.value)} />
            <Button startIcon={SiAddthis} title='Add' onClick={addHandler} />
        </>
    );
}

const ColorContainer = styled.div<{ color: string }>`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            height: 25px;
            width: 25px;
            background-color: ${props.color}; 
            border-radius: 4px;
            position: relative;

            &:not(:first-child){
                margin-left: ${theme.spacing(1)}px;
            }

            &:not(:last-child){
                margin-right: ${theme.spacing(1)}px;
            }

            &>input{
                position:absolute;
                top:0;
                left:0;
                height: 30px;
                width: 30px;
            }

            &>.icon{
                position:absolute;
                top:0;
                right:0;
                transform:translate(50%,-50%) scale(.8);
                background-color: white;
                box-shadow: 0px 0px 3px #ccc;
                border-radius: 50%;
                padding:${theme.spacing(.5)}px;
                &:hover{
                    background-color: black;
                    color:white
                }
            }
        `;
    }}
`;

export default ColorPalette;