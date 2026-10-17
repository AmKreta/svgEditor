import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentProjectColors } from '../../selector/selector';
import { addColorInPalette } from '../../actions/pages/pages.actions';
import { State } from '../../store/store';
import Button from '../button.component';
import { BsPlus } from 'react-icons/bs';
import { UI_COLORS } from '../../theme/uiTokens';
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
    const editInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();

    // open the native picker straight away instead of needing a second click
    useEffect(() => {
        showEditorAt > -1 && editInputRef.current?.click();
    }, [showEditorAt]);

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
            <Swatches>
                {
                    Object.keys(colors).length === 0
                        ? <span className='empty'>No saved colors yet. Pick one and add it to the palette.</span>
                        : null
                }
                {
                    Object.keys(colors).map((colorId, index) => (
                        <ColorContainer
                            key={index + colorId}
                            onMouseUp={onEdit}
                            data-index={index}
                            title='Click to edit'
                        >
                            <FillColorRenderer colorId={colorId} />
                            {
                                showEditorAt === index
                                    ? <input type='color' ref={editInputRef} onBlur={removeEditor} value={colors[colorId]} onChange={editPredefinedPaletteColor} data-id={colorId} />
                                    : null
                            }
                            <Icon Icon={AiOutlineClose} onClick={deleteColor} data-id={colorId} title='Remove color' />
                        </ColorContainer>
                    ))
                }
            </Swatches>
            <PickerInput type='color' value={pickerColor} onChange={e => setPickerColor(e.target.value)} title='Choose a color' />
            <Button startIcon={BsPlus} iconSize={16} title='Add color' onClick={addHandler} />
        </>
    );
}

export const Swatches = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            display: flex;
            align-items: center;
            flex-grow: 1;
            gap: ${theme.spacing(1.25)}px;
            min-width: 0;
            padding: ${theme.spacing(.75)}px ${theme.spacing(.5)}px;
            overflow-x: auto;

            &>.empty{
                color: ${UI_COLORS.textMuted};
                font-size: 12px;
                white-space: nowrap;
            }
        `;
    }}
`;

export const PickerInput = styled.input`
    flex-shrink: 0;
    height: 30px;
    width: 36px;
    padding: 2px;
    border: 1px solid ${UI_COLORS.inputBorder};
    border-radius: 6px;
    background-color: ${UI_COLORS.surface};
    cursor: pointer;
`;

export const Swatch = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            position: relative;
            flex-shrink: 0;
            height: 26px;
            width: 26px;
            border-radius: ${theme.spacing(.75)}px;
            box-shadow: inset 0 0 0 1px rgba(17, 24, 39, .12);
            cursor: pointer;
            transition: transform .1s;

            &:hover{
                transform: translateY(-1px);
            }

            &>svg:first-child{
                height:100%;
                width:100%;
                border-radius: inherit;
                border: 1px solid ${UI_COLORS.border};
            }

            &>.icon{
                position:absolute;
                top:0;
                right:0;
                height: 16px !important;
                width: 16px !important;
                min-height: 0 !important;
                min-width: 0 !important;
                padding: 3px;
                transform:translate(40%,-40%);
                background-color: ${UI_COLORS.surface};
                color: ${UI_COLORS.textMuted};
                box-shadow: 0 1px 3px rgba(17, 24, 39, .25);
                border-radius: 50%;
                opacity: 0;
                transition: opacity .1s;
                &:hover{
                    background-color: ${UI_COLORS.danger};
                    color: white;
                }
            }

            &:hover>.icon{
                opacity: 1;
            }
        `;
    }}
`;

const ColorContainer = styled(Swatch)`
    &>input{
        position:absolute;
        top:0;
        left:0;
        height: 100%;
        width: 100%;
        opacity: 0;
    }
`;

export default ColorPalette;