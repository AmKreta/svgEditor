import { OUTLINE_FILTER } from './outline.filter';
import { INSET_SHADOW_FILTER } from './insetShadow.filter';

export type AVAILABLE_FILTERS = OUTLINE_FILTER | INSET_SHADOW_FILTER;

export enum FILTER_TYPES {
    OUTLINE = 'outline',
    INSET_SHADOW = 'insetShadow'
}