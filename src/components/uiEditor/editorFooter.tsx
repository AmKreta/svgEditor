import React from 'react';
import styled from 'styled-components';

const EditorFooter: React.FC<{}> = function () {
    return (
        <StyledFooter>EditorFooter</StyledFooter>
    );
}

const StyledFooter = styled.footer`
    grid-area:footer;
`;

export default EditorFooter;