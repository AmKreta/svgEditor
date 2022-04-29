import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { db } from '../../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import RenderRawSvg from '../uiEditor/renderRawSvg';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createNewFile } from '../../actions/pages/pages.actions';
import { AiFillDelete } from 'react-icons/ai';
import Icon from '../../components/icon.component';
import selfprojects from '../../seed/index';

const Projects: React.FC = function () {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const docs = useLiveQuery(() => db.doc.toArray()) || [];

    const openProject = (e: React.MouseEvent<HTMLSpanElement>) => {
        const index = parseInt(e.currentTarget.dataset['index']!);
        const doc = docs[index];
        dispatch(createNewFile(doc));
        navigate('/editor')
    }

    const deleteProject = function (e: React.MouseEvent<HTMLSpanElement>) {
        const index = parseInt(e.currentTarget.dataset['index']!);
        const doc = docs[index];
        db.doc.where('id').equals(doc.id).delete()
    }

    const openSelfProject=function(e: React.MouseEvent<HTMLSpanElement>){
        const name=e.currentTarget.dataset['name']!;
        const doc=(selfprojects as any)[name];
        dispatch(createNewFile(doc));
        navigate('/editor')
    }

    return (
        <ProjectsContainer>
            <h2>Projects</h2>
            <div className='projectCardContainer'>
                {
                    // rendering personal projects
                    Object.keys(selfprojects).map(item => (
                        <div className='projectCard' key={item}>
                            <div className='projectCardHeader'>
                                <div className='projectName'>{(selfprojects as any)[item].name}</div>
                            </div>
                            <span data-name={item} onClick={openSelfProject}>
                                <RenderRawSvg
                                    innerHtml={(selfprojects as any)[item].snapshots[0]}
                                    key={(selfprojects as any)[item].id}
                                    width={'22vw'}
                                    style={{ margin: '8px', backgroundColor: (selfprojects as any)[item].pages[0].svgStyle.backgroundColor }}
                                />
                            </span>
                            <div>{(selfprojects as any)[item].pages.length} {(selfprojects as any)[item].pages.length > 1 ? 'pages' : 'page'}</div>
                        </div>
                    ))
                }
                {
                    docs?.map((pages, index) => (
                        <div className='projectCard' key={pages.id}>
                            <div className='projectCardHeader'>
                                <div className='projectName'>{pages.name}</div>
                                <span data-index={index} onClick={deleteProject}>
                                    <Icon Icon={AiFillDelete} />
                                </span>
                            </div>
                            <span data-index={index} onClick={openProject}>
                                <RenderRawSvg
                                    innerHtml={pages.snapshots[0]}
                                    key={pages.id}
                                    width={'22vw'}
                                    style={{ margin: '8px', backgroundColor: pages.pages[0].svgStyle.backgroundColor }}
                                />
                            </span>
                            <div>{pages.pages.length} {pages.pages.length > 1 ? 'pages' : 'page'}</div>
                        </div>
                    ))
                }
            </div>
            {/* {
                !docs.length
                    ? <div className='noItems'>
                        No Project To Show
                    </div>
                    : null
            } */}
        </ProjectsContainer>
    );
}

const ProjectsContainer = styled.main`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            padding:${theme.spacing(2)}px ${theme.spacing(1.5)}px;
            &>h2{
                margin-bottom:${theme.spacing(2)}px;
            }
            &>div.projectCardContainer{
                display: flex;
                align-content: flex-start;
                flex-wrap: wrap;
                text-align: center;
                &>div.projectCard{
                   padding:${theme.spacing(1)}px ${theme.spacing(1.1)}px;
                    &>div.projectCardHeader{
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        text-transform: capitalize;
                        font-size: 17px;
                        font-weight: bold;
                        padding:0 8px;
                        &>span>svg{
                            opacity:.6;
                            &:hover{
                                cursor: pointer;
                            }
                            &:active{
                                opacity:1;
                            }
                        }
                    }
                }
            }
            &>div.noItems{
                position:absolute;
                top:50%;
                left:50%;
                transform:translate(-50%,-50%);
                font-size: 30px;
                opacity:.3;
            }
        `;
    }}
`;

export default Projects;