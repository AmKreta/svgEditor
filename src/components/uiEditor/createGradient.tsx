import React, { useState } from 'react';
import { GRADIENT } from '../../actions/pages/pages.interface';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import Button from '../button.component';
import ColorEditor from '../valueEditor/colorEditor';
import NumberEditor from '../valueEditor/numberEditor';
import OptionEditor from '../valueEditor/optionEditor';
import { useDispatch } from 'react-redux';
import { addGradientInPalette, editPaletteGradient } from '../../actions/pages/pages.actions';
import generateId from '../../utils/idGenerator';

interface props {
    closeGradientCreater: Function;
    selectedGradient?: GRADIENT;
    gradientId?: string;
}

const CreateGradient: React.FC<props> = function ({ closeGradientCreater, selectedGradient, gradientId }) {

    const [gradient, setGradient] = useState<GRADIENT>(selectedGradient || {
        type: 'linear',
        stops: [
            { stopColor: 'rgb(0,0,0)', offset: 0, stopOpacity: 1 },
            { stopColor: '#ffffff', offset: 100, stopOpacity: 1 }
        ],
        spreadMethod: 'pad',
        rotate: 0,
        skewX: 0,
        skewY: 0,
        cx: 50,
        cy: 50,
        fr: 0,
        fx: 50,
        fy: 50
    });

    const dispatch = useDispatch();

    const stopEditor = function (props: Partial<{ stopColor: string, offset: number, stopOpacity: number }>, index: number) {
        setGradient(prevState => {
            const stops = [...prevState.stops];
            stops[index] = { ...stops[index], ...props };
            return { ...prevState, stops };
        })
    }

    const addStopColor = function () {
        setGradient(prevState => {
            const stops = [...prevState.stops];
            stops.push({ stopColor: '#000', offset: 100, stopOpacity: 1 });
            return { ...prevState, stops };
        })
    }

    const removeStopColor = function (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if (gradient.stops.length > 2) {
            setGradient(prevState => {
                const index = parseInt((e.currentTarget.dataset as any).dataset['index']);
                const stops = prevState.stops.splice(index, 1);
                return { ...prevState, stops };
            });
        }
    }

    const propsEditor = function (props: Partial<GRADIENT>) {
        setGradient(prevState => ({ ...prevState, ...props }));
    }

    const addGradient = function () {
        const newGradient: GRADIENT = {
            type: gradient.type,
            stops: gradient.stops
        };
        gradient.spreadMethod !== 'pad' && (newGradient.spreadMethod = gradient.spreadMethod);
        gradient.rotate && (newGradient.rotate = gradient.rotate);
        gradient.skewX && (newGradient.skewX = gradient.skewX);
        gradient.skewY && (newGradient.skewY = gradient.skewY);
        if (gradient.type === 'radial') {
            gradient.cx === 50 || (newGradient.cx = gradient.cx);
            gradient.cy === 50 || (newGradient.cy = gradient.cy);
            gradient.fx === 50 || (newGradient.fx = gradient.fx);
            gradient.fy === 50 || (newGradient.fy = gradient.fy);
            gradient.fr && (newGradient.fr = gradient.fr);
        }

        if (gradientId) {
            dispatch(editPaletteGradient({ id: gradientId, newGradient }))
        }
        else {
            dispatch(addGradientInPalette(newGradient));
        }
        closeGradientCreater();
    }

    return (
        <GradientEditor>
            <div className='header'>
                <OptionEditor
                    value={gradient.type}
                    options={['linear', 'radial']}
                    onChange={val => setGradient(prevState => ({ ...prevState, type: val as any }))}
                    label='Gradient Type'
                />
                <OptionEditor
                    value={gradient.spreadMethod || 'pad'}
                    options={['pad', 'repeat', 'reflect']}
                    onChange={val => setGradient(prevState => ({ ...prevState, spreadMethod: val as any }))}
                    label='Spread Type'
                />
                <NumberEditor
                    value={gradient.rotate || 0}
                    onChange={val => val >= 0 && val <= 360 && propsEditor({ rotate: val })}
                    label='rotate'
                    step={20}
                />
                <NumberEditor
                    value={gradient.skewX || 0}
                    onChange={val => val >= 0 && val <= 100 && propsEditor({ skewX: val })}
                    label='skewX'
                    step={5}
                />
                <NumberEditor
                    value={gradient.skewY || 0}
                    onChange={val => val >= 0 && val <= 100 && propsEditor({ skewY: val })}
                    label='skewY'
                    step={5}
                />
                {
                    gradient.type === 'radial'
                        ? (
                            <>
                                <NumberEditor
                                    value={gradient.cx || 50}
                                    onChange={val => val >= 0 && val <= 100 && propsEditor({ cx: val })}
                                    label='cx'
                                    step={5}
                                />
                                <NumberEditor
                                    value={gradient.cy || 50}
                                    onChange={val => val >= 0 && val <= 100 && propsEditor({ cy: val })}
                                    label='cy'
                                    step={5}
                                />
                                <NumberEditor
                                    value={gradient.fx || 50}
                                    onChange={val => val >= 0 && val <= 100 && propsEditor({ fx: val })}
                                    label='fx'
                                    step={5}
                                />
                                <NumberEditor
                                    value={gradient.fy || 50}
                                    onChange={val => val >= 0 && val <= 100 && propsEditor({ fy: val })}
                                    label='fy'
                                    step={5}
                                />
                                <NumberEditor
                                    value={gradient.fr || 0}
                                    onChange={val => val >= 0 && val <= 100 && propsEditor({ fr: val })}
                                    label='fr'
                                    step={5}
                                />
                            </>
                        )
                        : null
                }
            </div>
            <div className='preview'>
                <svg>
                    {
                        gradient.type === 'linear'
                            ? (
                                <linearGradient id='editGrad' spreadMethod={gradient.spreadMethod} gradientTransform={`rotate(${gradient.rotate}) skewX(${gradient.skewX}) skewY(${gradient.skewY})`} gradientUnits="userSpaceOnUse">
                                    {
                                        gradient.stops.map((stop, index) => (
                                            <stop offset={`${stop.offset}%`} style={{ stopColor: stop.stopColor, stopOpacity: stop.stopOpacity }} key={index} />
                                        ))
                                    }
                                </linearGradient>
                            )
                            : (
                                <radialGradient
                                    id='editGrad'
                                    spreadMethod={gradient.spreadMethod}
                                    gradientTransform={`rotate(${gradient.rotate}) skewX(${gradient.skewX}) skewY(${gradient.skewY})`}
                                    gradientUnits="userSpaceOnUse"
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
                    }
                    <rect x={0} y={0} height='200' width='100%' stroke='#ccc' fill='url(#editGrad)' />
                </svg>
            </div>
            <div className='stopEditor'>
                <Button title='Add Stops' onClick={addStopColor} />
                {
                    gradient.stops.map((stop, index) => (
                        <div key={index}>
                            <ColorEditor value={stop.stopColor} onChange={val => stopEditor({ stopColor: val }, index)} label='Stop Color' />
                            <NumberEditor value={stop.offset} onChange={val => val >= 0 && val <= 100 && stopEditor({ offset: val }, index)} label='offset' step={5} />
                            <NumberEditor value={stop.stopOpacity} onChange={val => val >= 0 && val <= 1 && stopEditor({ stopOpacity: val }, index)} label='opacity' step={.1} />
                            <Button title='❌' onClick={removeStopColor} data-index={index} disabled={gradient.stops.length <= 2} />
                        </div>
                    ))
                }
            </div>
            <div className='footer'>
                <Button title={gradientId ? 'Save' : 'Add'} onClick={addGradient} />
                <Button title='Cancel' onClick={closeGradientCreater as any} />
            </div>
        </GradientEditor>
    );
}

const GradientEditor = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            display:grid;
            grid-template-columns: repeat(2,1fr);
            grid-template-rows: 2fr 7fr 1fr;
            grid-template-areas: 'header header'
            'preview stopEditor'
            'footer footer';
            height:100%;
            padding:${theme.spacing(2)}px;
            grid-row-gap: ${theme.spacing(1)}px;
            &>.header{
                grid-area: header;
                text-align: center;
            }

            &>.preview{
                display: flex;
                align-items: center;
                justify-content: center;
                position:relative;
                top:${theme.spacing(2)}px;
                right:${theme.spacing(2)}px;
                &>svg{
                    height:80%;
                    width:80%;
                }
            }

            &>.stopEditor{
                grid-area: stopEditor;
                overflow-y: scroll;
                text-align: center;

                &>button{
                    margin:${theme.spacing(1)}px auto;
                }

                &>div{
                    display:flex;
                    align-items: center;
                    &>button{
                        position:relative;
                        top:7px;
                        margin-left: 8px;
                        transform:scale(.85);
                    }
                }
            }

            &>.footer{
                grid-area: footer;
                display:flex;
                align-items: center;
                justify-content: center;
                position:relative;
                top:12px;
                &>button{
                    margin:0 ${theme.spacing(2)}px;
                }
            }
        `;
    }}
`;
export default CreateGradient;