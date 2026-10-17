import React from 'react';
import styled from 'styled-components';
import { BsPlusLg, BsUpload } from 'react-icons/bs';
import { LANDING_ACTIONS, LandingButton } from './shared';
import { UI_COLORS } from '../../theme/uiTokens';

export const Logo: React.FC = function () {
    return (
        <StyledLogo>
            <svg viewBox='0 0 32 32' aria-hidden='true'>
                <rect x='2' y='2' width='28' height='28' rx='8' fill={UI_COLORS.accent} />
                <path d='M9 21 L16 9 L23 21 Z' fill='none' stroke='white' strokeWidth='2.2' strokeLinejoin='round' />
                <circle cx='16' cy='9' r='2.4' fill='white' />
                <circle cx='9' cy='21' r='2.4' fill='white' />
                <circle cx='23' cy='21' r='2.4' fill='white' />
            </svg>
            <span>UiEditor</span>
        </StyledLogo>
    );
}

const Header: React.FC<LANDING_ACTIONS> = function ({ onCreateNew, onImport }) {
    return (
        <StyledHeader>
            <Logo />
            <nav>
                <LandingButton onClick={onImport}>
                    <BsUpload />
                    <span>Import JSON</span>
                </LandingButton>
                <LandingButton variant='primary' onClick={onCreateNew}>
                    <BsPlusLg />
                    <span>New file</span>
                </LandingButton>
            </nav>
        </StyledHeader>
    );
}

const StyledLogo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    &>svg{
        height: 32px;
        width: 32px;
    }
    &>span{
        font-family: 'Dancing Script', cursive;
        font-size: 30px;
        font-weight: 700;
        line-height: 1;
    }
`;

const StyledHeader = styled.header`
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 32px;
    background-color: rgba(255, 255, 255, .85);
    backdrop-filter: saturate(180%) blur(10px);
    border-bottom: 1px solid ${UI_COLORS.border};

    &>nav{
        display: flex;
        align-items: center;
        gap: 8px;
    }

    @media (max-width: 640px){
        padding: 0 16px;
        & nav button:first-child>span{
            display: none;
        }
    }
`;

export default Header;
