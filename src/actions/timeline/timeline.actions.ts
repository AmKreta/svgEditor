import { PREVIEW } from '../../timeline/player';
import { RECORDING } from '../../timeline/timeline.types';

export enum TIMELINE_ACTION_TYPES {
    SET_PLAYBACK = 'TIMELINE/SET_PLAYBACK',
    SET_RECORDING = 'TIMELINE/SET_RECORDING',
}

export interface TIMELINE_UI_STATE {
    /** playhead, seconds */
    time: number;
    playing: boolean;
    /** animated shapes at `time`; null while editing the start state */
    preview: PREVIEW | null;
    recording: RECORDING | null;
}

export type SET_PLAYBACK_ACTION = { type: TIMELINE_ACTION_TYPES.SET_PLAYBACK, payload: Partial<Omit<TIMELINE_UI_STATE, 'recording'>> };
export type SET_RECORDING_ACTION = { type: TIMELINE_ACTION_TYPES.SET_RECORDING, payload: RECORDING | null };
export type TIMELINE_ACTION = SET_PLAYBACK_ACTION | SET_RECORDING_ACTION;

export const setPlayback = (payload: SET_PLAYBACK_ACTION['payload']): SET_PLAYBACK_ACTION => ({ type: TIMELINE_ACTION_TYPES.SET_PLAYBACK, payload });
export const setRecording = (payload: RECORDING | null): SET_RECORDING_ACTION => ({ type: TIMELINE_ACTION_TYPES.SET_RECORDING, payload });
