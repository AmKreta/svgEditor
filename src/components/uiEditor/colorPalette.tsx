import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentProjectColors } from '../../selector/selector';
import { addColorInPalette } from '../../actions/pages/pages.actions';
import { State } from '../../store/store';
import Button from '../button.component';
import { SiAddthis } from 'react-icons/si';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { editColorPalette, removePaletteColor } from '../../actions/pages/pages.actions';
import Icon from '../icon.component';
import { AiOutlineClose } from 'react-icons/ai';
import FillColorRenderer from './fillColorRenderer';

const ColorPalette: React.FC = function () {
    const colors = useSelector<State, { [key: string]: string; }>(getCurrentProjectColors);
    const [pickerColor, setPickerColor] = useState<string>('rgba(0,0,0,1)');
    const [showEditorAt, setshowEditorAt] = useState<number>(-1);
    const dispatch = useDispatch();

    const addHandler = function (e: React.MouseEvent<HTMLButtonElement>) {
        if (!Object.values(colors).includes(pickerColor)) {
            dispatch(addColorInPalette(pickerColor));
        }
    }

    const onEdit = function (e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        e.cancelable = true;
        const index = parseInt(e.currentTarget.dataset['index']!);
        setshowEditorAt(index);
    }

    const removeEditor = function (e: React.FocusEvent<HTMLInputElement>) {
        setshowEditorAt(-1);
    }

    const editPredefinedPaletteColor = function (e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        e.stopPropagation();
        const id = e.currentTarget.dataset['id']!;
        dispatch(editColorPalette({ id, color: e.target.value }));
    }

    const deleteColor = function (e: React.MouseEvent<SVGElement, MouseEvent>) {
        const id = e.currentTarget.dataset['id']!;
        dispatch(removePaletteColor(id));
    }

    return (
        <>
            <div style={{ display: 'flex', flexGrow: 1 }}>
                {
                    Object.keys(colors).map((colorId, index) => (
                        <ColorContainer
                            key={index + colorId}
                            onMouseUp={onEdit}
                            data-index={index}
                        >
                            <FillColorRenderer colorId={colorId} />
                            {
                                showEditorAt === index
                                    ? <input type='color' onBlur={removeEditor} value={colors[colorId]} onChange={editPredefinedPaletteColor} data-id={colorId} />
                                    : null
                            }
                            <Icon Icon={AiOutlineClose} onClick={deleteColor} data-id={colorId} />
                        </ColorContainer>
                    ))
                }
            </div>
            <input type='color' value={pickerColor} onChange={e => setPickerColor(e.target.value)} />
            <Button startIcon={SiAddthis} title='Add' onClick={addHandler} />
        </>
    );
}

const ColorContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            height: 25px;
            width: 25px;
            position: relative;
            
            &>svg{
                height:100%;
                width:100%;
                border-radius: 4px;
            }

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