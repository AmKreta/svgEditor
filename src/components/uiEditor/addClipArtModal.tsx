import React, { useState, useRef } from 'react';
import Modal from '../modal.component';
import styled, { css, keyframes } from 'styled-components';
import { THEME } from '../../theme/theme';
import Input from '../input.component';
import { AiOutlineSearch } from 'react-icons/ai';
import Button from '../button.component';
import axios from 'axios';
import Loader from '../loader';
interface props {
    onClose: Function;
    addClipArt: Function;
}

const AddClipArtModal: React.FC<props> = function ({ onClose, addClipArt }) {

    const [searchInput, setSearchInput] = useState<string>('');
    const [clipArtList, setClipArtList] = useState<any[]>([]);
    const [loader, setLoader] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    const prevRequestCompleted = useRef<boolean>(true);

    const changeHandler = function (e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setSearchInput(value);
    }

    function fetchClipArt(callback: Function) {
        axios
            .get(`https://permaclipart.org/wp-json/clipart/api?query=${searchInput}&num=20&page=${loadCount + 1}`)
            .then(res => {
                if (res.data.status !== 404) {
                    setClipArtList(prevState => [...prevState, ...res.data.items]);
                    setLoadCount(prevState => prevState + 1);
                }
            })
            .catch(err => { console.log(err) })
            .finally(() => { callback() });
    }

    function fetchOnCLick() {
        setLoader(true);
        if (searchInput.length > 2) {
            fetchClipArt(() => setLoader(false));
        }
    }

    async function action() {
        if (prevRequestCompleted.current) {
            prevRequestCompleted.current = false;
            fetchClipArt(() => { prevRequestCompleted.current = true; });
        }
    }

    return (
        <Modal>
            <ModalContainer>
                <div id='searchBar'>
                    <Input
                        value={searchInput}
                        onChange={changeHandler}
                        label='search clip Art'
                        placeholder='search clip art'
                        endIcon={AiOutlineSearch}
                    />
                    <Button title='search' onClick={fetchOnCLick} />
                    <Button title='cancel' onClick={onClose as any} />
                </div>
                <div id='resultContainer'>
                    {
                        loader
                            ? <Loader />
                            : clipArtList.length
                                ? <>
                                    {
                                        clipArtList.map((art: any) => (
                                            <img key={art.fscid} src={art.svgurl} alt={art.title} onClick={addClipArt as any} loading='lazy' />
                                        ))
                                    }
                                    <Loader size={30} action={action} />
                                </>
                                : <div className='emptyMessage'>Search to get clip arts</div>
                    }
                </div>
            </ModalContainer>
        </Modal>
    );
}

export default AddClipArtModal;

const ModalContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            padding:${theme.spacing(2)}px;
            display:flex;
            align-items: center;
            flex-direction: column;
            height:100%;
            
            &>#searchBar{
                display:flex;
                width:80%;
                margin:auto;
                &>*:first-child{
                    //search input
                    flex-grow: 1;
                }
                &>*:nth-child(2){
                    margin:0 ${theme.spacing(2)}px;
                }
            }

            &>#resultContainer{
                flex-grow: 1;
                width:100%;
                overflow-y:scroll;
                padding:${theme.spacing(2)}px;
                position:relative;
                display:flex;
                align-items: center;
                justify-content: flex-start;
                align-content: flex-start;
                flex-wrap: wrap;

                &>div.emptyMessage{
                    position:absolute;
                    top:50%;
                    left:50%;
                    transform:translate(-50%,-50%);
                    color:#999;
                }

                &>img{
                    min-width:200px;
                    min-height:200px;
                    width:200px;
                    height:200px;
                    margin:8px;
                    border:1px solid #ccc;
                    &:hover{
                        cursor:pointer;
                        box-shadow:0 0 5px #ccc;
                    }
                }
            }
        `;
    }}
`;

const rotateAnimation = keyframes`
    0%{
        transform:translate(-50%,-50%) rotate(0deg);
    }
    100%{
        transform:translate(-50%,-50%) rotate(360deg);
    }
`;