import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { SHAPE_TYPES, ToolBarOptions, TOOLS } from '../../utils/constant';
import { THEME } from '../../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTool, updateCurrentPageSnapshot } from '../../actions/pages/pages.actions';
import { State } from '../../store/store';
import { getActiveTool, getCurrentDocName } from '../../selector/selector';
import { BsLayers } from 'react-icons/bs';
import { UI_COLORS } from '../../theme/uiTokens';
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
    const currentDocName = useSelector(getCurrentDocName);

    const toolsClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        const tool = e.currentTarget.dataset['title'] as SHAPE_TYPES;
        dispatch(setActiveTool(tool))
    }

    const onTabOptionClick = function (e: React.MouseEvent<HTMLButtonElement>) {
        prevSelectedTab.current = activeOption;
        setActiveOption(e.currentTarget.innerText)
    }

    function addClipArt(src: string) {
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
                <div className='menus'>
                    <div style={{ position: 'relative' }}>
                        <button className={`menuButton${showPages ? ' open' : ''}`} onClick={togglePages}>
                            <BsLayers />
                            <span>Pages</span>
                        </button>
                        {
                            showPages
                                ? <Pages closePages={togglePages} />
                                : null
                        }
                    </div>
                    <HeaderFileOptions />
                </div>
                <div className='divider' />
                <div className='tabs' role='tablist'>
                    {
                        Object.keys(ToolBarOptions).map((option, index) => {
                            const text = ToolBarOptions[option as keyof typeof ToolBarOptions];
                            return (
                                <button
                                    key={option + index}
                                    role='tab'
                                    aria-selected={activeOption === text}
                                    className={activeOption === text ? 'active' : ''}
                                    onClick={onTabOptionClick}
                                >
                                    {text}
                                </button>
                            )
                        })
                    }
                </div>
                <div className='docName' title={currentDocName || 'Untitled'}>{currentDocName || 'Untitled'}</div>
            </nav>
            <div className="navBar-tools">
                {
                    activeOption === ToolBarOptions.TOOLS
                        ? (
                            <div className='tools'>
                                {
                                    TOOLS.map((item, index) => (
                                        <React.Fragment key={item.title}>
                                            {
                                                index > 0 && TOOLS[index - 1].group !== item.group
                                                    ? <div className='divider' />
                                                    : null
                                            }
                                            <button
                                                className={`toolButton${activeTool === item.title ? ' active' : ''}`}
                                                data-title={item.title}
                                                title={item.label}
                                                aria-label={item.label}
                                                aria-pressed={activeTool === item.title}
                                                onClick={toolsClickHandler}
                                            >
                                                <item.icon style={item.style} />
                                            </button>
                                        </React.Fragment>
                                    ))
                                }
                            </div>
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
            display: flex;
            flex-direction: column;
            position:relative;
            overflow:visible !important;
            color: ${UI_COLORS.text};
            font-size: 13px;

            & button{
                font: inherit;
                color: inherit;
                cursor: pointer;
            }

            & .divider{
                align-self: stretch;
                width: 1px;
                margin: ${theme.spacing(.75)}px ${theme.spacing(.5)}px;
                background-color: ${UI_COLORS.border};
            }

            &>nav{
                display: flex;
                align-items: center;
                gap: ${theme.spacing(.5)}px;
                min-height: 44px;
                padding: 0 ${theme.spacing(1)}px;
                border-bottom: 1px solid ${UI_COLORS.border};

                & .menus{
                    display: flex;
                    align-items: center;
                    gap: ${theme.spacing(.25)}px;
                }

                & .menuButton{
                    display: inline-flex;
                    align-items: center;
                    gap: ${theme.spacing(.75)}px;
                    height: 30px;
                    padding: 0 ${theme.spacing(1.25)}px;
                    border: none;
                    border-radius: ${theme.spacing(.75)}px;
                    background: transparent;
                    font-weight: 500;
                    &:hover, &.open{
                        background-color: ${UI_COLORS.hover};
                    }
                    &>svg{
                        color: ${UI_COLORS.textMuted};
                    }
                }

                & .tabs{
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    padding: 3px;
                    border-radius: ${theme.spacing(1)}px;
                    background-color: ${UI_COLORS.hover};

                    &>button{
                        height: 26px;
                        padding: 0 ${theme.spacing(1.5)}px;
                        border: none;
                        border-radius: ${theme.spacing(.75)}px;
                        background: transparent;
                        color: ${UI_COLORS.textMuted};
                        font-weight: 500;
                        transition: background-color .15s, color .15s;
                        &:hover{
                            color: ${UI_COLORS.text};
                        }
                        &.active{
                            background-color: ${UI_COLORS.surface};
                            color: ${UI_COLORS.text};
                            box-shadow: 0 1px 2px rgba(17, 24, 39, .12);
                        }
                    }
                }

                & .docName{
                    margin-left: auto;
                    max-width: 30%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    color: ${UI_COLORS.textMuted};
                    font-weight: 500;
                }
            }

            &>div.navBar-tools{
                display: flex;
                align-items: center;
                gap: ${theme.spacing(1)}px;
                flex-grow: 1;
                min-height: 44px;
                padding: 0 ${theme.spacing(1.5)}px;
                overflow-x: auto;

                & .tools{
                    display: flex;
                    align-items: center;
                    gap: 2px;
                }

                & .toolButton{
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 32px;
                    width: 32px;
                    border: none;
                    border-radius: ${theme.spacing(.75)}px;
                    background: transparent;
                    color: ${UI_COLORS.text};
                    transition: background-color .15s, color .15s;
                    &>svg{
                        height: 16px;
                        width: 16px;
                    }
                    &:hover{
                        background-color: ${UI_COLORS.hover};
                    }
                    &.active{
                        background-color: ${UI_COLORS.accent};
                        color: white;
                    }
                    &:focus-visible{
                        outline: 2px solid ${UI_COLORS.accent};
                        outline-offset: 1px;
                    }
                }

                /* plain buttons in the palettes / helpers rows */
                & button:not(.toolButton){
                    display: inline-flex;
                    align-items: center;
                    gap: ${theme.spacing(.5)}px;
                    height: 30px;
                    padding: 0 ${theme.spacing(1.25)}px;
                    border: 1px solid ${UI_COLORS.inputBorder};
                    border-radius: ${theme.spacing(.75)}px;
                    background-color: ${UI_COLORS.surface};
                    font-weight: 500;
                    font-size: 12px;
                    &:hover{
                        opacity: 1;
                        background-color: ${UI_COLORS.hover};
                    }
                    &>svg{
                        margin: 0 !important;
                    }
                }
            }
        `;
    }}
`;
export default EditorHeader;
