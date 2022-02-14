import React from 'react';

export interface SHAPE_SELECTOR_PROPS {
    show: boolean;
    x: number;
    y: number;
    height: number;
    width: number
}

export const initialShapeSelectorProps = {
    show: false,
    x: 0,
    y: 0,
    height: 0,
    width: 0
};

const ShapeSelector: React.FC<SHAPE_SELECTOR_PROPS> = function ({ show, x, y, height, width }) {
    return (
        show
            ? (
                <polygon
                    points={`${x},${y} ${x + width},${y} ${x + width},${y + height} ${x},${y + height}`}
                    stroke='rgba(0,0,255,.5)'
                    fill='rgba(0,0,255,.1)'
                    id='Shape-Selector'
                />
            )
            : null
    );
}

export default ShapeSelector;