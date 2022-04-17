import React, { useState, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import { exportAsJson, exportAsSvg } from '../../utils/fileOptionsCallback';
import Button from '../button.component';
import Input from '../input.component';
import Modal from '../modal.component';
import { useDispatch, useSelector } from 'react-redux';
import { createNewFile, saveFile, saveFileAS } from '../../actions/pages/pages.actions';
import { useNavigate } from 'react-router-dom';
import { getCurrentDocId, getCurrentDocName } from '../../selector/selector';
import { personalProjectIds } from '../../seed';

const HeaderFileOptions: React.FC = function () {

    const [showMenu, setShowMenu] = useState(false);
    const [saveAsModal, setShowSaveAsModal] = useState({ show: false, value: '' });
    const currentDocName = useSelector(getCurrentDocName);
    const currentDocId = useSelector(getCurrentDocId);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const options = useMemo(() => [
        {
            name: 'New',
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                toggleMenu();
                const proceed = window.confirm('all your progress will be lost');
                if (proceed) {
                    dispatch(createNewFile());
                }
            }
        },
        {
            name: 'Save',
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                toggleMenu();
                dispatch(saveFile());
            },
            disabled: !currentDocName.length || personalProjectIds.includes(currentDocId)
        },
        {
            name: 'Save as',
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                toggleMenu();
                toggleSaveAsModal();
            }
        },
        {
            name: 'Export as json',
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                toggleMenu();
                exportAsJson();
            }
        },
        {
            name: 'Export as svg',
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                toggleMenu();
                exportAsSvg();
            }
        },
        {
            name: 'Exit',
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                toggleMenu();
                navigate('/');
            }
        }
    ], []);

    const toggleMenu = function () {
        setShowMenu(prevState => !prevState);
    }

    const toggleSaveAsModal = function () {
        setShowSaveAsModal(prevState => {
            if (prevState.show) {
                return { show: false, value: '' };
            }
            return { show: true, value: '' };
        })
    }

    return (
        <HeaderOptionsContainer>
            <div className='title' onClick={toggleMenu}>File</div>
            {
                showMenu
                    ? (
                        <>
                            <div className='options'>
                                {
                                    options.map((option, index) => (
                                        <div
                                            key={index}
                                            className='option'
                                            onClick={option.onClick}
                                            style={{ pointerEvents: option.disabled ? 'none' : 'initial' }}
                                        >
                                            {option.name}
                                        </div>
                                    ))
                                }
                            </div>
                            <div className='hideMenu' onClick={toggleMenu} />
                        </>
                    )
                    : null
            }
            {
                saveAsModal.show
                    ? <Modal modalStyle={{ height: '150px', width: '500px', padding: '16px', position: 'relative' }}>
                        <>
                            <h4>Save as</h4>
                            <Input
                                value={saveAsModal.value}
                                onChange={e => setShowSaveAsModal(prevState => ({ ...prevState, value: e.target.value }))}
                                placeholder='Enter document name'
                                style={{ margin: '16px 0' }}
                            />
                            <SaveAsModalAction>
                                <Button title='Cancel' onClick={toggleSaveAsModal} />
                                <Button
                                    title='Save'
                                    disabled={!saveAsModal.value.length}
                                    onClick={() => {
                                        dispatch(saveFileAS(saveAsModal.value));
                                        toggleSaveAsModal();
                                    }}
                                />
                            </SaveAsModalAction>
                        </>
                    </Modal>
                    : null
            }
        </HeaderOptionsContainer>
    );
}

const HeaderOptionsContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            position:relative;
            &>div.options{
                text-align: left;
                position: absolute;
                left:50%;
                transform:translateX(-50%);
                z-index: 5;
                width:150px;
                background-color: white;
                box-shadow: 0 10px 50px 0 #ccc;
                border:.5px solid #ccc;
                border-radius: ${theme.spacing(1)}px;
                overflow: hidden;
                &>div.option{
                    padding:${theme.spacing(1)}px ${theme.spacing(2)}px;
                    border:.5px solid #ccc;
                    &:hover{
                        background-color: #ccc;
                    }
                }
            }
            &>div.hideMenu{
                position:fixed;
                top:0;
                left:0;
                height:100vh;
                width:100vw;
                z-index: 4;
            }
        `;
    }}
`;

const SaveAsModalAction = styled.div`
    position: absolute;
    bottom: 16px; 
    right: 16px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    width:25%
`;

export default HeaderFileOptions;