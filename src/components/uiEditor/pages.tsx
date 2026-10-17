import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import Button from '../button.component';
import { BsDash, BsPlus } from 'react-icons/bs';
import { UI_COLORS, UI_SHADOWS } from '../../theme/uiTokens';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../store/store';
import { SHAPE_COLLECTION } from '../../actions/pages/pages.interface';
import { getActivePageIndex, getCurrentDocumentSnapshots, getCurrentPage } from '../../selector/selector';
import RenderRawSvg from './renderRawSvg';
import { addPage, removePage, setActivePage } from '../../actions/pages/pages.actions';
interface props {
    closePages: () => void;
}

const Pages: React.FC<props> = function ({ closePages }) {
    const pages = useSelector<State, SHAPE_COLLECTION[]>(getCurrentPage);
    const actiivePageIndex = useSelector<State, number>(getActivePageIndex);
    const snapShots = useSelector(getCurrentDocumentSnapshots);
    const backgroundColors = useSelector((state: State) => state.page.pages.map(item => item.svgStyle.backgroundColor));
    const dispatch = useDispatch();

    const handleAdd = function () {
        dispatch(addPage());
    }

    const handleRemove = function () {
        dispatch(removePage());
    }

    const changePage = (e: React.MouseEvent<SVGSVGElement>) => {
        const clickedPageIndex = parseInt(e.currentTarget.dataset['index']!);
        actiivePageIndex !== clickedPageIndex && dispatch(setActivePage(clickedPageIndex))
    }

    return (
        <>
            <div
                style={{ height: '100%', width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 3 }}
                onClick={closePages}
            />
            <PagesContainer>
                <div className='pageAction'>
                    <span className='title'>Pages</span>
                    <Button title='Add' startIcon={BsPlus} iconSize={16} onClick={handleAdd} />
                    <Button title='Remove last' startIcon={BsDash} iconSize={16} onClick={handleRemove} disabled={pages.length <= 1} />
                </div>
                <div className='pageCollection'>
                    {
                        snapShots.map((snapShot, index) => (
                            <RenderRawSvg
                                key={index}
                                innerHtml={snapShot}
                                isActive={actiivePageIndex === index}
                                clickHandler={changePage}
                                index={index}
                                style={{ backgroundColor: backgroundColors[index] }}
                            />))
                    }
                </div>
            </PagesContainer>
        </>
    );
}

const PagesContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            position:absolute;
            top: calc(100% + ${theme.spacing(.5)}px);
            left: 0;
            z-index: 4;
            display: flex;
            flex-flow: column nowrap;
            align-items: stretch;
            width: 280px;
            max-height: 80vh;
            background-color: ${UI_COLORS.surface};
            border: 1px solid ${UI_COLORS.border};
            border-radius: ${theme.spacing(1)}px;
            box-shadow: ${UI_SHADOWS.popover};
            overflow: hidden;

            &>div.pageAction{
                display: flex;
                align-items: center;
                gap: ${theme.spacing(.5)}px;
                padding: ${theme.spacing(1)}px;
                border-bottom: 1px solid ${UI_COLORS.border};

                &>.title{
                    flex-grow: 1;
                    font-weight: 600;
                }

                &>button{
                    height: 28px;
                    padding: 0 ${theme.spacing(1)}px;
                    border: 1px solid ${UI_COLORS.inputBorder};
                    border-radius: ${theme.spacing(.75)}px;
                    background-color: ${UI_COLORS.surface};
                    font-size: 12px;
                    font-weight: 500;
                    &:hover:not(:disabled){
                        opacity: 1;
                        background-color: ${UI_COLORS.hover};
                    }
                    &:disabled{
                        cursor: default;
                        opacity: .4;
                    }
                }
            }
            &>div.pageCollection{
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                gap: ${theme.spacing(1)}px;
                padding: ${theme.spacing(1.5)}px;
                overflow-y: auto;
                overflow-x: hidden;
                background-color: ${UI_COLORS.surfaceMuted};

                &>svg{
                    flex-shrink: 0;
                    margin: 0;
                    border-radius: ${theme.spacing(.75)}px;
                }
            }
        `;
    }}
`;

export default Pages;
