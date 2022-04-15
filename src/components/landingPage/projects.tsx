import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { db } from '../../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import RenderRawSvg from '../uiEditor/renderRawSvg';

const Projects: React.FC = function () {

    const docs = useLiveQuery(() => db.doc.toArray());

    console.log(docs);

    return (
        <ProjectsContainer>
            <h2>Projects</h2>
            <div className='projectCardContainer'>
                {
                    docs?.map(pages => (
                        <div className='projectCard'>
                            <div className='projectName'>{pages.name}</div>
                            <RenderRawSvg
                                shapes={pages.pages[0].shapes}
                                key={pages.id}
                                //height={135}
                                width={'22vw'}
                                style={{ margin: '8px' }}
                            />
                            <div>{pages.pages.length} {pages.pages.length > 1 ? 'pages' : 'page'}</div>
                        </div>
                    ))
                }
            </div>
        </ProjectsContainer>
    );
}

const ProjectsContainer = styled.main`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            padding:${theme.spacing(2)}px;
            &>h2{
                margin-bottom:${theme.spacing(2)}px;
            }
            &>div.projectCardContainer{
                display: flex;
                align-content: flex-start;
                flex-wrap: wrap;
                text-align: center;
                &>div.projectCard{
                    padding:${theme.spacing(2)}px ${theme.spacing(1.2)}px;
                    &>div.projectName{
                        text-align: left;
                        text-transform: capitalize;
                        font-size: 17px;
                        font-weight: bold;
                        padding-left: 8px;
                    }
                }
            }
        `;
    }}
`;

export default Projects;