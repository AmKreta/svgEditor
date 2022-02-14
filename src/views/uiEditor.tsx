import React from 'react';
import styled, { css } from 'styled-components';
import EditorHeader from '../components/uiEditor/editorHeader';
import ElementTree from '../components/uiEditor/elementTree';
import SvgEditor from '../components/uiEditor/svgEditor';
import ElementFormatter from '../components/uiEditor/elementFormatter';
import EditorFooter from '../components/uiEditor/editorFooter';
import { THEME } from '../theme/theme';

const NftEditor: React.FC<{}> = function () {
    return (
        <EditorContainer>
            <EditorHeader />
            <ElementTree />
            <SvgEditor />
            <ElementFormatter />
            <EditorFooter />

        </EditorContainer>
    );
};

const EditorContainer = styled.div`
    ${(props) => {
        const theme = (props.theme) as THEME;
        return css`
        height:100%;
        display:grid;
        grid-template-rows:10fr 70fr 20fr;
        grid-template-columns:10fr 70fr 20fr;
        grid-template-areas:
            "header      header    header" 
            "elementTree svgEditor elementformatter"
            "footer      footer    footer";
        grid-gap:${theme.spacing(1)}px;    
        padding:${theme.spacing(1)}px;
        min-width: 0;
        min-height: 0;
        background-color:#ccc;
        &>*{
            border-radius:${theme.spacing(.5)}px;
            background-color:white;
            overflow: hidden;  /* NEW */
            min-width: 0; 
        }   
    `}}
`

export default NftEditor;