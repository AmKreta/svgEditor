import React, { useState } from 'react';
import { GRADIENT } from '../../actions/pages/pages.interface';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import Button from '../button.component';
import ColorEditor from '../valueEditor/colorEditor';
import NumberEditor from '../valueEditor/numberEditor';
import OptionEditor from '../valueEditor/optionEditor';

const CreateGradient: React.FC<any> = function ({ }) {

    const [gradient, setGradient] = useState<GRADIENT>({
        type: 'linear',
        stops: [
            { stopColor: 'rgb(0,0,0)', offset: 0, stopOpacity: 1 },
            { stopColor: 'rgb(255,255,255)', offset: 100, stopOpacity: 1 }
        ],
        spreadMethod: 'pad',
        rotate: 0,
    });

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
            stops.push({ stopColor: 'rgb(255,255,255)', offset: 100, stopOpacity: 1 });
            return { ...prevState, stops };
        })
    }

    const propsEditor = function (props: Partial<GRADIENT>) {
        setGradient(prevState => ({ ...prevState, ...props }));
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
                    value={gradient.spreadMethod}
                    options={['pad', 'repeat', 'reflect']}
                    onChange={val => setGradient(prevState => ({ ...prevState, spreadMethod: val as any }))}
                    label='Spread Type'
                />
                <NumberEditor
                    value={gradient.rotate}
                    onChange={val => val >= 0 && val <= 360 && propsEditor({ rotate: val })}
                    label='rotate'
                    step={20}
                />
            </div>
            <div className='preview'>
                <svg>
                    {
                        gradient.type === 'linear'
                            ? (
                                <linearGradient id='editGrad' spreadMethod={gradient.spreadMethod} gradientTransform={`rotate(${gradient.rotate})`} gradientUnits="objectBoundingBox">
                                    {
                                        gradient.stops.map((stop, index) => (
                                            <stop offset={`${stop.offset}%`} style={{ stopColor: stop.stopColor, stopOpacity: stop.stopOpacity }} key={index} />
                                        ))
                                    }
                                </linearGradient>
                            )
                            : (
                                <radialGradient id='editGrad' spreadMethod={gradient.spreadMethod} gradientTransform={`rotate(${gradient.rotate})`} gradientUnits="objectBoundingBox" transform-origin='center center'>
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
                            <Button title='❌' />
                        </div>
                    ))
                }
            </div>
            <div className='footer'>
                <Button title='Add' />
                <Button title='Cancel' />
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
            grid-template-rows: 1fr 8fr 1fr;
            grid-template-areas: 'header header'
            'preview stopEditor'
            'footer footer';
            height:100%;
            padding:${theme.spacing(2)}px;
            &>.header{
                grid-area: header;
                text-align: center;
            }

            &>.preview{
                display: flex;
                align-items: center;
                justify-content: center;
                position:relative;
                bottom:${theme.spacing(2)}px;
                &>svg{
                    height:50%;
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
                        transform:scale(.9);
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