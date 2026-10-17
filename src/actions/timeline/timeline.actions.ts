import { PREVIEW } from '../../timeline/player';
import { CLIP_REF, EDITING } from '../../timeline/timeline.types';

export enum TIMELINE_ACTION_TYPES {
    SET_PLAYBACK = 'TIMELINE/SET_PLAYBACK',
    SET_SELECTION = 'TIMELINE/SET_SELECTION',
    SET_EDITING = 'TIMELINE/SET_EDITING',
}

export interface TIMELINE_UI_STATE {
    /** playhead, seconds */
    time: number;
    playing: boolean;
    /** animated shapes at `time`; null while editing shapes or cutscenes */
    preview: PREVIEW | null;
    /** selected cutscenes */
    selection: CLIP_REF[];
    /** the cutscene that shape edits currently go into */
    editing: EDITING | null;
}

export type SET_PLAYBACK_ACTION = { type: TIMELINE_ACTION_TYPES.SET_PLAYBACK, payload: Partial<Pick<TIMELINE_UI_STATE, 'time' | 'playing' | 'preview'>> };
export type SET_SELECTION_ACTION = { type: TIMELINE_ACTION_TYPES.SET_SELECTION, payload: CLIP_REF[] };
export type SET_EDITING_ACTION = { type: TIMELINE_ACTION_TYPES.SET_EDITING, payload: EDITING | null };
export type TIMELINE_ACTION = SET_PLAYBACK_ACTION | SET_SELECTION_ACTION | SET_EDITING_ACTION;

export const setPlayback = (payload: SET_PLAYBACK_ACTION['payload']): SET_PLAYBACK_ACTION => ({ type: TIMELINE_ACTION_TYPES.SET_PLAYBACK, payload });
export const setTimelineSelection = (payload: CLIP_REF[]): SET_SELECTION_ACTION => ({ type: TIMELINE_ACTION_TYPES.SET_SELECTION, payload });
export const setEditing = (payload: EDITING | null): SET_EDITING_ACTION => ({ type: TIMELINE_ACTION_TYPES.SET_EDITING, payload });
