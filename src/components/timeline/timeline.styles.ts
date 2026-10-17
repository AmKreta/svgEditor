import styled from 'styled-components';
import { UI_COLORS, UI_SHADOWS } from '../../theme/uiTokens';

export const LABEL_WIDTH = 180;
export const RULER_HEIGHT = 28;
export const ROW_HEIGHT = 44;
/** Space kept around each cutscene so neighbours and rows read as separate blocks. */
export const CLIP_GAP = 2;

/** One hue per row so neighbouring rows are easy to tell apart. */
export const ROW_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export const TimelineContainer = styled.section`
    grid-area: timeline;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 260px;
    color: ${UI_COLORS.text};
    font-size: 12px;
    outline: none;
    user-select: none;

    &.collapsed{
        height: auto;
    }

    & button{
        font: inherit;
        color: inherit;
        cursor: pointer;
    }
    & button:disabled{
        cursor: default;
        opacity: .4;
    }

    & .divider{
        align-self: stretch;
        width: 1px;
        margin: 8px 4px;
        background-color: ${UI_COLORS.border};
    }
`;

export const Toolbar = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    height: 44px;
    padding: 0 8px;
    border-bottom: 1px solid ${UI_COLORS.border};
    overflow-x: auto;

    & .iconButton{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        height: 30px;
        width: 30px;
        border: none;
        border-radius: 6px;
        background: transparent;
        &>svg{
            height: 15px;
            width: 15px;
        }
        &:hover:not(:disabled){
            background-color: ${UI_COLORS.hover};
        }
        &.play{
            background-color: ${UI_COLORS.text};
            color: white;
            border-radius: 50%;
            &:hover:not(:disabled){
                background-color: #374151;
            }
        }
    }

    & .textButton{
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        height: 30px;
        padding: 0 10px;
        border: 1px solid ${UI_COLORS.inputBorder};
        border-radius: 6px;
        background-color: ${UI_COLORS.surface};
        font-weight: 500;
        &:hover:not(:disabled){
            background-color: ${UI_COLORS.hover};
        }
        &.record>svg{
            color: #ef4444;
        }
        &.primary{
            border-color: ${UI_COLORS.accent};
            background-color: ${UI_COLORS.accent};
            color: white;
            &:hover:not(:disabled){
                filter: brightness(.94);
                background-color: ${UI_COLORS.accent};
            }
        }
    }

    & .time{
        flex-shrink: 0;
        min-width: 116px;
        padding: 0 6px;
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        & .total{
            color: ${UI_COLORS.textMuted};
        }
    }

    & .spacer{
        flex-grow: 1;
    }

    & .zoom{
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
        &>input[type='range']{
            width: 110px;
            accent-color: ${UI_COLORS.accent};
        }
        &>.zoomLabel{
            min-width: 44px;
            text-align: right;
            color: ${UI_COLORS.textMuted};
            font-variant-numeric: tabular-nums;
        }
    }
`;

export const Body = styled.div`
    position: relative;
    flex-grow: 1;
    min-height: 0;
    overflow: auto;
    background-color: ${UI_COLORS.surface};

    & .content{
        position: relative;
        min-height: 100%;
    }

    & .ruler{
        position: sticky;
        top: 0;
        z-index: 3;
        display: flex;
        height: ${RULER_HEIGHT}px;
        border-bottom: 1px solid ${UI_COLORS.border};
        background-color: ${UI_COLORS.surface};

        &>.corner{
            position: sticky;
            left: 0;
            z-index: 4;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            width: ${LABEL_WIDTH}px;
            padding: 0 12px;
            border-right: 1px solid ${UI_COLORS.border};
            background-color: ${UI_COLORS.surface};
            color: ${UI_COLORS.textMuted};
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .04em;
            text-transform: uppercase;
        }
        &>.scale{
            position: relative;
            flex-shrink: 0;
            cursor: col-resize;
            &>svg{
                display: block;
                overflow: visible;
            }
        }
    }

    & .row{
        display: flex;
        height: ${ROW_HEIGHT}px;
        border-bottom: 1px solid ${UI_COLORS.border};

        &>.label{
            position: sticky;
            left: 0;
            z-index: 2;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 8px;
            width: ${LABEL_WIDTH}px;
            padding: 0 12px;
            border-right: 1px solid ${UI_COLORS.border};
            background-color: ${UI_COLORS.surface};
            cursor: pointer;
            &>.swatchIcon{
                flex-shrink: 0;
            }
            &>.addCutscene{
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                height: 24px;
                width: 24px;
                margin-left: auto;
                border: none;
                border-radius: 6px;
                background: transparent;
                color: ${UI_COLORS.textMuted};
                &:hover{
                    background-color: ${UI_COLORS.pressed};
                    color: ${UI_COLORS.text};
                }
            }
            &>.name{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 500;
                text-transform: capitalize;
            }
            &:hover{
                background-color: ${UI_COLORS.hover};
            }
        }

        &.active>.label{
            background-color: ${UI_COLORS.accentSoft};
            box-shadow: inset 3px 0 0 ${UI_COLORS.accent};
        }

        &>.track{
            position: relative;
            flex-shrink: 0;
            background-image: linear-gradient(to right, ${UI_COLORS.hover} 1px, transparent 1px);
            &>.trackHint{
                position: absolute;
                top: 0;
                display: inline-flex;
                align-items: center;
                height: 100%;
                white-space: nowrap;
                color: ${UI_COLORS.textMuted};
                pointer-events: none;
            }
        }

        &.addRow{
            border-bottom: none;
            &>.addTimeline{
                gap: 8px;
                border: none;
                border-right: 1px solid ${UI_COLORS.border};
                color: ${UI_COLORS.textMuted};
                font-weight: 500;
                text-align: left;
                &:hover{
                    color: ${UI_COLORS.text};
                }
            }
        }
    }

    & input.rename{
        flex-grow: 1;
        min-width: 0;
        height: 24px;
        padding: 0 6px;
        border: 1px solid ${UI_COLORS.accent};
        border-radius: 5px;
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, .2);
        background-color: ${UI_COLORS.surface};
        color: ${UI_COLORS.text};
        font: inherit;
    }

    & .clip{
        position: absolute;
        top: 7px;
        bottom: 7px;
        display: flex;
        align-items: center;
        min-width: 6px;
        padding: 0 10px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        overflow: hidden;
        white-space: nowrap;
        cursor: grab;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .12);

        &>.clipLabel{
            overflow: hidden;
            text-overflow: ellipsis;
            pointer-events: none;
            &>.clipMeta{
                opacity: .75;
                font-weight: 400;
            }
        }
        &.default{
            background-image: linear-gradient(rgba(17, 24, 39, .22), rgba(17, 24, 39, .22));
        }
        &.noChanges{
            background-image: repeating-linear-gradient(135deg, rgba(255, 255, 255, .18) 0 6px, transparent 6px 12px);
        }
        &>.handle{
            position: absolute;
            top: 0;
            bottom: 0;
            width: 7px;
            cursor: ew-resize;
            &.start{
                left: 0;
            }
            &.end{
                right: 0;
            }
            &::after{
                content: '';
                position: absolute;
                top: 30%;
                bottom: 30%;
                left: 2px;
                width: 3px;
                border-radius: 2px;
                background-color: rgba(255, 255, 255, .7);
                opacity: 0;
            }
        }
        &:hover>.handle::after, &.selected>.handle::after{
            opacity: 1;
        }
        &.selected{
            box-shadow: 0 0 0 2px white, 0 0 0 4px ${UI_COLORS.text};
            z-index: 1;
        }
        &.dragging{
            cursor: grabbing;
            opacity: .9;
        }
    }

    & .playhead{
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 5;
        width: 2px;
        margin-left: -1px;
        background-color: #ef4444;
        pointer-events: none;
        &::before{
            content: '';
            position: absolute;
            top: 0;
            left: -5px;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #ef4444;
        }
    }

`;

export const ClipMenu = styled.div`
    position: fixed;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-width: 190px;
    padding: 4px;
    border: 1px solid ${UI_COLORS.border};
    border-radius: 8px;
    background-color: ${UI_COLORS.surface};
    box-shadow: ${UI_SHADOWS.popover};
    font-size: 13px;

    &>.separator{
        height: 1px;
        margin: 4px -4px;
        background-color: ${UI_COLORS.border};
    }

    &>button{
        display: flex;
        align-items: center;
        gap: 10px;
        height: 30px;
        padding: 0 10px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: ${UI_COLORS.text};
        text-align: left;
        &>svg{
            color: ${UI_COLORS.textMuted};
        }
        &>.shortcut{
            margin-left: auto;
            padding-left: 16px;
            color: ${UI_COLORS.textMuted};
            font-size: 11px;
        }
        &:hover:not(:disabled){
            background-color: ${UI_COLORS.hover};
        }
        &.danger, &.danger>svg{
            color: ${UI_COLORS.danger};
        }
        &.danger:hover:not(:disabled){
            background-color: ${UI_COLORS.dangerSoft};
        }
    }
`;
