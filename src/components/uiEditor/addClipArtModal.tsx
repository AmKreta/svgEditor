import React, { useState, useRef } from 'react';
import Modal from '../modal.component';
import styled, { css, keyframes } from 'styled-components';
import { THEME } from '../../theme/theme';
import { BsExclamationTriangle, BsImage, BsPlusLg, BsSearch, BsX, BsXCircleFill } from 'react-icons/bs';
import axios from 'axios';
import Loader from '../loader';
import { UI_COLORS } from '../../theme/uiTokens';
import { useEventListener } from '../../hooks/useEventListener';
import { useLatestRef } from '../../hooks/useLatestRef';

interface props {
    onClose: () => void;
    addClipArt: (src: string) => void;
}

enum ART_TYPES {
    CLIP_ART = 'clipArt',
    VECTOR = 'vector',
    ILLUSTRATION = 'illustration',
    PHOTO = 'photo'
}

const ART_TYPE_LABELS: Record<ART_TYPES, string> = {
    [ART_TYPES.CLIP_ART]: 'Clip art',
    [ART_TYPES.ILLUSTRATION]: 'Illustrations',
    [ART_TYPES.VECTOR]: 'Vectors',
    [ART_TYPES.PHOTO]: 'Photos',
};

interface IMAGE_DATA {
    id: string;
    alt: string;
    src: string;
    previewSrc?: string;
}

type SEARCH_STATUS = 'idle' | 'loading' | 'error' | 'done';

const PAGE_SIZE = 20;
const MIN_QUERY_LENGTH = 3;
const SUGGESTIONS = ['flower', 'arrow', 'star', 'animal', 'tree', 'heart'];

async function fetchImages(query: string, artType: ART_TYPES, page: number): Promise<IMAGE_DATA[]> {
    if (artType === ART_TYPES.CLIP_ART) {
        const res = await axios.get('https://permaclipart.org/wp-json/clipart/api', {
            params: { query, num: PAGE_SIZE, page }
        });
        if (res.data.status === 404) {
            return [];
        }
        return (res.data.items || []).map((imageData: any) => ({
            id: String(imageData.fscid),
            src: imageData.svgurl,
            alt: imageData.title
        }));
    }
    const res = await axios.get('https://pixabay.com/api/', {
        params: { key: '25933777-5b40e007583d087896e3c5fea', q: query, image_type: artType, page, per_page: PAGE_SIZE }
    });
    return (res.data?.hits || []).map((imageData: any) => ({
        id: String(imageData.id),
        src: imageData.largeImageURL,
        alt: imageData.tags,
        previewSrc: imageData.previewURL
    }));
}

const AddClipArtModal: React.FC<props> = function ({ onClose, addClipArt }) {

    const [searchInput, setSearchInput] = useState<string>('');
    const [results, setResults] = useState<IMAGE_DATA[]>([]);
    const [status, setStatus] = useState<SEARCH_STATUS>('idle');
    const [hasMore, setHasMore] = useState(false);
    const [brokenIds, setBrokenIds] = useState<Set<string>>(() => new Set());
    const [artType, setArtType] = useState<ART_TYPES>(ART_TYPES.CLIP_ART);
    // what the visible results were searched with, so "load more" doesn't pick up unsent edits
    const lastSearch = useRef({ query: '', artType: ART_TYPES.CLIP_ART, page: 0 });
    // bumped on every new search; responses from older searches are dropped
    const requestId = useRef(0);
    const loadingMore = useRef(false);

    const canSearch = searchInput.trim().length >= MIN_QUERY_LENGTH;

    async function search(query: string, type: ART_TYPES) {
        const trimmed = query.trim();
        if (trimmed.length < MIN_QUERY_LENGTH) {
            return;
        }
        const id = ++requestId.current;
        lastSearch.current = { query: trimmed, artType: type, page: 1 };
        setStatus('loading');
        setResults([]);
        setHasMore(false);
        try {
            const items = await fetchImages(trimmed, type, 1);
            if (id !== requestId.current) {
                return;
            }
            setResults(items);
            setHasMore(items.length >= PAGE_SIZE);
            setStatus('done');
        } catch (err) {
            if (id === requestId.current) {
                setStatus('error');
            }
        }
    }

    async function loadMore() {
        if (loadingMore.current || !hasMore) {
            return;
        }
        const id = requestId.current;
        const { query, artType: type, page } = lastSearch.current;
        loadingMore.current = true;
        try {
            const items = await fetchImages(query, type, page + 1);
            if (id !== requestId.current) {
                return;
            }
            lastSearch.current.page = page + 1;
            setResults(prev => {
                const seen = new Set(prev.map(item => item.id));
                return [...prev, ...items.filter(item => !seen.has(item.id))];
            });
            setHasMore(items.length >= PAGE_SIZE);
        } catch (err) {
            // past the last page some APIs answer with an error; treat it as the end
            id === requestId.current && setHasMore(false);
        } finally {
            loadingMore.current = false;
        }
    }

    // Loader keeps the first callback it receives, so route it through a ref
    const loadMoreRef = useLatestRef(loadMore);
    const loadMoreFromSentinel = useRef(() => loadMoreRef.current()).current;

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        search(searchInput, artType);
    }

    function onArtTypeChange(type: ART_TYPES) {
        if (type === artType) {
            return;
        }
        setArtType(type);
        const query = canSearch ? searchInput : lastSearch.current.query;
        query && search(query, type);
    }

    function searchSuggestion(suggestion: string) {
        setSearchInput(suggestion);
        search(suggestion, artType);
    }

    function markBroken(id: string) {
        setBrokenIds(prev => new Set(prev).add(id));
    }

    useEventListener('keydown', (e: KeyboardEvent) => {
        e.key === 'Escape' && onClose();
    });

    const visibleResults = results.filter(item => !brokenIds.has(item.id));

    return (
        <Modal
            modalStyle={{ height: '82vh', width: 'min(980px, 92vw)', borderRadius: '12px', overflow: 'hidden' }}
            onOverlayClick={(e: MouseEvent) => {
                // block body on purpose: Modal installs this as an onclick property,
                // where returning false would cancel every click inside the dialog
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <ModalContainer>
                <header>
                    <div className='titleRow'>
                        <h3>Insert image</h3>
                        <button className='iconButton' onClick={onClose} aria-label='Close' title='Close (Esc)'>
                            <BsX />
                        </button>
                    </div>
                    <form onSubmit={onSubmit}>
                        <label className='searchField'>
                            <BsSearch className='searchIcon' />
                            <input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                placeholder={`Search ${ART_TYPE_LABELS[artType].toLowerCase()}…`}
                                autoFocus
                                aria-label='Search images'
                            />
                            {
                                searchInput
                                    ? (
                                        <button type='button' className='clear' onClick={() => setSearchInput('')} aria-label='Clear search'>
                                            <BsXCircleFill />
                                        </button>
                                    )
                                    : null
                            }
                        </label>
                        <button type='submit' className='primary' disabled={!canSearch}>Search</button>
                    </form>
                    <div className='types' role='tablist' aria-label='Image type'>
                        {
                            [ART_TYPES.CLIP_ART, ART_TYPES.ILLUSTRATION, ART_TYPES.VECTOR, ART_TYPES.PHOTO].map(type => (
                                <button
                                    key={type}
                                    role='tab'
                                    aria-selected={artType === type}
                                    className={artType === type ? 'active' : ''}
                                    onClick={() => onArtTypeChange(type)}
                                >
                                    {ART_TYPE_LABELS[type]}
                                </button>
                            ))
                        }
                    </div>
                </header>

                <div className='results'>
                    {
                        status === 'idle'
                            ? (
                                <div className='state'>
                                    <BsImage className='stateIcon' />
                                    <h4>Find an image to add</h4>
                                    <p>Search free clip art, illustrations, vectors and photos.</p>
                                    <div className='suggestions'>
                                        {
                                            SUGGESTIONS.map(suggestion => (
                                                <button key={suggestion} onClick={() => searchSuggestion(suggestion)}>{suggestion}</button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )
                            : null
                    }
                    {
                        status === 'loading'
                            ? (
                                <div className='grid' aria-busy='true'>
                                    {Array.from({ length: 12 }, (_, i) => <div key={i} className='skeleton' />)}
                                </div>
                            )
                            : null
                    }
                    {
                        status === 'error'
                            ? (
                                <div className='state'>
                                    <BsExclamationTriangle className='stateIcon' />
                                    <h4>Couldn't load images</h4>
                                    <p>Check your connection and try again.</p>
                                    <button className='primary' onClick={() => search(lastSearch.current.query, lastSearch.current.artType)}>Retry</button>
                                </div>
                            )
                            : null
                    }
                    {
                        status === 'done' && visibleResults.length === 0
                            ? (
                                <div className='state'>
                                    <BsSearch className='stateIcon' />
                                    <h4>No results for “{lastSearch.current.query}”</h4>
                                    <p>Try a different word or another image type.</p>
                                </div>
                            )
                            : null
                    }
                    {
                        status === 'done' && visibleResults.length > 0
                            ? (
                                <>
                                <div className='grid'>
                                    {
                                        visibleResults.map(art => (
                                            <button
                                                key={art.id}
                                                className={`card${artType === ART_TYPES.PHOTO ? ' photo' : ''}`}
                                                onClick={() => addClipArt(art.src)}
                                                title={art.alt}
                                            >
                                                <img
                                                    src={art.previewSrc || art.src}
                                                    alt={art.alt}
                                                    loading='lazy'
                                                    onError={() => markBroken(art.id)}
                                                />
                                                <span className='overlay'>
                                                    <BsPlusLg />
                                                    <span className='caption'>{art.alt}</span>
                                                </span>
                                            </button>
                                        ))
                                    }
                                </div>
                                {
                                    // Loader observes against its grandparent, which must be the scrolling .results
                                    hasMore ? <div className='more'><Loader size={24} action={loadMoreFromSentinel} /></div> : null
                                }
                                </>
                            )
                            : null
                    }
                </div>

                <footer>
                    Clip art from permaclipart.org · Illustrations, vectors and photos from Pixabay
                </footer>
            </ModalContainer>
        </Modal>
    );
}

export default AddClipArtModal;

const shimmer = keyframes`
    from{ background-position: 100% 0; }
    to{ background-position: -100% 0; }
`;

const ModalContainer = styled.div`
    ${props => {
        const theme = props.theme as THEME;
        return css`
            display: flex;
            flex-direction: column;
            height: 100%;
            color: ${UI_COLORS.text};
            font-size: 13px;
            text-align: left;

            & button{
                font: inherit;
                color: inherit;
                cursor: pointer;
            }

            & button.primary{
                height: 36px;
                padding: 0 ${theme.spacing(2)}px;
                border: none;
                border-radius: ${theme.spacing(1)}px;
                background-color: ${UI_COLORS.accent};
                color: white;
                font-weight: 600;
                &:hover:not(:disabled){
                    filter: brightness(.95);
                }
                &:disabled{
                    cursor: default;
                    opacity: .45;
                }
            }

            &>header{
                display: flex;
                flex-direction: column;
                gap: ${theme.spacing(1.5)}px;
                padding: ${theme.spacing(2)}px ${theme.spacing(2.5)}px ${theme.spacing(1.5)}px;
                border-bottom: 1px solid ${UI_COLORS.border};

                & .titleRow{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    &>h3{
                        font-size: 16px;
                        font-weight: 600;
                    }
                }

                & .iconButton{
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 32px;
                    width: 32px;
                    border: none;
                    border-radius: ${theme.spacing(1)}px;
                    background: transparent;
                    color: ${UI_COLORS.textMuted};
                    &>svg{
                        height: 22px;
                        width: 22px;
                    }
                    &:hover{
                        background-color: ${UI_COLORS.hover};
                        color: ${UI_COLORS.text};
                    }
                }

                &>form{
                    display: flex;
                    gap: ${theme.spacing(1)}px;
                }

                & .searchField{
                    display: flex;
                    align-items: center;
                    gap: ${theme.spacing(1)}px;
                    flex-grow: 1;
                    height: 36px;
                    padding: 0 ${theme.spacing(1.25)}px;
                    border: 1px solid ${UI_COLORS.inputBorder};
                    border-radius: ${theme.spacing(1)}px;
                    background-color: ${UI_COLORS.surface};
                    cursor: text;
                    &:focus-within{
                        border-color: ${UI_COLORS.accent};
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, .2);
                    }
                    &>.searchIcon{
                        flex-shrink: 0;
                        color: ${UI_COLORS.textMuted};
                    }
                    &>input{
                        flex-grow: 1;
                        min-width: 0;
                        border: none;
                        outline: none;
                        background: transparent;
                        font: inherit;
                        font-size: 14px;
                    }
                    &>.clear{
                        display: inline-flex;
                        border: none;
                        background: transparent;
                        color: ${UI_COLORS.inputBorder};
                        &:hover{
                            color: ${UI_COLORS.textMuted};
                        }
                    }
                }

                & .types{
                    display: flex;
                    gap: ${theme.spacing(.75)}px;
                    &>button{
                        height: 28px;
                        padding: 0 ${theme.spacing(1.5)}px;
                        border: 1px solid ${UI_COLORS.border};
                        border-radius: 999px;
                        background-color: ${UI_COLORS.surface};
                        color: ${UI_COLORS.textMuted};
                        font-weight: 500;
                        &:hover{
                            color: ${UI_COLORS.text};
                            background-color: ${UI_COLORS.hover};
                        }
                        &.active{
                            border-color: ${UI_COLORS.text};
                            background-color: ${UI_COLORS.text};
                            color: white;
                        }
                    }
                }
            }

            &>.results{
                position: relative;
                flex-grow: 1;
                min-height: 0;
                overflow-y: auto;
                padding: ${theme.spacing(2)}px ${theme.spacing(2.5)}px;
                background-color: ${UI_COLORS.surfaceMuted};

                & .grid{
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: ${theme.spacing(1.5)}px;
                }

                & .skeleton, & .card{
                    aspect-ratio: 1;
                    border-radius: ${theme.spacing(1.25)}px;
                }

                & .skeleton{
                    background: linear-gradient(90deg, ${UI_COLORS.hover} 0%, ${UI_COLORS.pressed} 50%, ${UI_COLORS.hover} 100%);
                    background-size: 200% 100%;
                    animation: ${shimmer} 1.2s linear infinite;
                }

                & .card{
                    position: relative;
                    padding: ${theme.spacing(1.5)}px;
                    border: 1px solid ${UI_COLORS.border};
                    background-color: ${UI_COLORS.surface};
                    overflow: hidden;
                    transition: border-color .15s, box-shadow .15s, transform .15s;

                    &>img{
                        display: block;
                        height: 100%;
                        width: 100%;
                        object-fit: contain;
                    }

                    &.photo{
                        padding: 0;
                        &>img{
                            object-fit: cover;
                        }
                    }

                    &>.overlay{
                        position: absolute;
                        inset: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: ${theme.spacing(1)}px;
                        padding: ${theme.spacing(1)}px;
                        background: linear-gradient(to top, rgba(17, 24, 39, .7), rgba(17, 24, 39, .25));
                        color: white;
                        opacity: 0;
                        transition: opacity .15s;

                        &>svg{
                            height: 22px;
                            width: 22px;
                        }

                        &>.caption{
                            position: absolute;
                            left: ${theme.spacing(1)}px;
                            right: ${theme.spacing(1)}px;
                            bottom: ${theme.spacing(1)}px;
                            font-size: 11px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            text-align: left;
                        }
                    }

                    &:hover, &:focus-visible{
                        outline: none;
                        border-color: ${UI_COLORS.accent};
                        box-shadow: 0 4px 14px rgba(17, 24, 39, .12);
                        transform: translateY(-1px);
                        &>.overlay{
                            opacity: 1;
                        }
                    }
                }

                & .more{
                    min-height: 56px;
                }

                & .state{
                    position: absolute;
                    top: 45%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: ${theme.spacing(1)}px;
                    width: min(420px, 90%);
                    text-align: center;
                    color: ${UI_COLORS.textMuted};

                    &>.stateIcon{
                        height: 36px;
                        width: 36px;
                        margin-bottom: ${theme.spacing(.5)}px;
                        color: ${UI_COLORS.inputBorder};
                    }
                    &>h4{
                        font-size: 15px;
                        font-weight: 600;
                        color: ${UI_COLORS.text};
                    }
                    &>.primary{
                        margin-top: ${theme.spacing(1)}px;
                    }
                }

                & .suggestions{
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: ${theme.spacing(.75)}px;
                    margin-top: ${theme.spacing(1)}px;
                    &>button{
                        height: 28px;
                        padding: 0 ${theme.spacing(1.5)}px;
                        border: 1px solid ${UI_COLORS.border};
                        border-radius: 999px;
                        background-color: ${UI_COLORS.surface};
                        color: ${UI_COLORS.text};
                        &:hover{
                            border-color: ${UI_COLORS.accent};
                            color: ${UI_COLORS.accent};
                        }
                    }
                }
            }

            &>footer{
                padding: ${theme.spacing(1)}px ${theme.spacing(2.5)}px;
                border-top: 1px solid ${UI_COLORS.border};
                color: ${UI_COLORS.textMuted};
                font-size: 11px;
            }
        `;
    }}
`;
