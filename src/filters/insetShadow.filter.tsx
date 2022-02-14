import React from 'react';
import { FILTER_TYPES } from './availableFilters';

export interface INSET_SHADOW_FILTER {
    id: string;
    blur: number;
    xOffset: number;
    yOffset: number;
    color: string;
    type: FILTER_TYPES;
}

export const getInsetShadowDefaultProps = function (id: string): INSET_SHADOW_FILTER {
    return {
        id,
        blur: 0,
        xOffset: 0,
        yOffset: 0,
        color: '#000000',
        type: FILTER_TYPES.INSET_SHADOW,
    };
}

const InsetShadow: React.FC<INSET_SHADOW_FILTER> = function ({ id, xOffset = 0, yOffset = 0, color = '#000000', blur = 0 }) {
    return (
        <filter id={id} width="200%" height="200%">
            <feComponentTransfer in='SourceAlpha'>
                <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation={blur} />
            <feOffset dx={xOffset} dy={yOffset} result="offsetblur" />
            <feFlood flood-color={color} result="color" />
            <feComposite in2="offsetblur" operator="in" />
            <feComposite in2="SourceAlpha" operator="in" />
            <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode />
            </feMerge>
        </filter>
    );
}

export default InsetShadow;