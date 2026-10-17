import styled, { css } from 'styled-components';
import { THEME } from '../theme/theme';

export const PANEL_COLORS = {
    border: '#e3e5e8',
    sectionBg: '#fafbfc',
    label: '#6b7280',
    text: '#1f2937',
    inputBorder: '#d1d5db',
    focus: '#3b82f6',
    hover: '#f3f4f6',
};

// Shared layout for the property panel. Every section uses the
// `EditorCaegoryContainer` / `editorCategory` class names, and every value
// editor carries a `valueEditor` class, so the panel can lay them out in a
// two column grid without changing how those editors look elsewhere.
export const EditorContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            flex-grow: 1;
            overflow-y: auto;
            padding: ${theme.spacing(.5)}px ${theme.spacing(1)}px ${theme.spacing(1)}px;
            color: ${PANEL_COLORS.text};
            font-size: 13px;

            & .EditorCaegoryContainer{
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: ${theme.spacing(1)}px;
                align-items: end;
                border: 1px solid ${PANEL_COLORS.border};
                border-radius: ${theme.spacing(.75)}px;
                background-color: ${PANEL_COLORS.sectionBg};
                padding: ${theme.spacing(1)}px ${theme.spacing(1.25)}px ${theme.spacing(1.25)}px;
                margin: ${theme.spacing(1)}px 0;
                text-align: left;

                &>.editorCategory{
                    grid-column: 1 / -1;
                    font-weight: 600;
                    font-size: 11px;
                    letter-spacing: .06em;
                    text-transform: uppercase;
                    color: ${PANEL_COLORS.label};
                    padding-bottom: ${theme.spacing(.5)}px;
                    border-bottom: 1px solid ${PANEL_COLORS.border};
                }

                &>*{
                    margin: 0;
                    min-width: 0;
                }

                &>button, &>.fullWidth, &>.fullRow{
                    grid-column: 1 / -1;
                }

                &>button{
                    justify-content: center;
                    height: 28px;
                    border: 1px dashed ${PANEL_COLORS.inputBorder};
                    border-radius: ${theme.spacing(.5)}px;
                    background-color: white;
                    color: ${PANEL_COLORS.text};
                    font-weight: 600;
                    font-size: 12px;
                    &:hover{
                        opacity: 1;
                        border-color: ${PANEL_COLORS.focus};
                        color: ${PANEL_COLORS.focus};
                    }
                }

                & .valueEditor{
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    text-align: left;
                    margin: 0;
                    min-width: 0;

                    &>.label{
                        display: flex;
                        align-items: center;
                        gap: ${theme.spacing(.5)}px;
                        margin: 0 0 ${theme.spacing(.5)}px;
                        transform: none;
                        text-align: left;
                        font-size: 11px;
                        font-weight: 500;
                        color: ${PANEL_COLORS.label};
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    & input[type='text'], & select{
                        width: 100%;
                        min-width: 0;
                        height: 28px;
                        margin: 0;
                    }
                }

                & .numberEditor>.editorContainer{
                    justify-content: stretch;
                    &>input{
                        flex: 1 1 auto;
                        margin: 0 ${theme.spacing(.5)}px;
                    }
                }

                & .colorEditor{
                    &>div:not(.label){
                        gap: ${theme.spacing(.5)}px;
                    }
                    & input[type='color']{
                        margin: 0;
                    }
                    & [tabindex]{
                        padding: 0;
                        &>div:nth-child(2){
                            display: flex;
                            align-items: center;
                            height: 28px;
                            border-color: ${PANEL_COLORS.inputBorder};
                            background-color: white;
                            font-size: 11px;
                            color: ${PANEL_COLORS.label};
                        }
                    }
                }
            }

            & details{
                text-align: left;
                &>summary{
                    cursor: pointer;
                    padding: ${theme.spacing(.75)}px ${theme.spacing(1)}px;
                    border-radius: ${theme.spacing(.5)}px;
                    font-weight: 500;
                    &:hover{
                        background-color: ${PANEL_COLORS.hover};
                    }
                }
            }
        `;
    }}
`;

// Small "remove" control used in filter labels.
export const DeleteSpan = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 14px;
    width: 14px;
    border-radius: 50%;
    font-size: 11px;
    line-height: 1;
    color: ${PANEL_COLORS.label};
    &:hover{
        cursor: pointer;
        color: white;
        background-color: #ef4444;
    }
`;
