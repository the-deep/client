import { isNotDefined } from '@togglecorp/fujs';
import { isCallable } from '@togglecorp/toggle-form';

// COLORS

function hexToRgb(hex: string) {
    return {
        r: +`0x${hex[1]}${hex[2]}`,
        g: +`0x${hex[3]}${hex[4]}`,
        b: +`0x${hex[5]}${hex[6]}`,
    };
}

function hex255(n: number) {
    return n.toString(16).padStart(2, '0');
}

function rgbToHex(rgb: { r: number, g: number, b: number }) {
    const { r, g, b } = rgb;

    return `#${hex255(r)}${hex255(g)}${hex255(b)}`;
}

function hslToRgb(hsl: { h: number, s: number, l: number }) {
    const { h, s, l } = hsl;

    if (h === 0) {
        const v = Math.round(l * 255);
        return {
            r: v,
            g: v,
            b: v,
        };
    }

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    const lookUps = [
        [c, x, 0],
        [x, c, 0],
        [0, c, x],
        [0, x, c],
        [x, 0, c],
        [c, 0, x],
    ];

    const i = Math.ceil(h / 60) - 1;
    const [rp, gp, bp] = lookUps[i];

    return {
        r: Math.round((rp + m) * 255),
        g: Math.round((gp + m) * 255),
        b: Math.round((bp + m) * 255),
    };
}

function getHue(r: number, g: number, b: number, max: number, diff: number) {
    if (r === max) {
        const hue = 60 * ((g - b) / diff);
        if (hue > 0) {
            return hue;
        }

        return 360 + hue;
    }

    if (g === max) {
        return 60 * (2 + (b - r) / diff);
    }

    if (b === max) {
        return 60 * (4 + (r - g) / diff);
    }

    return 0;
}

function hexToHsl(hex: string) {
    const c = hexToRgb(hex);
    const r = c.r / 255;
    const g = c.g / 255;
    const b = c.b / 255;

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;

    if (diff === 0) {
        return { h: 0, s: 0, l };
    }

    const s = diff / Math.abs(1 - (2 * l - 1));
    const h = getHue(r, g, b, max, diff);
    return { h, s, l };
}

function interpolate255(a: number, b: number, factor: number) {
    return Math.min(Math.round(a + (b - a) * factor), 255);
}

function interpolateHexColor(ha: string, hb: string, factor: number) {
    const ca = hexToRgb(ha);
    const cb = hexToRgb(hb);

    const r = hex255(interpolate255(ca.r, cb.r, factor));
    const g = hex255(interpolate255(ca.g, cb.g, factor));
    const b = hex255(interpolate255(ca.b, cb.b, factor));

    return `#${r}${g}${b}`;
}

type Callable<T> = T | ((t: T | undefined) => T);

function resolveCallable<T>(callable: Callable<T>, arg: T) {
    if (!isCallable(callable)) {
        return callable;
    }

    return callable(arg);
}

export function modifyHexSL(hex: string, s?: Callable<number>, l?: Callable<number>) {
    if (isNotDefined(s) && isNotDefined(l)) {
        return hex;
    }

    const hsl = hexToHsl(hex);
    const rgb = hslToRgb({
        h: hsl.h,
        s: Math.min(hsl.s * resolveCallable(s ?? 1, hsl.s), 1),
        l: Math.min(hsl.l * resolveCallable(l ?? 1, hsl.l), 1),
    });

    return rgbToHex(rgb);
}

export function getColorScaleFunction(
    domain: {
        min: number;
        max: number;
    },
    rangeValues: string[],
) {
    const domainSize = domain.max - domain.min;

    return (value: number, s?: Callable<number>, l?: Callable<number>) => {
        const normalizedValue = (value - domain.min) / domainSize;
        const location = (rangeValues.length - 1) * normalizedValue;
        const startIndex = Math.floor(location);
        const endIndex = Math.ceil(location);

        // exact match
        if (startIndex === endIndex) {
            return modifyHexSL(rangeValues[startIndex], s, l);
        }

        const locallyNormalizedValue = (location - startIndex) / (endIndex - startIndex);
        const color = interpolateHexColor(
            rangeValues[startIndex],
            rangeValues[endIndex],
            locallyNormalizedValue,
        );

        return modifyHexSL(color, s, l);
    };
}
