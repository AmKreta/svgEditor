import React from 'react';
import styled from 'styled-components';

const GridHelper: React.FC = function () {
    return (
        <GridHelperContainer width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" id='gridHelper'>
            <defs>
                <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="gray" stroke-width="0.5" />
                </pattern>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                    <rect width="80" height="80" fill="url(#smallGrid)" />
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#635e5e" stroke-width="1" />
                </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" />
        </GridHelperContainer>
    );
}

const GridHelperContainer = styled.svg`
    position: absolute; 
    top: 0;
    left: 0;
`;

export default GridHelper;