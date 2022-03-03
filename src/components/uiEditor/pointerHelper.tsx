import React, { useState, useEffect } from 'react';

interface props {
    svgEditorRef: React.RefObject<SVGSVGElement>
}

const PointerHelper: React.FC<props> = function ({ svgEditorRef }) {
    const [horizontalLine, setHorizontalLine] = useState<number>(0);
    const [verticleLine, setVerticleLine] = useState<number>(0);

    useEffect(function () {
        function mouseMoveHandler(e: MouseEvent) {
            const element = e.currentTarget as SVGElement;
            const boundingRect = element.getBoundingClientRect();
            let x = e.clientX - boundingRect.x;
            let y = e.clientY - boundingRect.y;
            setHorizontalLine(y);
            setVerticleLine(x);
        }
        svgEditorRef.current!.addEventListener('mousemove', mouseMoveHandler, false);
        return () => svgEditorRef.current!.removeEventListener('mousemove', mouseMoveHandler, false);
    }, []);

    return (
        <>
            <line x1={0} y1={horizontalLine} x2='100%' y2={horizontalLine} stroke='black' strokeWidth={1} strokeOpacity={.5}/>
            <line x1={verticleLine} y1={0} x2={verticleLine} y2='100%' stroke='black' strokeWidth={1} strokeOpacity={.5}/>
        </>
    );
}

export default PointerHelper;