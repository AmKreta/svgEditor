import React from 'react';
import styled from 'styled-components';
import { BsArrowRight, BsBezier2, BsDownload, BsFiles, BsPalette, BsUpload } from 'react-icons/bs';
import { LANDING_ACTIONS, LandingButton } from './shared';
import { UI_COLORS } from '../../theme/uiTokens';
import RenderRawSvg from '../uiEditor/renderRawSvg';
import selfprojects from '../../seed/index';

const FEATURES = [
    { icon: BsBezier2, text: 'Shapes, lines and freehand paths' },
    { icon: BsPalette, text: 'Gradients, filters and shadows' },
    { icon: BsFiles, text: 'Multi-page documents' },
    { icon: BsDownload, text: 'Export to SVG or JSON' },
];

const showcase = (selfprojects as any).foodCartSample;

const Hero: React.FC<LANDING_ACTIONS> = function ({ onCreateNew, onImport }) {
    return (
        <StyledHero>
            <div className='copy'>
                <h1>Design SVG graphics, right in your browser</h1>
                <p className='lead'>
                    Draw shapes, style them with gradients and filters, and export clean SVG.
                    Nothing to install, and your work stays on your device.
                </p>
                <div className='actions'>
                    <LandingButton variant='primary' onClick={onCreateNew}>
                        <span>Start a new design</span>
                        <BsArrowRight />
                    </LandingButton>
                    <LandingButton onClick={onImport}>
                        <BsUpload />
                        <span>Open a JSON file</span>
                    </LandingButton>
                </div>
                <ul className='features'>
                    {
                        FEATURES.map(feature => (
                            <li key={feature.text}>
                                <feature.icon />
                                <span>{feature.text}</span>
                            </li>
                        ))
                    }
                </ul>
            </div>
            {
                showcase
                    ? (
                        <div className='showcase' aria-hidden='true'>
                            <div className='window'>
                                <div className='windowBar'>
                                    <span /><span /><span />
                                </div>
                                <RenderRawSvg
                                    innerHtml={showcase.snapshots[0]}
                                    width='100%'
                                    height='100%'
                                    style={{ display: 'block', backgroundColor: showcase.pages[0].svgStyle.backgroundColor }}
                                />
                            </div>
                        </div>
                    )
                    : null
            }
        </StyledHero>
    );
}

const StyledHero = styled.section`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    align-items: center;
    gap: 48px;
    padding: 64px 0 56px;

    &>.copy{
        &>h1{
            font-size: clamp(30px, 4vw, 44px);
            line-height: 1.1;
            letter-spacing: -.02em;
            font-weight: 700;
        }
        &>.lead{
            margin-top: 16px;
            max-width: 480px;
            color: ${UI_COLORS.textMuted};
            font-size: 16px;
            line-height: 1.6;
        }
        &>.actions{
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 28px;
        }
        &>.features{
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px 20px;
            margin-top: 32px;
            list-style: none;
            &>li{
                display: flex;
                align-items: center;
                gap: 10px;
                color: ${UI_COLORS.textMuted};
                font-size: 14px;
                &>svg{
                    flex-shrink: 0;
                    height: 16px;
                    width: 16px;
                    color: ${UI_COLORS.accent};
                }
            }
        }
    }

    &>.showcase{
        position: relative;
        &::before{
            content: '';
            position: absolute;
            inset: -24px -16px;
            border-radius: 32px;
            background: radial-gradient(60% 60% at 70% 30%, rgba(59, 130, 246, .18), transparent 70%),
                        radial-gradient(50% 50% at 20% 80%, rgba(236, 72, 153, .12), transparent 70%);
            z-index: 0;
        }
        &>.window{
            position: relative;
            border: 1px solid ${UI_COLORS.border};
            border-radius: 12px;
            background-color: ${UI_COLORS.surface};
            box-shadow: 0 24px 60px rgba(17, 24, 39, .14), 0 4px 12px rgba(17, 24, 39, .06);
            overflow: hidden;
            &>.windowBar{
                display: flex;
                gap: 6px;
                padding: 10px 12px;
                border-bottom: 1px solid ${UI_COLORS.border};
                &>span{
                    height: 10px;
                    width: 10px;
                    border-radius: 50%;
                    background-color: ${UI_COLORS.pressed};
                }
            }
            &>svg{
                margin: 0;
                outline: none;
                aspect-ratio: 1175 / 580;
                pointer-events: none;
            }
        }
    }

    @media (max-width: 900px){
        grid-template-columns: 1fr;
        gap: 32px;
        padding: 40px 0;
    }
`;

export default Hero;
