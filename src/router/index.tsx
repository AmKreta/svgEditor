import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../views/landingPage';
import UiEditor from '../views/uiEditor';

const Router: React.FC<{}> = function () {
    return (
        <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/editor' element={<UiEditor />} />
        </Routes>
    );
}

export default Router;