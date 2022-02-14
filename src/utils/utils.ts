import { FILTER_TYPES } from '../filters/availableFilters';
import { CSS_FILTERS, STYLE, SVG_FILTERS } from '../shapes/style';

export function getCssFilterString(cssFilters: CSS_FILTERS) {
    let res = '';
    cssFilters.blur && (res += `blur(${cssFilters.blur}px)`);
    cssFilters.brightness && (res += `brightness(${cssFilters.brightness})`);
    cssFilters.contrast && (res += `contrast(${cssFilters.contrast}%)`);
    cssFilters.grayscale && (res += `grayscale(${cssFilters.grayscale}%)`);
    cssFilters.hueRotate && (res += `hue-rotate(${cssFilters.hueRotate}deg)`);
    cssFilters.invert && (res += `invert(${cssFilters.invert}%)`);
    cssFilters.opacity && (res += `opacity(${cssFilters.opacity}%)`);
    cssFilters.saturate && (res += `saturate(${cssFilters.saturate}%)`);
    cssFilters.sepia && (res += `sepia(${cssFilters.sepia}%)`);
    if (cssFilters.dropShadow) {
        cssFilters.dropShadow.forEach((shadow: { xOffset: number, yOffset: number, blur: number, color: string }) => {
            res += `drop-shadow(${shadow.xOffset}px ${shadow.yOffset}px ${shadow.blur}px ${shadow.color})`;
        });
    }
    return res;
}

function getSvgFilterString(filters: SVG_FILTERS) {
    let res = '';
    for (let filterType in filters) {
        filters[filterType as FILTER_TYPES]?.forEach(filterId => {
            res += `url(#${filterId}) `;
        });
    }
    return res;
}

export function getStyleObj(style: STYLE) {
    const s = style;
    const styleObj = {
        fill: s.fill,
        fillOpacity: s.fillOpacity,
        fillRule: s.fillRule,
        stroke: s.stroke,
        strokeWidth: `${s.strokeWidth}${s.strokeWidth_unit}`,
        strokeDasharray: s.strokeDasharray.join(' '),
        strokeDashoffset: s.strokeDashoffset,
        strokeLinecap: s.strokeLinecap,
        strokeOpacity: s.strokeOpacity,
        strokeLinejoin: s.strokeLinejoin,
        strokeMitterlimit: s.strokeMitterlimit,
        transform: `translate(${s.translate[0]} ${s.translate[1]}) scale(${s.scale[0]} ${s.scale[1]}) rotate(${s.rotate}) skewX(${s.skewX}) skewY(${s.skewY})`,
        style: {
            filter: getCssFilterString(s.cssFilters) + getSvgFilterString(s.svgFilters)
        }
    }
    return styleObj;
};

export function areColliding(shape1: DOMRect, shape2: DOMRect) {
    // only accepts object returned by boundingClientRect()
    if ((shape2.top > shape1.top && shape2.top < shape1.bottom) || (shape2.bottom > shape1.top && shape2.bottom < shape1.bottom)) {
        if ((shape2.right > shape1.left && shape2.right < shape1.right) || (shape2.left < shape1.right && shape2.left > shape1.left)) {
            return true;
        }
    }
    return false;
}

export const toBase64 = (file: File) => new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export function getTransformOrigin(points: Array<[number, number]>) {
    let tx = 0, ty = 0;
    for (let point of points) {
        tx += point[0];
        ty += point[1];
    }
    tx /= points.length;
    ty /= points.length;

    return `${tx} ${ty}`;
}

export function getBoundingRectMidPoint(box: DOMRect | undefined) {
    if (box) {
        const { x, y, height, width } = box;
        return { x: x + (width / 2), y: y + (height / 2) };
    }
    return { x: 0, y: 0 };
}