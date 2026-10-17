import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { BsCheckLg, BsEye, BsRecordCircle, BsSkipStartFill, BsX } from 'react-icons/bs';
import { getTimelineUi } from '../../selector/selector';
import { cancelRecording, commitRecording, showTimeOnCanvas, startRecording } from '../../timeline/recording';
import { UI_COLORS, UI_SHADOWS } from '../../theme/uiTokens';
import { formatTime } from './format';

/** Floating status over the canvas while previewing an animation or recording a snapshot. */
const TimelineCanvasBanner: React.FC = function () {
    const { preview, recording, time, playing } = useSelector(getTimelineUi);

    if (recording) {
        return (
            <Sticky>
                <Banner className='recording'>
                    <span className='dot' />
                    <span><b>Recording at {formatTime(recording.time)}</b> · change shapes to animate them to this moment</span>
                    <button className='primary' onClick={() => commitRecording()}><BsCheckLg /> Done</button>
                    <button onClick={cancelRecording}><BsX /> Cancel</button>
                </Banner>
            </Sticky>
        );
    }

    if (preview && !playing) {
        return (
            <Sticky>
                <Banner>
                    <BsEye className='icon' />
                    <span>Previewing {formatTime(time)} · canvas is view-only</span>
                    <button onClick={startRecording}><BsRecordCircle /> Record changes here</button>
                    <button onClick={() => showTimeOnCanvas(0)}><BsSkipStartFill /> Back to start</button>
                </Banner>
            </Sticky>
        );
    }

    return null;
}

const Sticky = styled.div`
    position: sticky;
    top: 0;
    left: 0;
    z-index: 3;
    height: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
`;

const Banner = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    padding: 6px 6px 6px 14px;
    border: 1px solid ${UI_COLORS.border};
    border-radius: 999px;
    background-color: ${UI_COLORS.surface};
    box-shadow: ${UI_SHADOWS.popover};
    color: ${UI_COLORS.text};
    font-size: 13px;
    white-space: nowrap;

    &>.icon{
        color: ${UI_COLORS.textMuted};
    }

    &>.dot{
        height: 10px;
        width: 10px;
        border-radius: 50%;
        background-color: #ef4444;
        box-shadow: 0 0 0 4px rgba(239, 68, 68, .2);
    }

    &.recording{
        border-color: #fecaca;
    }

    &>button{
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 28px;
        padding: 0 12px;
        border: 1px solid ${UI_COLORS.inputBorder};
        border-radius: 999px;
        background-color: ${UI_COLORS.surface};
        color: ${UI_COLORS.text};
        font: inherit;
        font-weight: 500;
        cursor: pointer;
        &:hover{
            background-color: ${UI_COLORS.hover};
        }
        &.primary{
            border-color: ${UI_COLORS.accent};
            background-color: ${UI_COLORS.accent};
            color: white;
            &:hover{
                filter: brightness(.94);
            }
        }
    }
`;

export default TimelineCanvasBanner;
