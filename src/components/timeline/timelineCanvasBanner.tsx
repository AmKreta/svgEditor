import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { BsCheckLg, BsEye, BsPencilFill } from 'react-icons/bs';
import { getPageTimelines, getTimelineUi } from '../../selector/selector';
import { findCutscene } from '../../timeline/model';
import { setTimelineSelection } from '../../actions/timeline/timeline.actions';
import { UI_COLORS, UI_SHADOWS } from '../../theme/uiTokens';
import { formatTime } from './format';

/** Floating status over the canvas while editing a cutscene or previewing the animation. */
const TimelineCanvasBanner: React.FC = function () {
    const dispatch = useDispatch();
    const { preview, editing, time, playing } = useSelector(getTimelineUi);
    const timelines = useSelector(getPageTimelines);

    if (editing) {
        const cutscene = findCutscene(timelines, editing.timelineId, editing.cutsceneId);
        if (!cutscene) {
            return null;
        }
        return (
            <Sticky>
                <Banner className='editing'>
                    <BsPencilFill className='icon accent' />
                    <span>
                        <b>Editing {cutscene.name}</b> · {cutscene.isDefault ? 'the starting state' : `animates ${formatTime(cutscene.start)} → ${formatTime(cutscene.end)}`}
                    </span>
                    <button className='primary' onClick={() => dispatch(setTimelineSelection([]))}><BsCheckLg /> Done</button>
                </Banner>
            </Sticky>
        );
    }

    if (preview && !playing && !editing) {
        return (
            <Sticky>
                <Banner>
                    <BsEye className='icon' />
                    <span>Previewing {formatTime(time)} · select a cutscene to edit</span>
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

    &>.icon.accent{
        color: ${UI_COLORS.accent};
    }

    &.editing{
        border-color: #bfdbfe;
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
