import {
    setStyleProperties,
} from '#rsu/styles';

import purpleAndPinkColors from './purple-and-pink/colors';
import purpleAndPinkDimens from './purple-and-pink/dimens';

import nordColors from './nord/colors';
import nordDimens from './nord/dimens';

import defaultColors from './default/colors';
import defaultDimens from './default/dimens';

export const themes = {
    default: {
        title: 'Default',
        colors: defaultColors,
        dimens: defaultDimens,
    },

    purpleAndPink: {
        title: 'Purple & Pink',
        colors: purpleAndPinkColors,
        dimens: purpleAndPinkDimens,
    },

    nord: {
        title: 'Nord',
        colors: nordColors,
        dimens: nordDimens,
    },
};

export const setTheme = (themeId) => {
    const theme = themes[themeId];

    setStyleProperties({
        ...theme.colors,
        ...theme.dimens,
    });
};

export const dummy = {};
