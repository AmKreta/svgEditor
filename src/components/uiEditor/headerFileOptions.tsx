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
import { BsBoxArrowLeft, BsChevronDown, BsDownload, BsFileEarmark, BsFileEarmarkPlus, BsFiles, BsBraces, BsSave } from 'react-icons/bs';
import { UI_COLORS, UI_SHADOWS } from '../../theme/uiTokens';

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
            icon: BsFileEarmarkPlus,
            onClick: () => {
                toggleMenu();
                const proceed = window.confirm('all your progress will be lost');
                if (proceed) {
                    dispatch(createNewFile());
                }
            }
        },
        {
            name: 'Save',
            icon: BsSave,
            onClick: () => {
                toggleMenu();
                dispatch(saveFile());
            },
            disabled: !currentDocName.length || personalProjectIds.includes(currentDocId)
        },
        {
            name: 'Save as…',
            icon: BsFiles,
            onClick: () => {
                toggleMenu();
                toggleSaveAsModal();
            }
        },
        {
            name: 'Export as JSON',
            icon: BsBraces,
            separatorBefore: true,
            onClick: () => {
                toggleMenu();
                exportAsJson();
            }
        },
        {
            name: 'Export as SVG',
            icon: BsDownload,
            onClick: () => {
                toggleMenu();
                exportAsSvg();
            }
        },
        {
            name: 'Exit to home',
            icon: BsBoxArrowLeft,
            separatorBefore: true,
            onClick: () => {
                toggleMenu();
                navigate('/');
            }
        }
    ], [currentDocName, currentDocId, dispatch, navigate]);

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
            <button className={`menuButton${showMenu ? ' open' : ''}`} onClick={toggleMenu} aria-haspopup='menu' aria-expanded={showMenu}>
                <BsFileEarmark />
                <span>File</span>
                <BsChevronDown className='chevron' />
            </button>
            {
                showMenu
                    ? (
                        <>
                            <div className='options' role='menu'>
                                {
                                    options.map((option, index) => (
                                        <React.Fragment key={index}>
                                            {option.separatorBefore ? <div className='separator' /> : null}
                                            <button
                                                role='menuitem'
                                                className='option'
                                                onClick={option.onClick}
                                                disabled={option.disabled}
                                            >
                                                <option.icon />
                                                <span>{option.name}</span>
                                            </button>
                                        </React.Fragment>
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

            & .chevron{
                height: 10px;
                width: 10px;
            }

            &>div.options{
                display: flex;
                flex-direction: column;
                position: absolute;
                top: calc(100% + ${theme.spacing(.5)}px);
                left: 0;
                z-index: 5;
                min-width: 200px;
                padding: ${theme.spacing(.5)}px;
                background-color: ${UI_COLORS.surface};
                border: 1px solid ${UI_COLORS.border};
                border-radius: ${theme.spacing(1)}px;
                box-shadow: ${UI_SHADOWS.popover};

                &>.separator{
                    height: 1px;
                    margin: ${theme.spacing(.5)}px ${theme.spacing(-.5)}px;
                    background-color: ${UI_COLORS.border};
                }

                &>button.option{
                    display: flex;
                    align-items: center;
                    gap: ${theme.spacing(1.25)}px;
                    height: 32px;
                    padding: 0 ${theme.spacing(1.25)}px;
                    border: none;
                    border-radius: ${theme.spacing(.75)}px;
                    background: transparent;
                    text-align: left;
                    &>svg{
                        flex-shrink: 0;
                        color: ${UI_COLORS.textMuted};
                    }
                    &:hover:not(:disabled){
                        background-color: ${UI_COLORS.hover};
                    }
                    &:disabled{
                        cursor: default;
                        opacity: .4;
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