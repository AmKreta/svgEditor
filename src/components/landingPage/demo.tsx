import React, { useState } from 'react';
import styled from 'styled-components';
import { BsPlayFill, BsX } from 'react-icons/bs';
import Modal from '../modal.component';
import { Section } from './projects';
import { UI_COLORS } from '../../theme/uiTokens';
import { useEventListener } from '../../hooks/useEventListener';

const VIDEOS = [
    { name: 'Product card', videoId: 'rqtKGGTlQC4' },
    { name: 'LinkedIn profile', videoId: 'keOTSSgMT94' },
    { name: 'SVG filters', videoId: 'vGTZXAVo89o' },
    { name: 'SVG gradients', videoId: 'UZCbRxu-7zY' },
];

const Demo: React.FC = function () {

    const [activeVideo, setActiveVideo] = useState<null | typeof VIDEOS[number]>(null);

    const stopVideo = () => setActiveVideo(null);

    useEventListener('keydown', (e: KeyboardEvent) => {
        activeVideo && e.key === 'Escape' && stopVideo();
    });

    return (
        <Section id='demos'>
            <div className='sectionHeader'>
                <h2>Watch it in action</h2>
                <span className='hint'>Short walkthroughs of real designs</span>
            </div>
            <div className='grid'>
                {
                    VIDEOS.map(video => (
                        <VideoCard key={video.videoId} onClick={() => setActiveVideo(video)} aria-label={`Play ${video.name} demo`}>
                            <span className='preview'>
                                <img src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} alt='' loading='lazy' />
                                <span className='play'><BsPlayFill /></span>
                            </span>
                            <span className='videoName'>{video.name}</span>
                        </VideoCard>
                    ))
                }
            </div>
            {
                activeVideo
                    ? (
                        <Modal
                            onOverlayClick={(e: MouseEvent) => {
                                if (e.target === e.currentTarget) {
                                    stopVideo();
                                }
                            }}
                            modalStyle={{ width: 'min(1000px, 92vw)', height: 'auto', background: 'black', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}
                        >
                            <Player>
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
                                    title={`${activeVideo.name} demo`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                <button className='close' onClick={stopVideo} aria-label='Close video' title='Close (Esc)'>
                                    <BsX />
                                </button>
                            </Player>
                        </Modal>
                    )
                    : null
            }
        </Section>
    );
}

export default Demo;

const VideoCard = styled.button`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    border: none;
    background: transparent;
    color: ${UI_COLORS.text};
    text-align: left;

    &>.preview{
        position: relative;
        display: block;
        aspect-ratio: 16 / 9;
        border-radius: 12px;
        overflow: hidden;
        background-color: ${UI_COLORS.pressed};
        box-shadow: inset 0 0 0 1px rgba(17, 24, 39, .06);

        &>img{
            height: 100%;
            width: 100%;
            /* the thumbnails are 4:3 with letterboxing; cropping to 16:9 hides the bars */
            object-fit: cover;
            transition: transform .3s;
        }

        &>.play{
            position: absolute;
            top: 50%;
            left: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 48px;
            width: 48px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, .92);
            color: ${UI_COLORS.text};
            box-shadow: 0 4px 14px rgba(0, 0, 0, .25);
            transform: translate(-50%, -50%);
            transition: transform .15s;
            &>svg{
                height: 26px;
                width: 26px;
                margin-left: 3px;
            }
        }
    }

    &>.videoName{
        font-weight: 600;
        font-size: 14px;
    }

    &:hover>.preview{
        &>img{
            transform: scale(1.04);
        }
        &>.play{
            transform: translate(-50%, -50%) scale(1.08);
        }
    }
    &:focus-visible{
        outline: none;
        &>.preview{
            outline: 2px solid ${UI_COLORS.accent};
            outline-offset: 2px;
        }
    }
`;

const Player = styled.div`
    position: relative;
    aspect-ratio: 16 / 9;

    &>iframe{
        display: block;
        height: 100%;
        width: 100%;
    }

    &>.close{
        position: absolute;
        top: 10px;
        right: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 34px;
        width: 34px;
        border: none;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, .55);
        color: white;
        cursor: pointer;
        &>svg{
            height: 22px;
            width: 22px;
        }
        &:hover{
            background-color: rgba(0, 0, 0, .8);
        }
    }
`;
