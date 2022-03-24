import { useState } from 'react';
import { SiAddthis } from 'react-icons/si';
import Button from '../button.component';
import Modal from '../modal.component';
import CreateGradient from './createGradient';
import { useSelector } from 'react-redux';
import { getCurrentProjectGradients } from '../../selector/selector';
import { State } from '../../store/store';
import { GRADIENT } from '../../actions/pages/pages.interface';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
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
            <GradientContainer>
                {
                    Object.keys(gradients).map(gradientId => {
                        return (
                            <div onClick={selectGradient} key={gradientId} data-id={gradientId}>
                                <GradientRenderer gradientId={gradientId}/>
                                <Icon Icon={AiOutlineClose} onClick={removeGradient} data-id={gradientId} />
                            </div>
                        );
                    })
                }
            </GradientContainer>
            <Button startIcon={SiAddthis} title='Add' onClick={toggleCreateGradientModal} />
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

const GradientContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            display: flex;
            flex-grow: 1;
            &>div{
                height:25px;
                width:25px;
                position:relative;
                
                &:not(:last-child){
                    margin-right:${theme.spacing(2)}px;
                }
                
                &>svg{
                    height:100%;
                    width:100%;
                }

                &>.icon{
                position:absolute;
                top:0;
                right:0;
                transform:translate(50%,-50%) scale(.8);
                background-color: white;
                box-shadow: 0px 0px 3px #ccc;
                border-radius: 50%;
                padding:${theme.spacing(.5)}px;
                    &:hover{
                        background-color: black;
                        color:white
                    }
                }
            }
        `;
    }}
`;
