import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import Modal from '../modal.component';

const Demo: React.FC = function () {

    const videos = useMemo(() => [
        {
            name: 'Product Card',
            videoId: 'rqtKGGTlQC4',
        },
        {
            name: 'LinkedIn Profile',
            videoId: 'keOTSSgMT94',
        },
        {
            name: 'Svg Filters',
            videoId: 'vGTZXAVo89o'
        },
        {
            name: 'Svg Gradients',
            videoId: 'UZCbRxu-7zY',
        }
    ], []);

    const [activeVideo, setActiveVideo] = useState<null | string>(null);

    const playVideo = (e: React.MouseEvent<HTMLDivElement>) => {
        const videoId = e.currentTarget.dataset['id']!;
        setActiveVideo(videoId);
    }

    const stopVideo = () => setActiveVideo(null);

    return (
        <DemoContainer>
            <h2>Demo</h2>
            <div className='videos'>
                {
                    videos.map(video => (
                        <div className='previewContainer' data-id={video.videoId} onClick={playVideo}>
                            <div className="preview">
                                <img src={`https://img.youtube.com/vi/${video.videoId}/0.jpg`} />
                            </div>
                            <h4 className="videoName">
                                {video.name}
                            </h4>
                        </div>
                    ))
                }
            </div>
            {
                activeVideo
                    ? <Modal onOverlayClick={stopVideo}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${activeVideo}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </Modal>
                    : null
            }
        </DemoContainer>
    );
}

export default Demo;

const DemoContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            margin:${theme.spacing(2)}px 0;

            &>h2{
                margin-bottom: ${theme.spacing(4)}px;
            }

            &>.videos{
                display: flex;
                align-items: center;
                justify-content: flex-start;
                &>.previewContainer{
                    width:calc(25% - 32px);
                    margin:0 16px;
                    &>.preview{
                        height:90%;
                        overflow: hidden;
                        aspect-ratio: 4/3;
                        &>img{
                            max-height: 100%;
                        }
                    }
                    &>.videoName{
                        margin-top: ${theme.spacing(1)}px;
                    }
                    &:hover{
                        cursor:pointer;
                    }
                }
            }
        `;
    }}
`;