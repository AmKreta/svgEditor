import React from 'react';
import NumberEditor from '../components/valueEditor/numberEditor';
import ColorEditor from '../components/valueEditor/colorEditor';
import { useDispatch } from 'react-redux';
import { AVAILABLE_SHAPES } from '../shapes/availableShapes';
import { formatActiveShape } from '../actions/pages/pages.actions';
import styled, { css } from 'styled-components';
import { THEME } from '../theme/theme';
import OptionEditor from '../components/valueEditor/optionEditor';
import InputEditor from '../components/valueEditor/textEditor';
import CssFiltersEditor from './cssFiltersEditor';
import SvgFilterEditor from './svgFiltersEditor';

export interface EditorProps {
    shape: AVAILABLE_SHAPES;
}

const ModifiedEditor = (WRAPPED_EDITOR: React.ComponentType<EditorProps>) => {
    return function BaseShapeEditor(props: EditorProps) {
        const { shape } = props;
        const dispatch = useDispatch();

        return (
            <EditorContainer>
                <div className='EditorCaegoryContainer'>
                    <div className='editorCategory'>Name</div>
                    <InputEditor
                        value={shape.name}
                        label='Name'
                        onChange={val => {
                            val && dispatch(formatActiveShape({ id:shape.id, properties: { name: val as string } }));
                        }}
                        fullWidth
                    />
                </div>
                <div className='EditorCaegoryContainer'>
                    <div className='editorCategory'>Border</div>
                    <NumberEditor
                        value={shape.style.strokeOpacity}
                        label='opacity'
                        onChange={val => {
                            val >= 0 && dispatch(formatActiveShape({ id:shape.id, style: { strokeOpacity: val } }));
                        }}
                        step={.1}
                    />
                    <NumberEditor
                        value={shape.style.strokeWidth}
                        label='width'
                        onChange={val => {
                            val >= 0 && dispatch(formatActiveShape({ id:shape.id, style: { strokeWidth: val } }));
                        }}
                        step={5}
                    />
                    <ColorEditor
                        value={shape.style.stroke}
                        label='Color'
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { stroke: val } }));
                        }}
                        showPalette
                    />
                    <OptionEditor
                        value={shape.style.strokeLinecap}
                        options={['butt', 'square', 'round']}
                        label='Line Cap'
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { strokeLinecap: val as any } }));
                        }}
                    />
                    <OptionEditor
                        value={shape.style.strokeLinejoin}
                        options={['bevel', 'mitter', 'round']}
                        label='Line Join'
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { strokeLinejoin: val as any } }));
                        }}
                    />
                    <InputEditor
                        value={shape.style.strokeDasharray}
                        label='Dash'
                        onChange={val => {
                            val.length && dispatch(formatActiveShape({ id:shape.id, style: { strokeDasharray: val as number[] } }));
                        }}
                        placeholder='eg 2,3,4'
                    />
                </div>
                <div className='EditorCaegoryContainer'>
                    <div className='editorCategory'>Background</div>
                    <NumberEditor
                        value={shape.style.fillOpacity}
                        label='opacity'
                        onChange={val => {
                            val >= 0 && dispatch(formatActiveShape({ id:shape.id, style: { fillOpacity: val } }));
                        }}
                        step={.1}
                    />
                    <OptionEditor
                        label='rule'
                        value={shape.style.fillRule}
                        options={['nonzero', 'evenodd', 'inherit']}
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { fillRule: val as any } }));
                        }}
                    />
                    <ColorEditor
                        value={shape.style.fill}
                        label='Color'
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { fill: val } }));
                        }}
                        showPalette
                    />
                </div>
                <div className='EditorCaegoryContainer'>
                    <div className='editorCategory'>Transforms</div>
                    <NumberEditor
                        value={shape.style.translate[0]}
                        label='TranslateX'
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { translate: [val, shape.style.translate[1]] } }));
                        }}
                        step={5}
                    />
                    <NumberEditor
                        value={shape.style.translate[1]}
                        label='TranslateY'
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { translate: [shape.style.translate[0], val] } }));
                        }}
                        step={5}
                    />
                    <NumberEditor
                        value={shape.style.scale[0]}
                        label='scale'
                        onChange={val => {
                            val > 0 && dispatch(formatActiveShape({ id:shape.id, style: { scale: [val, val] } }));
                        }}
                        step={.2}
                    />
                    <NumberEditor
                        value={shape.style.rotate}
                        label='rotate'
                        onChange={val => {
                            (val >= -360 && val <= 360) && dispatch(formatActiveShape({ id:shape.id, style: { rotate: val } }));
                        }}
                        step={5}
                    />
                    <NumberEditor
                        value={shape.style.skewX}
                        label='skewX'
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { skewX: val } }));
                        }}
                        step={5}
                    />
                    <NumberEditor
                        value={shape.style.skewY}
                        label='skewY'
                        onChange={val => {
                            dispatch(formatActiveShape({ id:shape.id, style: { skewY: val } }));
                        }}
                        step={5}
                    />
                </div>
                <CssFiltersEditor shape={shape} />
                <SvgFilterEditor shape={shape} />
                <WRAPPED_EDITOR shape={shape} />
            </EditorContainer>
        );
    }
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

export default ModifiedEditor;

