import React, { useRef } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../components/landingPage/header';
import Hero from '../components/landingPage/hero';
import Projects from '../components/landingPage/projects';
import Demo from '../components/landingPage/demo';
import { createNewFile } from '../actions/pages/pages.actions';
import { PAGES } from '../actions/pages/pages.interface';
import generateId from '../utils/idGenerator';
import { UI_COLORS } from '../theme/uiTokens';

const LandingPage = function () {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onCreateNew = () => {
        dispatch(createNewFile());
        navigate('/editor');
    }

    const onImport = () => {
        fileInputRef.current?.click();
    }

    const fileChangeHandler = function (e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.addEventListener('load', ev => {
            try {
                const data: PAGES = JSON.parse(ev.target!.result as string);
                data.id = generateId();
                dispatch(createNewFile(data));
                navigate('/editor');
            }
            catch (err) {
                alert(`Couldn't open “${file.name}”. Choose a JSON file exported from UiEditor.`);
            }
            finally {
                // allow picking the same file again
                input.value = '';
            }
        });
        fileReader.readAsText(file);
    }

    return (
        <Page>
            <Header onCreateNew={onCreateNew} onImport={onImport} />
            <main>
                <Hero onCreateNew={onCreateNew} onImport={onImport} />
                <Projects onCreateNew={onCreateNew} />
                <Demo />
            </main>
            <footer>
                UiEditor — an SVG editor that runs in your browser. Projects are saved locally on this device.
            </footer>
            <input type='file' accept='.json,application/json' ref={fileInputRef} style={{ display: 'none' }} onChange={fileChangeHandler} />
        </Page>
    );
}

const Page = styled.div`
    min-height: 100%;
    background-color: ${UI_COLORS.surfaceMuted};
    color: ${UI_COLORS.text};
    text-align: left;

    & button{
        font: inherit;
        cursor: pointer;
    }

    &>main{
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px 48px;
    }

    &>footer{
        padding: 24px 32px;
        border-top: 1px solid ${UI_COLORS.border};
        color: ${UI_COLORS.textMuted};
        font-size: 13px;
        text-align: center;
    }

    @media (max-width: 640px){
        &>main{
            padding: 0 16px 32px;
        }
    }
`;

export default LandingPage;
