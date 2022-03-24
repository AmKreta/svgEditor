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

enum ART_TYPES {
    CLIP_ART = 'clipArt',
    VECTOR = 'vector',
    ILLUSTRATION = 'illustration',
    PHOTO = 'photo'
}
interface IMAGE_DATA {
    id: string;
    alt: string;
    src: string;
    previewSrc: string;
}

const AddClipArtModal: React.FC<props> = function ({ onClose, addClipArt }) {

    const [searchInput, setSearchInput] = useState<string>('');
    const [clipArtList, setClipArtList] = useState<IMAGE_DATA[]>([]);
    const [loader, setLoader] = useState(false);
    //const [loadCount, setLoadCount] = useState<number>(0);
    const [artType, setArtType] = useState<'clipArt' | 'vector' | 'illustration' | 'photo'>('clipArt')
    const prevRequestCompleted = useRef<boolean>(true);
    const loadCount=useRef<number>(0);

    const changeHandler = function (e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setSearchInput(value);
    }

    const fetchClipArt = (callback: Function, clear?: boolean) => {
        if (artType === 'clipArt') {
            axios
                .get(`https://permaclipart.org/wp-json/clipart/api?query=${searchInput}&num=20&page=${loadCount.current + 1}`)
                .then(res => {
                    if (res.data.status !== 404) {
                        const items: IMAGE_DATA[] = res.data.items.map((imageData: any) => ({
                            id: imageData.fscid,
                            src: imageData.svgurl,
                            alt: imageData.title
                        }))
                        if (clear) {
                            setClipArtList(items);
                            loadCount.current=0;
                        }
                        else {
                            setClipArtList(prevState => [...prevState, ...items]);
                            loadCount.current++;
                        }
                    }
                })
                .catch(err => { console.log(err) })
                .finally(() => { callback() });
        }
        else {
            axios
                .get(`https://pixabay.com/api/?key=25933777-5b40e007583d087896e3c5fea&q=${searchInput}&image_type=${artType}&page=${loadCount.current + 1}`)
                .then(res => {
                    const items: IMAGE_DATA[] = res.data?.hits?.map((imageData: any) => ({
                        id: imageData.id,
                        src: imageData.largeImageURL,
                        alt: imageData.tags,
                        previewSrc: imageData.previewURL
                    })) || [];
                    if (clear) {
                        setClipArtList(items);
                        loadCount.current=0;
                    }
                    else {
                        setClipArtList(prevState => [...prevState, ...items]);
                        loadCount.current++;
                    }
                })
                .catch(err => { console.log(err) })
                .finally(() => { callback() });
        }
    }

    function fetchOnCLick() {
        setLoader(true);
        if (searchInput.length > 2) {
            fetchClipArt(() => setLoader(false), true);
        }
    }

    async function action() {
        if (prevRequestCompleted.current) {
            prevRequestCompleted.current = false;
            fetchClipArt(() => { prevRequestCompleted.current = true; });
        }
    }

    function onArtTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setArtType(e.target.value as ART_TYPES);
    }

    return (
        <Modal>
            <ModalContainer>
                <div id='searchBar'>
                    <Input
                        value={searchInput}
                        onChange={changeHandler}
                        label='search'
                        placeholder={`search ${artType}`}
                        endIcon={AiOutlineSearch}
                    />
                    <select value={artType} onChange={onArtTypeChange}>
                        {
                            ([ART_TYPES.CLIP_ART, ART_TYPES.ILLUSTRATION, ART_TYPES.PHOTO, ART_TYPES.VECTOR] as ART_TYPES[]).map(type => <option key={type}>{type}</option>)
                        }
                    </select>
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
                                        clipArtList.map((art: IMAGE_DATA) => (
                                            <img key={art.id} src={art.previewSrc || art.src} alt={art.alt} onClick={addClipArt as any} loading='lazy' data-src={art.src} />
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
                align-items: center;
                width:90%;
                margin:auto;
                &>*:first-child{
                    //search input
                    flex-grow: 1;
                }
                &>*:nth-child(3){
                    margin:0 ${theme.spacing(2)}px;
                }

                &>select{
                    margin-left:${theme.spacing(2)}px;
                    padding:${theme.spacing(.8)}px; ${theme.spacing(1)}px;
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