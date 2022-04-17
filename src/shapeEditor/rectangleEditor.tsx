import React from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import { useDispatch } from 'react-redux';
import { formatActiveShape } from '../actions/pages/pages.actions';
import BaseShapeEditor, { EditorProps } from './baseShapeEditor';
import { RECTANGLE_SHAPE } from '../shapes/rectangle';

const RectangleEditor: React.FC<EditorProps> = function ({ shape }) {
    const dispatch = useDispatch();
    const s = shape as RECTANGLE_SHAPE
    return (
        <>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Size</div>
                <NumberEditor
                    value={s.height}
                    label='height'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { height: val } }));
                    }}
                    step={10}
                />
                <NumberEditor
                    value={s.width}
                    label='width'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { width: val } }));
                    }}
                    step={10}
                />
            </div>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Roundness</div>
                <NumberEditor
                    value={s.rx}
                    label='rX'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { rx: val } }));
                    }}
                    step={5}
                />
                <NumberEditor
                    value={s.ry}
                    label='rY'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { ry: val } }));
                    }}
                    step={5}
                />
            </div>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Coordinates</div>
                <NumberEditor
                    value={s.x}
                    label='x'
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

export default BaseShapeEditor(RectangleEditor);