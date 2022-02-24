import { useState } from 'react';
import { SiAddthis } from 'react-icons/si';
import Button from '../button.component';
import Modal from '../modal.component';
import CreateGradient from './createGradient';

const GradientPalette = function () {

    const [createGradient, setCreateGradient] = useState<boolean>(false);

    function toggleCreateGradientModal(e: any) {
        setCreateGradient(prevState => !prevState);
    }

    return (
        <>
            <div style={{ display: 'flex', flexGrow: 1 }}>
                {

                }
            </div>
            <Button startIcon={SiAddthis} title='Add' onClick={toggleCreateGradientModal} />
            {
                createGradient
                    ? (
                        <Modal modalStyle={{height:'50%',width:'60%'}}>
                            <CreateGradient />    
                        </Modal>
                    )
                    : null
            }
        </>
    );
}

export default GradientPalette;