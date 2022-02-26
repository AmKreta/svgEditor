import React from 'react';
import { GRADIENT } from '../../actions/pages/pages.interface';

const GradientRenderer: React.FC<{ gradient: GRADIENT, gradientId: string }> = function ({ gradient, gradientId }) {
    return (
        <svg style={{height:'100%',width:'100%'}}>
            {
                gradient.type === 'linear'
                    ? (
                        <linearGradient id={gradientId} spreadMethod={gradient.spreadMethod} gradientTransform={`rotate(${gradient.rotate}) skewX(${gradient.skewX}) skewY(${gradient.skewY})`}>
                            {
                                gradient.stops.map((stop, index) => (
                                    <stop offset={`${stop.offset}%`} style={{ stopColor: stop.stopColor, stopOpacity: stop.stopOpacity }} key={index} />
                                ))
                            }
                        </linearGradient>
                    )
                    : (
                        <radialGradient
                            id={gradientId}
                            spreadMethod={gradient.spreadMethod}
                            gradientTransform={`rotate(${gradient.rotate}) skewX(${gradient.skewX}) skewY(${gradient.skewY})`}
                            cx={gradient.cx + '%'}
                            cy={gradient.cy + '%'}
                            fx={gradient.fx + '%'}
                            fy={gradient.fy + '%'}
                            fr={gradient.fr + '%'}
                        >
                            {
                                gradient.stops.map((stop, index) => (
                                    <stop offset={`${stop.offset}%`} style={{ stopColor: stop.stopColor, stopOpacity: stop.stopOpacity }} key={index} />
                                ))
                            }
                        </radialGradient>
                    )
            }
            <rect x={0} y={0} height='100%' width='100%' stroke='#333' fill={`url('#${gradientId}')`} rx={2} ry={2} />
        </svg>
    );
}

export default GradientRenderer;