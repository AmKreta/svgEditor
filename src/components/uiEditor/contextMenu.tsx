import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { FaCut, FaCopy, FaPaste, FaSave } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import Icon from '../icon.component';
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

    const contextMenuItems = [
        {
            name: 'cut',
            disabled: activeShapes.length === 0,
            icon: FaCut,
            action() {
                dispatch(cutSelectedShapes())
            }
        },
        {
            name: 'copy',
            disabled: activeShapes.length === 0,
            icon: FaCopy,
            action() {
                dispatch(copySelectedShapes())
            }
        },
        {
            name: 'paste',
            disabled: clipboard.length === 0,
            icon: FaPaste,
            action() {
                dispatch(pasteSelectedShape())
            },
        },
        {
            name: 'save as group',
            disabled: activeShapes.length < 2,
            icon: FaSave,
            action() {
                dispatch(saveSelectedShapesAsGroup());
            }
        },
        {
            name: 'remove',
            disabled: activeShapes.length === 0,
            icon: MdDelete,
            action() {
                dispatch(removeSelectedShapes());
            }
        },
    ];

    if (!show) {
        return null;
    }

    return (
        <ContextMenuContainer style={{ top: y, left: x }}>
            {
                contextMenuItems.map((item, index) => {
                    return (
                        <div
                            className={`contextMenuItem ${item.disabled ? 'disabled' : null}`}
                            key={index}
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                e.stopPropagation();
                                item.action && item.action();
                                dispatch(toggleContextMenu());
                            }}
                        >
                            <span><Icon Icon={item.icon} /></span>
                            <span>{item.name}</span>
                        </div>
                    );
                })
            }
        </ContextMenuContainer>
    );
}

const ContextMenuContainer = styled.div`
   ${props => {
        const theme = props.theme as THEME;
        return css`
            position:absolute;
            width:200px;
            box-shadow: 0 0 3px #ccc;
            border:1px solid #ccc;
            text-align: left;
            text-transform: capitalize;
            background-color: white;
            z-index: 2;
            &>.contextMenuItem{
                padding:${theme.spacing(1)}px;
                border:1px solid #ccc;
                &>span{
                    vertical-align: middle;
                    margin:0 4px;
                    &:last-child{
                        position:relative;
                        bottom:2px;
                        font-weight: bold;
                    }
                }
                &:hover{
                    cursor:pointer;
                    background-color: #ccc;
                }
                &:active{
                    background-color: #ddd;
                }
                &.disabled{
                    pointer-events: none;
                    opacity: .6;
                }
            }
       `;
    }}
`;

export default ContextMenu;