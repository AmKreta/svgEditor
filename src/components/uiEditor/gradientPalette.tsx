import React, { useState } from 'react';
import { SiAddthis } from 'react-icons/si';
import Button from '../button.component';
import Modal from '../modal.component';

const GradientPalette = function () {

    const [createGradient,setCreateGradient]=useState<boolean>(false);

    function toggleCreateGradientModal(){
        setCreateGradient(true);
    }

    return (
        <>
            <div style={{ display: 'flex', flexGrow: 1 }}>
                {

                }
            </div>
            <Button startIcon={SiAddthis} title='Add' onClick={toggleCreateGradientModal} />
            <Modal children={<>amk</>}/>
        </>
    );
}

export default GradientPalette;