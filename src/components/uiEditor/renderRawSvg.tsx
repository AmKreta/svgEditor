import React from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { UI_COLORS } from '../../theme/uiTokens';

interface props {
    innerHtml: string
    isActive?: boolean,
    clickHandler?: React.MouseEventHandler<SVGSVGElement> | undefined;
    index?: number;
    height?: number | string;
    width?: number | string;
    viewbox?: string;
    style?: any;
}

const RenderRawSvg: React.FC<props> = function ({ innerHtml, isActive = false, clickHandler, index, height, width, viewbox, style }) {
    return (
        <StyledSvg
            viewBox={viewbox || '0 0 1175 580'}
            width={width || '100%'}
            height={height}
            onClick={clickHandler}
            isActive={isActive}
            data-index={index}
            style={style}
            dangerouslySetInnerHTML={{ __html: innerHtml }}
            isProjectPreview={!!width}
        />
    );
}

export default RenderRawSvg;


const StyledSvg = styled.svg<{ isActive: boolean, isProjectPreview: boolean }>`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            background-color: white;
            margin:${theme.spacing(.5)}px 0;
            transition:.3s ease-in-out;
            outline:${props.isProjectPreview ? '1px solid #333' : props.isActive ? `2px solid ${UI_COLORS.accent}` : `1px solid ${UI_COLORS.border}`};
            &:hover{
                cursor: pointer;
                outline:${props.isProjectPreview ? '3px solid #000' : props.isActive ? `2px solid ${UI_COLORS.accent}` : `2px solid ${UI_COLORS.inputBorder}`};
            }
        `;
    }}
`;