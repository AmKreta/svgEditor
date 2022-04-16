import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import Button from '../button.component';
import { MdRemoveCircle, MdAddCircle } from 'react-icons/md';
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
                    <Button title='Add' startIcon={MdAddCircle} iconSize={18} onClick={handleAdd} />
                    <Button title='Remove' startIcon={MdRemoveCircle} iconSize={18} onClick={handleRemove} disabled={pages.length <= 1} />
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
            width:20vw;
            position:absolute;
            top:110%;
            left:0%;
            transform: translate(-5%,6.5%);
            height:87.8vh;
            z-index: 4;
            background-color: #ccc;
            box-shadow:-1px -1px 6px #ccc, -1px -1px 3px #aaa;
            display: flex;
            flex-flow: column nowrap;
            align-items: stretch;
            &>div.pageAction{
                display: flex;
                &>button{
                    width:50%;
                    &:hover{
                        cursor: pointer;
                        opacity:.7;
                    }
                    &:active{
                        opacity:.5;
                    }
                }
            }
            &>div.pageCollection{
                flex-grow: 1;
                padding:${theme.spacing(.5)}px;
                overflow-y: auto;
                overflow-x: hidden;
                padding-right: ${theme.spacing(1)}px;
            }
        `;
    }}
`;

export default Pages;