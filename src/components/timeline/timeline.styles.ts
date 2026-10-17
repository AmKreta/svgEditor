import styled from 'styled-components';
import { UI_COLORS, UI_SHADOWS } from '../../theme/uiTokens';

export const LABEL_WIDTH = 180;
export const RULER_HEIGHT = 28;
export const ROW_HEIGHT = 36;

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

export const Inspector = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    height: 38px;
    padding: 0 12px;
    border-bottom: 1px solid ${UI_COLORS.border};
    background-color: ${UI_COLORS.surfaceMuted};
    overflow-x: auto;
    white-space: nowrap;

    & .title{
        font-weight: 600;
    }

    & label{
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: ${UI_COLORS.textMuted};
    }

    & input, & select{
        height: 26px;
        border: 1px solid ${UI_COLORS.inputBorder};
        border-radius: 5px;
        background-color: ${UI_COLORS.surface};
        color: ${UI_COLORS.text};
        font: inherit;
        outline: none;
        &:focus{
            border-color: ${UI_COLORS.accent};
            box-shadow: 0 0 0 2px rgba(59, 130, 246, .2);
        }
    }
    & input{
        width: 64px;
        padding: 0 6px;
        font-variant-numeric: tabular-nums;
    }

    & .chips{
        display: flex;
        align-items: center;
        gap: 4px;
    }
    & .chip{
        display: inline-flex;
        align-items: center;
        gap: 2px;
        height: 22px;
        padding: 0 4px 0 8px;
        border-radius: 999px;
        background-color: ${UI_COLORS.accentSoft};
        color: ${UI_COLORS.accent};
        font-weight: 500;
        &>button{
            display: inline-flex;
            padding: 2px;
            border: none;
            border-radius: 50%;
            background: transparent;
            color: inherit;
            &:hover{
                background-color: rgba(59, 130, 246, .15);
            }
        }
    }
    & .muted{
        color: ${UI_COLORS.textMuted};
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
            &>.swatch{
                flex-shrink: 0;
                height: 8px;
                width: 8px;
                border-radius: 2px;
            }
            &>.name{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 500;
                text-transform: capitalize;
            }
            &>.count{
                margin-left: auto;
                color: ${UI_COLORS.textMuted};
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
        }
    }

    & .clip{
        position: absolute;
        top: 5px;
        bottom: 5px;
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

    & .empty{
        position: sticky;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 24px 16px;
        color: ${UI_COLORS.textMuted};
        text-align: center;
        & b{
            color: ${UI_COLORS.text};
        }
    }

    &.recording .row, &.recording .ruler>.scale{
        pointer-events: none;
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
