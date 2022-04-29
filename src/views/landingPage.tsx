import React from 'react';
import Header from '../components/landingPage/header';
import Projects from '../components/landingPage/projects';
import Demo from '../components/landingPage/demo';

const LandingPage = function () {
    return (
       <>
        <Header />
        <Demo />
        <Projects />
       </>
    );
}

export default LandingPage;