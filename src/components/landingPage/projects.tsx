import React from 'react';
import styled from 'styled-components';
import { db } from '../../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import RenderRawSvg from '../uiEditor/renderRawSvg';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createNewFile } from '../../actions/pages/pages.actions';
import { PAGES } from '../../actions/pages/pages.interface';
import { BsPlusLg, BsTrash } from 'react-icons/bs';
import selfprojects from '../../seed/index';
import { UI_COLORS } from '../../theme/uiTokens';

interface props {
    onCreateNew: () => void;
}

const examples: PAGES[] = Object.values(selfprojects as any);

const pageCount = (doc: PAGES) => `${doc.pages.length} ${doc.pages.length === 1 ? 'page' : 'pages'}`;

interface CARD_PROPS {
    doc: PAGES;
    onOpen: (doc: PAGES) => void;
    onDelete?: (doc: PAGES) => void;
}

const ProjectCard: React.FC<CARD_PROPS> = function ({ doc, onOpen, onDelete }) {
    return (
        <Card
            role='button'
            tabIndex={0}
            onClick={() => onOpen(doc)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(doc))}
            aria-label={`Open ${doc.name}`}
        >
            <div className='thumbnail' style={{ backgroundColor: doc.pages[0]?.svgStyle.backgroundColor }}>
                <RenderRawSvg innerHtml={doc.snapshots[0] || ''} width='100%' height='100%' />
            </div>
            <div className='meta'>
                <div>
                    <div className='name' title={doc.name}>{doc.name || 'Untitled'}</div>
                    <div className='pages'>{pageCount(doc)}</div>
                </div>
                {
                    onDelete
                        ? (
                            <button
                                className='delete'
                                title='Delete project'
                                aria-label={`Delete ${doc.name}`}
                                onClick={e => {
                                    e.stopPropagation();
                                    onDelete(doc);
                                }}
                                onKeyDown={e => e.stopPropagation()}
                            >
                                <BsTrash />
                            </button>
                        )
                        : null
                }
            </div>
        </Card>
    );
}

const Projects: React.FC<props> = function ({ onCreateNew }) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const docs = useLiveQuery(() => db.doc.toArray()) || [];

    const openProject = (doc: PAGES) => {
        dispatch(createNewFile(doc));
        navigate('/editor');
    }

    const deleteProject = (doc: PAGES) => {
        if (window.confirm(`Delete “${doc.name}”? This can't be undone.`)) {
            db.doc.where('id').equals(doc.id).delete();
        }
    }

    return (
        <>
            <Section id='projects'>
                <div className='sectionHeader'>
                    <h2>Your projects</h2>
                    <span className='hint'>Saved in this browser</span>
                </div>
                <div className='grid'>
                    <NewCard onClick={onCreateNew}>
                        <span className='plus'><BsPlusLg /></span>
                        <span className='label'>New file</span>
                        <span className='sub'>Start from a blank canvas</span>
                    </NewCard>
                    {
                        docs.map(doc => (
                            <ProjectCard key={doc.id} doc={doc} onOpen={openProject} onDelete={deleteProject} />
                        ))
                    }
                </div>
                {
                    docs.length === 0
                        ? <p className='empty'>Nothing saved yet. Use File → Save as… in the editor and your projects will show up here.</p>
                        : null
                }
            </Section>
            <Section id='examples'>
                <div className='sectionHeader'>
                    <h2>Examples</h2>
                    <span className='hint'>Open one to see how it's built</span>
                </div>
                <div className='grid'>
                    {
                        examples.map(doc => (
                            <ProjectCard key={doc.id} doc={doc} onOpen={openProject} />
                        ))
                    }
                </div>
            </Section>
        </>
    );
}

export const Section = styled.section`
    padding: 24px 0;

    &>.sectionHeader{
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 16px;
        &>h2{
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -.01em;
        }
        &>.hint{
            color: ${UI_COLORS.textMuted};
            font-size: 13px;
        }
    }

    &>.grid{
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
    }

    &>.empty{
        margin-top: 12px;
        color: ${UI_COLORS.textMuted};
        font-size: 13px;
    }
`;

const cardHover = `
    border-color: ${UI_COLORS.inputBorder};
    box-shadow: 0 10px 24px rgba(17, 24, 39, .08);
    transform: translateY(-2px);
`;

const Card = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${UI_COLORS.border};
    border-radius: 12px;
    background-color: ${UI_COLORS.surface};
    overflow: hidden;
    cursor: pointer;
    transition: border-color .15s, box-shadow .15s, transform .15s;

    &:hover{
        ${cardHover}
    }
    &:focus-visible{
        outline: 2px solid ${UI_COLORS.accent};
        outline-offset: 2px;
    }

    &>.thumbnail{
        aspect-ratio: 1175 / 580;
        border-bottom: 1px solid ${UI_COLORS.border};
        overflow: hidden;
        &>svg{
            display: block;
            margin: 0;
            outline: none;
            pointer-events: none;
            background-color: transparent;
        }
    }

    &>.meta{
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 12px 14px;
        &>div{
            min-width: 0;
        }
        & .name{
            font-weight: 600;
            font-size: 14px;
            text-transform: capitalize;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        & .pages{
            margin-top: 2px;
            color: ${UI_COLORS.textMuted};
            font-size: 12px;
        }
        & .delete{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            height: 30px;
            width: 30px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: ${UI_COLORS.textMuted};
            opacity: 0;
            transition: opacity .15s, background-color .15s, color .15s;
            &:hover{
                background-color: ${UI_COLORS.dangerSoft};
                color: ${UI_COLORS.danger};
            }
            &:focus-visible{
                opacity: 1;
            }
        }
    }

    &:hover .delete, &:focus-within .delete{
        opacity: 1;
    }

    @media (hover: none){
        & .delete{
            opacity: 1;
        }
    }
`;

const NewCard = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 180px;
    border: 1.5px dashed ${UI_COLORS.inputBorder};
    border-radius: 12px;
    background-color: transparent;
    color: ${UI_COLORS.text};
    transition: border-color .15s, background-color .15s;

    &>.plus{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        width: 40px;
        margin-bottom: 4px;
        border-radius: 50%;
        background-color: ${UI_COLORS.accentSoft};
        color: ${UI_COLORS.accent};
    }
    &>.label{
        font-weight: 600;
        font-size: 14px;
    }
    &>.sub{
        color: ${UI_COLORS.textMuted};
        font-size: 12px;
    }
    &:hover{
        border-color: ${UI_COLORS.accent};
        background-color: ${UI_COLORS.surface};
    }
    &:focus-visible{
        outline: 2px solid ${UI_COLORS.accent};
        outline-offset: 2px;
    }
`;

export default Projects;
