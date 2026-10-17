import { BsCircle, BsSquare, BsPencil } from 'react-icons/bs';
import { AiOutlineLine } from 'react-icons/ai';
import { FaDrawPolygon, FaSortAlphaUp } from 'react-icons/fa';
import { CgShapeZigzag } from 'react-icons/cg';
import { FaExpandArrowsAlt, FaImage } from 'react-icons/fa';

export enum SHAPE_TYPES {
    CIRCLE = 'CIRCLE',
    RECTANGLE = 'RECTANGLE',
    ELLIPSE = 'ELLIPSE',
    LINE = 'LINE',
    POLYLINE = 'POLYLINE',
    POLYGON = 'POLYGON',
    PATH = 'PATH',
    TEXT = 'TEXT',
    PAN = 'Pan',
    GROUP = 'Group',
    IMAGE = 'FaImage'
};

export enum HELPERS {
    GRID = 'Grid',
    POINTER = 'Pointer',
    SHAPE = 'SHAPE'
}

export const ToolBarOptions = {
    TOOLS: 'Tools',
    COLORS: 'Colors',
    Gradients: 'Gradients',
    INSERT: 'Insert',
    HELPERS: 'Helpers'
}

export const multiPointShpes = [
    SHAPE_TYPES.PATH,
    SHAPE_TYPES.POLYGON,
    SHAPE_TYPES.POLYLINE,
    SHAPE_TYPES.LINE
];

export const TOOLS = [
    {
        icon: BsCircle,
        title: SHAPE_TYPES.CIRCLE
    },
    {
        icon: BsSquare,
        title: SHAPE_TYPES.RECTANGLE
    },
    {
        icon: AiOutlineLine,
        title: SHAPE_TYPES.LINE
    },
    {
        icon: FaDrawPolygon,
        title: SHAPE_TYPES.POLYGON
    },
    {
        icon: CgShapeZigzag,
        title: SHAPE_TYPES.POLYLINE
    },
    {
        icon: BsCircle,
        title: SHAPE_TYPES.ELLIPSE,
        style: { transform: 'scaleX(1.5)' }
    },
    {
        icon: BsPencil,
        title: SHAPE_TYPES.PATH
    },
    {
        icon: FaSortAlphaUp,
        title: SHAPE_TYPES.TEXT
    },
    {
        icon: FaImage,
        title: SHAPE_TYPES.IMAGE
    },
    {
        icon: FaExpandArrowsAlt,
        title: SHAPE_TYPES.PAN
    },
];

export const availableFonts = [
    "American Typewriter",
    "Andale Mono",
    "Arial",
    "Arial Black",
    "Arial Narrow",
    "Arial Rounded MT Bold",
    "Arial Unicode MS",
    "Avenir",
    "Avenir Next",
    "Avenir Next Condensed",
    "Baskerville",
    "Big Caslon",
    "Bodoni 72",
    "Bodoni 72 Oldstyle",
    "Bodoni 72 Smallcaps",
    "Bradley Hand",
    "Brush Script MT",
    "Chalkboard",
    "Chalkboard SE",
    "Chalkduster",
    "Charter",
    "Cochin",
    "Comic Sans MS",
    "Copperplate",
    "Courier",
    "Courier New",
    "DIN Alternate",
    "DIN Condensed",
    "Didot",
    "Futura",
    "Geneva",
    "Georgia",
    "Gill Sans",
    "Helvetica",
    "Helvetica Neue",
    "Herculanum",
    "Hoefler Text",
    "Impact",
    "Lucida Grande",
    "Luminari",
    "Marker Felt",
    "Menlo",
    "Microsoft Sans Serif",
    "Monaco",
    "Noteworthy",
    "Optima",
    "Palatino",
    "Papyrus",
    "Phosphate",
    "Rockwell",
    "Savoye LET",
    "SignPainter",
    "Skia",
    "Snell Roundhand",
    "Symbol",
    "Tahoma",
    "Times",
    "Times New Roman",
    "Trattatello",
    "Trebuchet MS",
    "Verdana",
    "Webdings",
    "Wingdings",
    "Zapfino"
];

export enum TRANSFORM_MODE {
    TRANSLATE = 'TRANSLATE',
    SCALE = 'SCALE',
    ROTATE = 'ROTATE'
}

export const POINTER_BUTTON = {
    PRIMARY: 0,
    MIDDLE: 1,
    SECONDARY: 2
} as const;

/** Scale factor applied per CSS pixel of drag while Ctrl is held. */
export const SCALE_PER_PIXEL = 0.01;
/** Rotation in degrees applied per CSS pixel of horizontal drag while Shift is held. */
export const ROTATE_DEGREES_PER_PIXEL = 0.5;
export const MIN_SHAPE_SCALE = 0.05;
/** Skip path samples closer than this (svg units) so freehand paths stay lighter. */
export const MIN_PATH_POINT_DISTANCE = 2;