import React, { useRef, useLayoutEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { THEME } from '../theme/theme';

interface props {
    size?: number;
    action?: Function;
}

const Loader: React.FC<props> = function ({ size = 50, action }) {

    const spinnerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(function () {
        let observer: IntersectionObserver;
        if (action && spinnerRef.current) {
            let callback: IntersectionObserverCallback = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        action();
                    }
                });
            };
            let options = {
                root: spinnerRef.current.parentElement?.parentElement,
                rootMargin: '0px',
                threshold: 1.0
            }
            observer = new IntersectionObserver(callback, options);
            observer.observe(spinnerRef.current);
        }

        return function () {
            if (spinnerRef.current && observer) {
                observer.unobserve(spinnerRef.current);
            }
        }

    }, []);

    return (
        <SpinnerContainer size={size} ref={spinnerRef}>
            <div className='spinner' />
        </SpinnerContainer>
    );
}

const SpinnerContainer = styled.div<Partial<props>>`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            position:relative;
            padding:${theme.spacing(2)}px 0;
            width:100%;
            &>.spinner{
                position:absolute;
                    top:50%;
                    left:50%;
                    transform:translate(-50%,-50%);
                    height:${props.size}px;
                    width:${props.size}px;
                    border:4px solid #999;
                    border-bottom-color: #5353d4;
                    border-radius:50px;
                    animation-name: ${SpinAnimation};
                    animation-duration: 1s;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
            }
        `;
    }}
`;

const SpinAnimation = keyframes`
     0%{
        transform:translate(-50%,-50%) rotate(0deg);
    }
    100%{
        transform:translate(-50%,-50%) rotate(360deg);
    }
`;

export default Loader;