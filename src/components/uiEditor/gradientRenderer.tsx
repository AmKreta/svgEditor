import React from 'react';

const GradientRenderer: React.FC<{ gradientId: string }> = function ({ gradientId }) {
    return (
        <svg>
            <rect x={0} y={0} height='100%' width='100%' stroke='#333' fill={`url('#${gradientId}')`} rx={2} ry={2} />
        </svg>
    );
}

export default GradientRenderer;