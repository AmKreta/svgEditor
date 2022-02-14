import { AVAILABLE_FILTERS, FILTER_TYPES } from "../filters/availableFilters";

export type MEASUREMENT = 'px' | '%';

export interface CSS_FILTERS {
    blur?: number;
    brightness?: number;
    contrast?: number;
    dropShadow?: {
        xOffset: number;
        yOffset: number;
        blur: number;
        color: string;
    }[];
    grayscale?: number;
    hueRotate?: number;
    invert?: number;
    opacity?: number;
    saturate?: number;
    sepia?: number;
}

export interface SVG_FILTERS {
    [FILTER_TYPES.OUTLINE]?: string[],
    [FILTER_TYPES.INSET_SHADOW]?: string[]
}

export interface STYLE {
    fill: string;
    fillOpacity: number;
    fillRule: 'nonzero' | 'evenodd' | 'inherit';
    stroke: string;
    strokeWidth: number;
    strokeWidth_unit: 'px' | '%';
    strokeDasharray: Array<number>;
    strokeDashoffset: number;
    strokeLinecap: 'butt' | 'round' | 'square';
    strokeOpacity: number;
    strokeLinejoin: 'bevel' | 'miter' | 'round';
    strokeMitterlimit: number;
    rotate: number;
    translate: [number, number];
    skewX: number;
    skewY: number;
    scale: [number, number];
    cssFilters: CSS_FILTERS;
    svgFilters: SVG_FILTERS;
};