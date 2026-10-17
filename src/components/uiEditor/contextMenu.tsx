import React, { useLayoutEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { THEME } from '../../theme/theme';
import { IconType } from 'react-icons';
import { BsClipboard, BsCollection, BsFiles, BsScissors, BsTrash } from 'react-icons/bs';
import { UI_COLORS, UI_SHADOWS } from '../../theme/uiTokens';
import { useEventListener } from '../../hooks/useEventListener';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../store/store';
import { getContextMenuState, getActiveShapesInfo, getClipBoard } from '../../selector/selector';
import { CONTEXT_MENU_INTERFACE } from '../../actions/pages/pages.interface';
import { toggleContextMenu, cutSelectedShapes, pasteSelectedShape, copySelectedShapes, removeSelectedShapes, saveSelectedShapesAsGroup } from '../../actions/pages/pages.actions';
import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';


const ContextMenu: React.FC = function () {

    const { show, x, y } = useSelector<State, CONTEXT_MENU_INTERFACE>(getContextMenuState);
    const activeShapes = useSelector<State, string[]>(getActiveShapesInfo);
    const clipboard = useSelector<State, Array<AVAILABLE_SHAPES>>(getClipBoard);
    const dispatch = useDispatch();

    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x, y });

    const close = () => dispatch(toggleContextMenu());

    const contextMenuItems: CONTEXT_MENU_ITEM[] = [
        {
            name: 'Cut',
            disabled: activeShapes.length === 0,
            icon: BsScissors,
            action() {
                dispatch(cutSelectedShapes())
            }
        },
        {
            name: 'Copy',
            disabled: activeShapes.length === 0,
            icon: BsFiles,
            action() {
                dispatch(copySelectedShapes())
            }
        },
        {
            name: 'Paste',
            disabled: clipboard.length === 0,
            icon: BsClipboard,
            action() {
                dispatch(pasteSelectedShape())
            },
        },
        {
            name: 'Group selection',
            disabled: activeShapes.length < 2,
            icon: BsCollection,
            separatorBefore: true,
            action() {
                dispatch(saveSelectedShapesAsGroup());
            }
        },
        {
            name: 'Delete',
            disabled: activeShapes.length === 0,
            icon: BsTrash,
            danger: true,
            separatorBefore: true,
            action() {
                dispatch(removeSelectedShapes());
            }
        },
    ];

    // keep the menu inside the canvas when opened near its right/bottom edge
    useLayoutEffect(() => {
        const menu = menuRef.current;
        const container = menu?.offsetParent as HTMLElement | null;
        if (!show || !menu || !container) {
            return;
        }
        const maxX = container.scrollLeft + container.clientWidth - menu.offsetWidth - MENU_EDGE_GAP;
        const maxY = container.scrollTop + container.clientHeight - menu.offsetHeight - MENU_EDGE_GAP;
        setPosition({
            x: Math.max(MENU_EDGE_GAP, Math.min(x, maxX)),
            y: Math.max(MENU_EDGE_GAP, Math.min(y, maxY)),
        });
    }, [show, x, y]);

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (show && e.key === 'Escape') {
            close();
        }
    });

    useEventListener('pointerdown', (e: PointerEvent) => {
        // right-clicks are handled by whoever opens the menu
        if (show && e.button !== 2 && !menuRef.current?.contains(e.target as Node)) {
            close();
        }
    });

    if (!show) {
        return null;
    }

    return (
        <ContextMenuContainer
            ref={menuRef}
            role='menu'
            style={{ top: position.y, left: position.x }}
            onContextMenu={e => e.preventDefault()}
        >
            {
                contextMenuItems.map((item, index) => (
                    <React.Fragment key={item.name}>
                        {item.separatorBefore && index > 0 ? <div className='separator' /> : null}
                        <button
                            role='menuitem'
                            className={`contextMenuItem${item.danger ? ' danger' : ''}`}
                            disabled={item.disabled}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.preventDefault();
                                e.stopPropagation();
                                item.action();
                                close();
                            }}
                        >
                            <item.icon />
                            <span>{item.name}</span>
                        </button>
                    </React.Fragment>
                ))
            }
        </ContextMenuContainer>
    );
}

const MENU_EDGE_GAP = 8;

interface CONTEXT_MENU_ITEM {
    name: string;
    icon: IconType;
    disabled: boolean;
    action: () => void;
    danger?: boolean;
    separatorBefore?: boolean;
}

const menuIn = keyframes`
    from{ opacity: 0; transform: scale(.97); }
    to{ opacity: 1; transform: scale(1); }
`;

const ContextMenuContainer = styled.div`
   ${props => {
        const theme = props.theme as THEME;
        return css`
            position:absolute;
            z-index: 2;
            display: flex;
            flex-direction: column;
            min-width: 200px;
            padding: ${theme.spacing(.5)}px;
            background-color: ${UI_COLORS.surface};
            border: 1px solid ${UI_COLORS.border};
            border-radius: ${theme.spacing(1)}px;
            box-shadow: ${UI_SHADOWS.popover};
            color: ${UI_COLORS.text};
            font-size: 13px;
            text-align: left;
            animation: ${menuIn} .1s ease-out;
            transform-origin: top left;

            &>.separator{
                height: 1px;
                margin: ${theme.spacing(.5)}px ${theme.spacing(-.5)}px;
                background-color: ${UI_COLORS.border};
            }

            &>.contextMenuItem{
                display: flex;
                align-items: center;
                gap: ${theme.spacing(1.25)}px;
                height: 32px;
                padding: 0 ${theme.spacing(1.25)}px;
                border: none;
                border-radius: ${theme.spacing(.75)}px;
                background: transparent;
                font: inherit;
                color: inherit;
                text-align: left;
                cursor: pointer;

                &>svg{
                    flex-shrink: 0;
                    color: ${UI_COLORS.textMuted};
                }
                &:hover:not(:disabled){
                    background-color: ${UI_COLORS.hover};
                }
                &:active:not(:disabled){
                    background-color: ${UI_COLORS.pressed};
                }
                &.danger{
                    color: ${UI_COLORS.danger};
                    &>svg{
                        color: ${UI_COLORS.danger};
                    }
                    &:hover:not(:disabled){
                        background-color: ${UI_COLORS.dangerSoft};
                    }
                }
                &:disabled{
                    cursor: default;
                    opacity: .4;
                }
            }
       `;
    }}
`;

export default ContextMenu;
