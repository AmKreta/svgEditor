import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentProjectColors } from '../../selector/selector';
import { addColorInPalette } from '../../actions/pages/pages.actions';
import { State } from '../../store/store';
import Button from '../button.component';
import { SiAddthis } from 'react-icons/si';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';

const ColorPalette: React.FC<{}> = function ({ }) {
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
        const index = parseInt(e.currentTarget.dataset['index']!);
        setshowEditorAt(index);
    }

    const removeEditor=function(e: React.FocusEvent<HTMLInputElement>){
        setshowEditorAt(-1);
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
                                    ? <input type='color' onBlur={removeEditor}/>
                                    : null
                            }
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
            height: 30px;
            width: 30px;
            background-color: ${props.color}; 
            margin: 0 ${theme.spacing(.5)}px; 
            border-radius: 4px;
            position: relative;
            &>input{
                position:absolute;
                top:0;
                left:0;
                height: 30px;
                width: 30px;
            }
        `;
    }}
`;

export default ColorPalette;