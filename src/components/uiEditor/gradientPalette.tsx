import { useState } from 'react';
import { BsPlus } from 'react-icons/bs';
import { Swatch, Swatches } from './colorPalette';
import Button from '../button.component';
import Modal from '../modal.component';
import CreateGradient from './createGradient';
import { useSelector } from 'react-redux';
import { getCurrentProjectGradients } from '../../selector/selector';
import { State } from '../../store/store';
import { GRADIENT } from '../../actions/pages/pages.interface';
import { AiOutlineClose } from 'react-icons/ai';
import Icon from '../icon.component';
import { useDispatch } from 'react-redux';
import { removePaletteGradient } from '../../actions/pages/pages.actions';
import GradientRenderer from './gradientRenderer';

const GradientPalette = function () {

    const [createGradient, setCreateGradient] = useState<boolean>(false);
    const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
    const gradients = useSelector<State, { [key: string]: GRADIENT }>(getCurrentProjectGradients);
    const dispatch = useDispatch();

    function toggleCreateGradientModal(e: any) {
        setCreateGradient(prevState => !prevState);
    }

    function selectGradient(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        const id = e.currentTarget.dataset['id']!;
        setSelectedGradient(id);
    }

    function closeEditGradientModal() {
        setSelectedGradient(null);
    }

    function removeGradient(e: React.MouseEvent<SVGElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        const id = e.currentTarget.dataset['id']!;
        dispatch(removePaletteGradient(id));
    }

    return (
        <>
            <Swatches>
                {
                    Object.keys(gradients).length === 0
                        ? <span className='empty'>No gradients yet. Create one to use it as a fill.</span>
                        : null
                }
                {
                    Object.keys(gradients).map(gradientId => {
                        return (
                            <Swatch onClick={selectGradient} key={gradientId} data-id={gradientId} title='Click to edit'>
                                <GradientRenderer gradientId={gradientId}/>
                                <Icon Icon={AiOutlineClose} onClick={removeGradient} data-id={gradientId} title='Remove gradient' />
                            </Swatch>
                        );
                    })
                }
            </Swatches>
            <Button startIcon={BsPlus} iconSize={16} title='New gradient' onClick={toggleCreateGradientModal} />
            {
                createGradient
                    ? (
                        <Modal modalStyle={{ height: '70%', width: '60%' }}>
                            <CreateGradient closeGradientCreater={toggleCreateGradientModal} />
                        </Modal>
                    )
                    : null
            }
            {
                selectedGradient
                    ? (
                        <Modal modalStyle={{ height: '70%', width: '60%' }}>
                            <CreateGradient closeGradientCreater={closeEditGradientModal} selectedGradient={gradients[selectedGradient]} gradientId={selectedGradient} />
                        </Modal>
                    )
                    : null
            }
        </>
    );
}

export default GradientPalette;
