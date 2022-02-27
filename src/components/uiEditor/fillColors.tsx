import React from 'react';
import { useSelector } from 'react-redux';
import { getCurrentProjectColors } from '../../selector/selector';

const FillColors: React.FC = function () {
    const colors: { [key: string]: string; } = useSelector(getCurrentProjectColors);

    return (
        <>
            {
                Object.keys(colors).map(colorId => (
                    <pattern id={colorId} height='100%' width='100%'>
                        <rect x={0} y={0} height='100%' width='100%' fill={colors[colorId]} />
                    </pattern>
                ))
            }
        </>
    );
}

export default FillColors;