import React from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import { useDispatch } from 'react-redux';
import { formatActiveShape } from '../actions/pages/pages.actions';
import BaseShapeEditor, { EditorProps } from './baseShapeEditor';
import { TEXT_SHAPE } from '../shapes/text';
import TextEditor from '../components/valueEditor/textEditor';
import OptionEditor from '../components/valueEditor/optionEditor';
import { availableFonts } from '../utils/constant';

const SvgTEXTEditor: React.FC<EditorProps> = function ({ shape }) {
    const dispatch = useDispatch();
    const s = shape as TEXT_SHAPE;
    return (
        <>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>TEXT CONTENT</div>
                <TextEditor
                    label='Text'
                    value={s.text}
                    onChange={val => {
                        dispatch(formatActiveShape({ id:s.id, properties: { text: val as string } }))
                    }}
                    fullWidth
                />
            </div>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Font</div>
                <NumberEditor
                    label='size'
                    value={s.fontSize}
                    onChange={val => {
                        val >= 10 && dispatch(formatActiveShape({ id:s.id, properties: { fontSize: val } }))
                    }}
                    step={10}
                />
                <NumberEditor
                    label='weight'
                    value={s.fontWeight}
                    onChange={val => {
                        (val >= 100 && val <= 900) && dispatch(formatActiveShape({ id:s.id, properties: { fontWeight: val } }))
                    }}
                    step={20}
                />
                <OptionEditor
                    label='style'
                    value={s.fontStyle}
                    onChange={val => {
                        dispatch(formatActiveShape({ id:s.id, properties: { fontStyle: val } }))
                    }}
                    options={['normal', 'italic', 'oblique']}
                />
                <OptionEditor
                    label='Family'
                    value={s.fontFamily}
                    onChange={val => {
                        dispatch(formatActiveShape({ id:s.id, properties: { fontFamily: val } }))
                    }}
                    options={availableFonts}
                />
                <OptionEditor
                    label='Generic'
                    value={s.genericFontFamily}
                    onChange={val => {
                        dispatch(formatActiveShape({ id:s.id, properties: { genericFontFamily: val } }))
                    }}
                    options={['serif', 'sans-serif', 'cursive', 'fantasy', 'monospace']}
                />
            </div>
        </>
    );
}

export default BaseShapeEditor(SvgTEXTEditor);