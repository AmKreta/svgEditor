import React, { useRef } from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import { useDispatch } from 'react-redux';
import { formatActiveShape } from '../actions/pages/pages.actions';
import BaseShapeEditor, { EditorProps } from './baseShapeEditor';
import { IMAGE_SHAPE } from '../shapes/image';
import Button from '../components/button.component';
import styled, { css } from 'styled-components';
import { THEME } from '../theme/theme';
import { toBase64 } from '../utils/utils';

const ImageEditor: React.FC<EditorProps> = function ({ shape }) {
    const dispatch = useDispatch();
    const s = shape as IMAGE_SHAPE;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const clickHandler = function () {
        fileInputRef.current?.click();
    }

    const changeHandler = async function (e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files![0];
        if (file) {
            const base64Url = await toBase64(file);
            dispatch(formatActiveShape({ id:s.id, properties: { base64Url } }));
        }
    }

    return (
        <>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Size</div>
                <NumberEditor
                    value={s.height}
                    label='height'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id:s.id, properties: { height: val } }));
                    }}
                    step={10}
                />
                <NumberEditor
                    value={s.width}
                    label='width'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id:s.id, properties: { width: val } }));
                    }}
                    step={10}
                />
            </div>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Content</div>
                <ImageEditorButton>
                    <div className='title'>Image</div>
                    <Button title='Change Image' onClick={clickHandler} />
                    <input type='file' accept="image/*" ref={fileInputRef} onChange={changeHandler} />
                </ImageEditorButton>
            </div>
        </>
    );
}

const ImageEditorButton = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            margin:${theme.spacing(1)}px;
            &>*{
                display: inline-block;
                vertical-align: middle;
            }

            &>div.title{
                margin-right: ${theme.spacing(.5)}px;
                font-weight: bold;
                font-size: .8em;
            }

            &>button{
                width:80%;
            }

            &>input{
                display: none;
            }
        `;
    }}
`;

export default BaseShapeEditor(ImageEditor);