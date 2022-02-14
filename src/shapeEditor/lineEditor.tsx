import React from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import { useDispatch } from 'react-redux';
import { formatActiveShape } from '../actions/pages/pages.actions';
import BaseShapeEditor, { EditorProps } from './baseShapeEditor';
import { LINE_SHAPE } from '../shapes/line';

const LineEditor: React.FC<EditorProps> = function ({ shape, index }) {
    console.log(shape, index);
    const dispatch = useDispatch();
    const s = shape as LINE_SHAPE
    return (
        <>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Coordinates</div>
                {
                    s.points.map((point, idx) => (
                        <>
                            <NumberEditor
                                value={point[0]}
                                label={`point[${idx}]X`}
                                onChange={val => {
                                    if(val){
                                        const newPointsArray=[...s.points];
                                        newPointsArray[idx][0]=val;
                                        dispatch(formatActiveShape({ index, properties: { points: newPointsArray } }));
                                    }
                                }}
                                step={5}
                            />
                            <NumberEditor
                                value={point[1]}
                                label={`point[${idx}]Y`}
                                onChange={val => {
                                    if(val){
                                        const newPointsArray=[...s.points];
                                        newPointsArray[idx][1]=val;
                                        console.log(newPointsArray)
                                        dispatch(formatActiveShape({ index, properties: { points: newPointsArray } }));
                                    }
                                }}
                                step={5}
                            />
                        </>
                    ))
                }
            </div>
        </>
    );
}

export default BaseShapeEditor(LineEditor);