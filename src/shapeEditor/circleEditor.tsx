import React from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import { CIRCLE_SHAPE } from '../shapes/circle';
import { useDispatch } from 'react-redux';
import { formatActiveShape } from '../actions/pages/pages.actions';
import BaseShapeEditor, { EditorProps } from './baseShapeEditor';

const CircleEditor: React.FC<EditorProps> = function ({ shape }) {
    const dispatch = useDispatch();
    const s = shape as CIRCLE_SHAPE;
    return (
        <>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Size</div>
                <NumberEditor
                    value={s.radius}
                    label='radius'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { radius: val } }));
                    }}
                    step={10}
                />
            </div>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Coordinates</div>
                <NumberEditor
                    value={s.x}
                    label='X'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { x: val } }));
                    }}
                    step={5}
                />
                <NumberEditor
                    value={s.y}
                    label='Y'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { y: val } }));
                    }}
                    step={5}
                />
            </div>
        </>
    );
}

export default BaseShapeEditor(CircleEditor);