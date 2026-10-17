import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { BsArrowCounterclockwise, BsX } from 'react-icons/bs';
import { getPageTimelines, getShapesOfCurrentPage, getTimelineUi } from '../../selector/selector';
import { setPageTimelines } from '../../actions/pages/pages.actions';
import { cutsceneStates, findCutscene } from '../../timeline/model';
import { edgeLimits, moveLimits, roundTime, updateClip } from '../../timeline/clipOps';
import { describeState } from '../../timeline/animatable';
import { revertInCutscene, setTransition } from '../../timeline/editing';
import { CUTSCENE, EASES, FLAT_STATE, MIN_CUTSCENE_DURATION, SHAPE_PATCH, TRANSITION, TRANSITIONS } from '../../timeline/timeline.types';
import { UI_COLORS } from '../../theme/uiTokens';

/** Changed property names of a patch, as `key` / `style.key`. */
const patchKeys = (patch: SHAPE_PATCH): FLAT_STATE => {
    const keys: FLAT_STATE = {};
    Object.keys(patch).forEach(key => {
        if (key !== 'style') keys[key] = 1;
    });
    Object.keys(patch.style || {}).forEach(key => {
        keys[`style.${key}`] = 1;
    });
    return keys;
};

/** Property panel card for the selected cutscene: name, timing, easing and what it animates. */
const CutsceneProperties: React.FC = function () {
    const dispatch = useDispatch();
    const { editing } = useSelector(getTimelineUi);
    const timelines = useSelector(getPageTimelines);
    const shapes = useSelector(getShapesOfCurrentPage);
    const cutscene = editing ? findCutscene(timelines, editing.timelineId, editing.cutsceneId) : null;
    const [name, setName] = useState(cutscene?.name || '');

    useEffect(() => {
        setName(cutscene?.name || '');
    }, [cutscene?.id, cutscene?.name]);

    if (!editing || !cutscene) {
        return null;
    }
    const ref = { timelineId: editing.timelineId, id: cutscene.id };
    const timeline = timelines.find(t => t.id === editing.timelineId);
    const update = (patch: Partial<CUTSCENE>) => dispatch(setPageTimelines(updateClip(timelines, ref, patch)));
    const states = timeline ? cutsceneStates(timeline, cutscene.id) : null;
    const nameOf = (id: string) => (shapes[id] || states?.before[id] || cutscene.added[id])?.name || 'Shape';
    const entering = Object.keys(cutscene.added);
    const changing = Object.keys(cutscene.changed);
    const leaving = cutscene.removed;

    const saveName = () => {
        const trimmed = name.trim();
        trimmed && trimmed !== cutscene.name ? update({ name: trimmed }) : setName(cutscene.name);
    };

    return (
        <Card>
            <div className='heading'>
                <span>Cutscene</span>
                <span className='timeline' title='Timeline'>{timeline?.name}</span>
            </div>
            <input
                className='name'
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') setName(cutscene.name);
                }}
                aria-label='Cutscene name'
            />
            <div className='fields'>
                <label>
                    <span>Start (s)</span>
                    <input
                        type='number'
                        step={0.1}
                        min={0}
                        value={cutscene.start}
                        onChange={e => {
                            const [lo, hi] = moveLimits(timelines, [ref]);
                            const delta = Math.min(hi, Math.max(lo, (Number(e.target.value) || 0) - cutscene.start));
                            update({ start: roundTime(cutscene.start + delta), end: roundTime(cutscene.end + delta) });
                        }}
                    />
                </label>
                <label>
                    <span>Duration (s)</span>
                    <input
                        type='number'
                        step={0.1}
                        min={MIN_CUTSCENE_DURATION}
                        value={roundTime(cutscene.end - cutscene.start)}
                        onChange={e => {
                            const [lo, hi] = edgeLimits(timelines, ref, 'end');
                            update({ end: roundTime(Math.min(hi, Math.max(lo, cutscene.start + (Number(e.target.value) || 0)))) });
                        }}
                    />
                </label>
                <label className='wide'>
                    <span>Easing</span>
                    <select value={cutscene.ease} onChange={e => update({ ease: e.target.value })}>
                        {EASES.map(ease => <option key={ease.value} value={ease.value}>{ease.label}</option>)}
                    </select>
                </label>
            </div>
            {
                entering.length === 0 && changing.length === 0 && leaving.length === 0
                    ? (
                        <p className='hint'>
                            {cutscene.isDefault
                                ? 'This is where the timeline starts. Shapes you draw here are on screen from the beginning.'
                                : 'Nothing changes yet. Draw shapes to bring them in, move or restyle shapes to animate them, delete shapes to take them out.'}
                        </p>
                    )
                    : null
            }
            {
                entering.length
                    ? (
                        <div className='group'>
                            <span className='label'>{cutscene.isDefault ? 'On screen' : 'Enters'}</span>
                            {
                                entering.map(id => (
                                    <div className='shape' key={id}>
                                        <span className='shapeName'>{nameOf(id)}</span>
                                        <select
                                            value={cutscene.enter[id] || 'none'}
                                            onChange={e => setTransition(id, 'enter', e.target.value as TRANSITION)}
                                            title='Entry animation'
                                        >
                                            {TRANSITIONS.map(t => <option key={t.value} value={t.value}>{t.value === 'none' ? (cutscene.isDefault ? 'Already there' : 'Appear') : t.label}</option>)}
                                        </select>
                                        <button className='remove' title={cutscene.isDefault ? 'Delete this shape' : 'Take this shape out of the cutscene'} onClick={() => revertInCutscene(id)}>
                                            <BsX />
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    )
                    : null
            }
            {
                changing.length
                    ? (
                        <div className='group'>
                            <span className='label'>Changes</span>
                            {
                                changing.map(id => (
                                    <div className='shape' key={id}>
                                        <span className='shapeName'>{nameOf(id)}</span>
                                        {
                                            describeState(patchKeys(cutscene.changed[id])).map(group => (
                                                <span className='chip' key={group.label}>
                                                    {group.label}
                                                    <button title={`Keep ${group.label.toLowerCase()} as before`} onClick={() => revertInCutscene(id, group.keys)}>
                                                        <BsX />
                                                    </button>
                                                </span>
                                            ))
                                        }
                                        <button className='remove' title='Undo all changes to this shape' onClick={() => revertInCutscene(id)}>
                                            <BsX />
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    )
                    : null
            }
            {
                leaving.length
                    ? (
                        <div className='group'>
                            <span className='label'>Exits</span>
                            {
                                leaving.map(id => (
                                    <div className='shape' key={id}>
                                        <span className='shapeName'>{nameOf(id)}</span>
                                        <select
                                            value={cutscene.exit[id] || 'none'}
                                            onChange={e => setTransition(id, 'exit', e.target.value as TRANSITION)}
                                            title='Exit animation'
                                        >
                                            {TRANSITIONS.map(t => <option key={t.value} value={t.value}>{t.value === 'none' ? 'Disappear' : t.label}</option>)}
                                        </select>
                                        <button className='remove' title='Keep this shape' onClick={() => revertInCutscene(id)}>
                                            <BsArrowCounterclockwise />
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    )
                    : null
            }
        </Card>
    );
}

const Card = styled.section`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 8px 8px 4px;
    padding: 10px 12px 12px;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    background-color: ${UI_COLORS.accentSoft};
    color: ${UI_COLORS.text};
    font-size: 13px;
    text-align: left;

    & .heading{
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: .06em;
        text-transform: uppercase;
        color: ${UI_COLORS.accent};
        &>.timeline{
            max-width: 60%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            letter-spacing: 0;
            text-transform: none;
            font-weight: 500;
            color: ${UI_COLORS.textMuted};
        }
    }

    & input, & select{
        height: 28px;
        min-width: 0;
        padding: 0 8px;
        border: 1px solid ${UI_COLORS.inputBorder};
        border-radius: 4px;
        background-color: white;
        color: ${UI_COLORS.text};
        font: inherit;
        font-size: 12px;
        outline: none;
        &:focus{
            border-color: ${UI_COLORS.accent};
            box-shadow: 0 0 0 2px rgba(59, 130, 246, .2);
        }
    }
    & input.name{
        height: 32px;
        font-size: 14px;
        font-weight: 600;
    }

    & .fields{
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        &>label{
            display: flex;
            flex-direction: column;
            gap: 4px;
            &>span{
                font-size: 11px;
                font-weight: 500;
                color: ${UI_COLORS.textMuted};
            }
            &.wide{
                grid-column: 1 / -1;
            }
        }
    }

    &>.hint{
        color: ${UI_COLORS.textMuted};
        font-size: 12px;
        line-height: 1.4;
    }

    & .group{
        display: flex;
        flex-direction: column;
        gap: 6px;
        &>.label{
            font-size: 11px;
            font-weight: 500;
            color: ${UI_COLORS.textMuted};
        }
        &>.hint{
            color: ${UI_COLORS.textMuted};
            font-size: 12px;
            line-height: 1.4;
        }
        &>.shape{
            &>select{
                height: 24px;
                margin-left: auto;
                padding: 0 4px;
            }
            &>select+.remove{
                margin-left: 0;
            }
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;
            padding: 6px 4px 6px 8px;
            border-radius: 4px;
            background-color: white;
            &>.shapeName{
                margin-right: 4px;
                font-weight: 600;
                text-transform: capitalize;
            }
            &>.remove{
                margin-left: auto;
            }
        }
    }

    & .chip{
        display: inline-flex;
        align-items: center;
        height: 20px;
        padding: 0 2px 0 8px;
        border-radius: 999px;
        background-color: ${UI_COLORS.accentSoft};
        color: ${UI_COLORS.accent};
        font-size: 11px;
        font-weight: 500;
    }

    & .chip>button, & .remove{
        display: inline-flex;
        padding: 2px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: inherit;
        cursor: pointer;
        &:hover{
            background-color: rgba(59, 130, 246, .15);
        }
    }
    & .remove{
        color: ${UI_COLORS.textMuted};
        &:hover{
            background-color: ${UI_COLORS.dangerSoft};
            color: ${UI_COLORS.danger};
        }
    }

    & .done{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 30px;
        border: none;
        border-radius: 4px;
        background-color: ${UI_COLORS.accent};
        color: white;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        &:hover{
            filter: brightness(.94);
        }
    }
`;

export default CutsceneProperties;
