import React from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import { useDispatch, useSelector } from 'react-redux';
import { getSvgStyle } from '../selector/selector';
import { editSvgStyle } from '../actions/pages/pages.actions';
import { EditorContainer } from './editorPanel.styles';
import ColorEditor from '../components/valueEditor/colorEditor';

const SvgContainerEditor: React.FC = function () {

    const svgStyle = useSelector(getSvgStyle);
    const dispatch = useDispatch();

    return (
        <EditorContainer>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Size</div>
                <NumberEditor
                    value={svgStyle.height}
                    label='height'
                    onChange={val => {
                        val >= 100 && dispatch(editSvgStyle({ height: val }));
                    }}
                    step={5}
                />
                <NumberEditor
                    value={svgStyle.width}
                    label='width'
                    onChange={val => {
                        val >= 100 && dispatch(editSvgStyle({ width: val }));
                    }}
                    step={5}
                />
            </div>
            <div className='EditorCaegoryContainer'>
                <div className='editorCategory'>Background Color</div>
                <ColorEditor
                    value={svgStyle.backgroundColor}
                    label='color'
                    onChange={val => dispatch(editSvgStyle({ backgroundColor: val }))}
                    showPalette
                />
            </div>
        </EditorContainer>
    );
}


export default SvgContainerEditor;