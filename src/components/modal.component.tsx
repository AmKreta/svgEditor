import React, { useState, useEffect, useMemo } from "react";
import ReactDom from 'react-dom';
import generateId from "../utils/idGenerator";

interface Props {
    overlayStyle?: any,
    modalStyle?: any,
    children: JSX.Element,
    onOverlayClick?: Function
}

const Modal: React.FC<Props> = function ({ overlayStyle = {}, modalStyle = {}, children, onOverlayClick }) {

    const modalId = useMemo(() => generateId(), []);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    function disableScroll() {
        document.body.style.maxHeight = '100vh';
        document.body.style.overflow = 'hidden';
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    function enableScroll() {
        document.body.style.maxHeight = 'auto';
        document.body.style.overflow = 'visible';
    }

    useEffect(function () {
        const newContainer = document.createElement('div');
        newContainer.id = modalId;
        newContainer.setAttribute('style', Object.entries(overlayStyle).map(([k, v]) => `${k}:${v}`).join(';'));
        newContainer.classList.add('modalOverlay');
        newContainer.onclick = onOverlayClick as any;
        document.body.appendChild(newContainer);
        setContainer(newContainer);
        disableScroll();

        return () => {
            newContainer?.remove();
            enableScroll();
        }
    }, []);

    return (
        container
            ? (
                ReactDom.createPortal(<div className='modalChild' style={modalStyle} >
                    {children}
                </div>, container)
            )
            : null
    );
}

export default Modal;

