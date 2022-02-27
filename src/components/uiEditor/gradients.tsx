import React from 'react';
import { useSelector } from 'react-redux';
import { getCurrentProjectGradients } from '../../selector/selector';
import { State } from '../../store/store';
import { GRADIENT } from '../../actions/pages/pages.interface';

const Gradients: React.FC = function () {
    const gradients = useSelector<State, { [key: string]: GRADIENT; }>(getCurrentProjectGradients);
    return <>
        {
            Object.keys(gradients).map(gradientId => {
                const gradient = gradients[gradientId];
                return (
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
                                transform-origin='center center'
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
                );
            })
        }
    </>
}

export default Gradients;