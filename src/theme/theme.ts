interface THEME_OBJECT {
    light: string,
    dark: string,
    main: string
}

interface FONT_OBJECT {
    [fontName: string]: string
}

interface FONT_SIZE_OBJECT {
    [fontSize: string]: string
}

interface OPACITY_OBJECT {
    light1: number,
    light2: number,
    light3: number,
    light4: number,
    main: number
}

export interface THEME {
    primary: THEME_OBJECT,
    secondary: THEME_OBJECT,
    sucess: THEME_OBJECT,
    failure: THEME_OBJECT,
    danger: THEME_OBJECT,
    paper: THEME_OBJECT,
    spacing: (space: number|undefined) => number,
    fonts: FONT_OBJECT,
    fontSize: FONT_SIZE_OBJECT,
    opacity: OPACITY_OBJECT
}

const theme: THEME = {
    primary: {
        light: 'a',
        main: 'red',
        dark: 'a'
    },
    secondary: {
        light: 'a',
        main: 'a',
        dark: 'a'
    },
    sucess: {
        light: 'a',
        main: 'a',
        dark: 'a'
    },
    failure: {
        light: 'a',
        main: 'a',
        dark: 'a'
    },
    danger: {
        light: 'a',
        main: 'a',
        dark: 'a'
    },
    paper: {
        light: 'a',
        main: 'a',
        dark: 'a'
    },
    fonts: {},
    fontSize: {},
    opacity: {
        main: 1,
        light1: .8,
        light2: .6,
        light3: .4,
        light4: .2,
    },
    spacing: (space = 1) => 8 * space
}

export default theme;