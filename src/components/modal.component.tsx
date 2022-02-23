import React, { useState, useEffect, useMemo } from "react";
import ReactDom from 'react-dom';
import generateId from "../utils/idGenerator";

interface Props {
    overlayStyle?: any,
    modalStyle?: any,
    children: JSX.Element,
}

const Modal: React.FC<Props> = function ({ overlayStyle = {}, modalStyle = {}, children }) {

    const modalId = useMemo(() => generateId(), []);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    useEffect(function () {
        const newContainer = document.createElement('div');
        newContainer.id = modalId;
        newContainer.setAttribute('style', Object.entries(overlayStyle).map(([k, v]) => `${k}:${v}`).join(';'));
        newContainer.classList.add('modalOverlay');
        document.body.appendChild(newContainer);
        setContainer(newContainer);

        return ()=>{
            container?.remove();
        }
    }, []);

    return (
        container
            ? (
                ReactDom.createPortal(<div className='modalChild' style={modalStyle}>
                    {children}
                </div>, container)
            )
            : null
    );
}

export default Modal;

