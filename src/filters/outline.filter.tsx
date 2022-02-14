import React from 'react';
import { FILTER_TYPES } from './availableFilters';

export interface OUTLINE_FILTER {
    color: string;
    radius: number;
    blur: number;
    id: string;
    type: FILTER_TYPES;
}

export const getOutlineDefaultProps = function (id: string): OUTLINE_FILTER {
    return ({
        id,
        radius: 0,
        blur: 0,
        color: 'rgb(0,0,0)',
        type: FILTER_TYPES.OUTLINE,
    });
}

const Outline: React.FC<OUTLINE_FILTER> = function ({ color = 'currentColor', radius = 0, blur = 0, id }) {
    return (
        <filter id={id} width="200%" height="200%">
            <feFlood id="outline-color" flood-color={color} result="base" />
            <feMorphology result="bigger" in="SourceGraphic" operator="dilate" radius={radius} />
            <feColorMatrix result="mask" in="bigger" type="matrix"
                values="0 0 0 0 0
                       0 0 0 0 0
                       0 0 0 0 0
                       0 0 0 1 0" />
            <feComposite result="drop" in="base" in2="mask" operator="in" />
            <feGaussianBlur result="blur" in="drop" stdDeviation={blur} />
            <feBlend in="SourceGraphic" in2="blur" mode="normal" />
        </filter>
    );
}

export default Outline;