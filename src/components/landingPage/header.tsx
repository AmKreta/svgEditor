import React, { useRef } from 'react';
import Styled, { css } from 'styled-components';
import { THEME } from '../../theme/theme';
import Button from '../button.component';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createNewFile } from '../../actions/pages/pages.actions';
import { PAGES } from '../../actions/pages/pages.interface';
import generateId from '../../utils/idGenerator';

const Header: React.FC = function () {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const createNewFileHandler = () => {
        dispatch(createNewFile());
        navigate('/editor');
    }

    const importJsonHandler = () => {
        fileInputRef.current?.click();
    }

    const fileChangeHandler = function (e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files![0];
        if (file) {
            let fileReader = new FileReader();
            fileReader.addEventListener('load', ev => {
                try {
                    let data: PAGES = (JSON.parse(ev.target!.result as string));
                    data.id = generateId();
                    dispatch(createNewFile(data));
                    navigate('./editor');
                }
                catch (err) {
                    alert('cant convert file content to json, err:- invalid file format');
                }
            });
            fileReader.readAsText(file);
        }
        else {
            alert('accepts only json files');
        }
    }

    return (
        <StyledHeader>
            <div className='logo'>
                UiEditor
            </div>
            <nav>
                <Button title='Import Json' onClick={importJsonHandler} />
                <Button title='Create new file' onClick={createNewFileHandler} />
            </nav>
            <input type='file' ref={fileInputRef} style={{ display: 'none' }} onChange={fileChangeHandler} />
        </StyledHeader>
    );
}

const StyledHeader = Styled.header`
    ${props => {
        const theme = props.theme as THEME;
        return css`
                height:10%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding:0 ${theme.spacing(4)}px;
                position:sticky;
                top:0;
                left:0;
                background-color: white;
                box-shadow:0 1px 2px rgba(0,0,0,.09);
                &>.logo{
                    font-family: 'Dancing Script', cursive;
                    font-size: 40px;
                    font-weight: bold;
                }
                &>nav{
                    display: flex;
                    align-items: center;
                    &>button:first-child{
                        margin-right:${theme.spacing(2)}px;
                    }
                    &>button:nth-child(2){
                        background-color:#333;
                        color:white;
                        border-radius: 8px;
                        transform:scale(1.1)
                    }
                }
            `;
    }
    }
`;

export default Header;