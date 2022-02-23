import React from 'react';
import { IconContext, IconType } from 'react-icons';
//import styled from 'styled-components';


interface ICON_PROPS {
    Icon: IconType;
    onClick?: (e: React.MouseEvent<SVGElement>) => void;
    title?: string;
    style?: React.CSSProperties;
    height?: number;
    width?: number;
};

const Icon: React.FC<ICON_PROPS> = function ({ Icon, onClick, title, style = {}, height = 20, width = 20, ...iconProps }) {
    return (
        <IconContext.Provider value={{ className: 'icon', style: { ...style, height: `${height}px`, width: `${width}px` } }}>
            <Icon
                style={{
                    ...style,
                    minHeight: `${height}px`,
                    minWidth: `${width}px`
                }}
                title={title}
                onClick={onClick}
                data-title={title}
                {...iconProps}
            />
        </IconContext.Provider>
    );
}

export default Icon;