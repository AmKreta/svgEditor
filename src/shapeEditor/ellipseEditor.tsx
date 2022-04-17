import React from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import { useDispatch } from 'react-redux';
import { formatActiveShape } from '../actions/pages/pages.actions';
import BaseShapeEditor, { EditorProps } from './baseShapeEditor';
import { ELLIPSE_SHAPE } from '../shapes/ellipse';

const EllipseEditor: React.FC<EditorProps> = function ({ shape }) {
    const dispatch = useDispatch();
    const s = shape as ELLIPSE_SHAPE;
    return (
        <>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Size</div>
                <NumberEditor
                    value={s.radiusX}
                    label='radiusX'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { radiusX: val } }));
                    }}
                    step={10}
                />
                <NumberEditor
                    value={s.radiusY}
                    label='radiusY'
                    onChange={val => {
                        val > 0 && dispatch(formatActiveShape({ id: s.id, properties: { radiusY: val } }));
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

export default BaseShapeEditor(EllipseEditor);