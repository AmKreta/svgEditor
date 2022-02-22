import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { SHAPE_TYPES, ToolBarOptions, TOOLS } from '../../utils/constant';
import Icon from '../icon.component';
import { THEME } from '../../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTool } from '../../actions/pages/pages.actions';
import { State } from '../../store/store';
import { getActiveTool } from '../../selector/selector';
import ColorPalette from './colorPalette';


const EditorHeader: React.FC<{}> = function () {

    const [activeOption, setActiveOption] = useState('Tools');
    const dispatch = useDispatch();
    const activeTool = useSelector<State, SHAPE_TYPES>((state: State) => getActiveTool(state));

    const toolsClickHandler = (e: React.MouseEvent<SVGElement>) => {
        const tool = e.currentTarget.dataset['title'] as SHAPE_TYPES;
        dispatch(setActiveTool(tool))
    }
    
    return (
        <StyledHeader>
            <nav>
                {
                    Object.keys(ToolBarOptions).map((option, index) => {
                        const text = ToolBarOptions[option as keyof typeof ToolBarOptions];
                        return (
                            <span
                                key={option + index}
                                onClick={e => setActiveOption(e.currentTarget.innerText)}
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
                    ?<ColorPalette />
                    :null
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
        `;
    }}
`;
export default EditorHeader;