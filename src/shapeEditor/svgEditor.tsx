import React from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import { useDispatch, useSelector } from 'react-redux';
import { getSvgStyle } from '../selector/selector';
import { editSvgStyle } from '../actions/pages/pages.actions';
import styled, { css } from 'styled-components';
import { THEME } from '../theme/theme';
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

const EditorContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            flex-grow: 1;
            overflow-y: scroll;
            &>.EditorCaegoryContainer{
                border:1px solid #ccc;
                padding:${theme.spacing(1)}px ${theme.spacing(.3)}px;
                margin:${theme.spacing(1)}px ${theme.spacing(.5)}px;
                text-align: left;
                &>.editorCategory{
                    text-align: center;
                    font-weight: bold;
                    opacity:.5;
                    font-size: .8em;
                }
            }
        `;
    }}
`;

export default SvgContainerEditor;