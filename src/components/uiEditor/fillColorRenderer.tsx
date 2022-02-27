import React from 'react';

const FillColorRenderer: React.FC<{ colorId: string }> = function ({ colorId }) {
    return (
        <svg>
            <rect x={0} y={0} height='100%' width='100%' stroke='#333' fill={`url('#${colorId}')`} rx={2} ry={2} />
        </svg>
    );
}

export default FillColorRenderer;