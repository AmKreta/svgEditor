import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { SHAPE_TYPES, ToolBarOptions, TOOLS } from '../../utils/constant';
import Icon from '../icon.component';
import { THEME } from '../../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTool, updateCurrentPageSnapshot } from '../../actions/pages/pages.actions';
import { State } from '../../store/store';
import { getActiveTool } from '../../selector/selector';
import ColorPalette from './colorPalette';
import GradientPalette from './gradientPalette';
import AddClipArtModal from './addClipArtModal';
import { addShape } from '../../actions/pages/pages.actions';
import Helpers from './helpers';
import Pages from './pages';
import HeaderFileOptions from './headerFileOptions';


const EditorHeader: React.FC<{}> = function () {

    const [activeOption, setActiveOption] = useState('Tools');
    const dispatch = useDispatch();
    const activeTool = useSelector<State, SHAPE_TYPES>((state: State) => getActiveTool(state));
    const prevSelectedTab = useRef<string | null>(null);
    const [showPages, setShowPages] = useState<boolean>(false);

    const toolsClickHandler = (e: React.MouseEvent<SVGElement>) => {
        const tool = e.currentTarget.dataset['title'] as SHAPE_TYPES;
        dispatch(setActiveTool(tool))
    }

    const onTabOptionClick = function (e: React.MouseEvent<HTMLSpanElement>) {
        prevSelectedTab.current = activeOption;
        setActiveOption(e.currentTarget.innerText)
    }

    function addClipArt(e: React.ChangeEvent<HTMLImageElement>) {
        const src = (e.target as HTMLImageElement).dataset['src'];
        dispatch(addShape({ shape: SHAPE_TYPES.IMAGE, x: 100, y: 100, src }))
        closeAddClipArtModal();
    }

    function closeAddClipArtModal() {
        setActiveOption(prevSelectedTab.current!);
    }

    function togglePages() {
        if (!showPages) {
            dispatch(updateCurrentPageSnapshot());
        }

        setShowPages(prevState => !prevState);
    }

    return (
        <StyledHeader>
            <nav>
                <div style={{ position: "relative" }}>
                    <span onClick={togglePages} style={{ textDecoration: showPages ? 'underline' : 'none' }}>Pages</span>
                    {
                        showPages
                            ? <Pages closePages={togglePages} />
                            : null
                    }
                </div>
                <HeaderFileOptions />
                {
                    Object.keys(ToolBarOptions).map((option, index) => {
                        const text = ToolBarOptions[option as keyof typeof ToolBarOptions];
                        return (
                            <span
                                key={option + index}
                                onClick={onTabOptionClick}
                                style={{ textDecoration: activeOption === text ? 'underline' : 'none' }}
                            >
                                {text}
                            </span>
                        )
                    })
                }
            </nav>
            <div className="navBar-tools">
                {
                    activeOption === ToolBarOptions.TOOLS
                        ? (
                            <>
                                {
                                    TOOLS.map(item => (
                                        <Icon
                                            key={item.title}
                                            Icon={item.icon}
                                            title={item.title}
                                            style={{
                                                ...item.style,
                                                background: activeTool === item.title ? 'black' : 'white',
                                                color: activeTool === item.title ? 'white' : 'black',
                                                padding: '1px'
                                            }}
                                            onClick={toolsClickHandler}
                                        />
                                    ))
                                }
                            </>
                        )
                        : null
                }
                {
                    activeOption === ToolBarOptions.COLORS
                        ? <ColorPalette />
                        : null
                }
                {
                    activeOption === ToolBarOptions.Gradients
                        ? <GradientPalette />
                        : null
                }
                {
                    activeOption === ToolBarOptions.INSERT
                        ? <AddClipArtModal onClose={closeAddClipArtModal} addClipArt={addClipArt} />
                        : null
                }
                {
                    activeOption === ToolBarOptions.HELPERS
                        ? <Helpers />
                        : null
                }
            </div>
        </StyledHeader>
    );
}

const StyledHeader = styled.header`
${props => {
        const theme = props.theme as THEME;
        return css`
            grid-area:header;
            padding:${theme.spacing(1)}px;
            position:relative;
            overflow:visible !important;
            &>nav{
                display: flex;
                align-items: center;
                height:50%;
                &>*{
                    margin:0 ${theme.spacing(1)}px;
                    &:hover{
                        cursor:pointer;
                    }
                }
            }
            &>div.navBar-tools{
                display: flex;
                align-items: center;
                height:50%;
                &>*{
                    margin:0 ${theme.spacing(1)}px;
                    &:hover{
                        cursor:pointer;
                    }
                }
            }
            &>div.pages{
                background-color: #ccc;
                padding:${theme.spacing(.5)}px;
                margin:${theme.spacing(1)}px;
                display: flex;
                align-items: center;
                transition:.25s ease-in-out;
                &:hover{
                    cursor: pointer;
                    opacity:.7;
                }
                &:active{
                    opacity:.5;
                }
            }
        `;
    }}
`;
export default EditorHeader;