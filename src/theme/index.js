import { initializeStyles } from '#rsu/styles';

import classicColors from './classic/colors';
import classicDimens from './classic/dimens';


const themes = {
    default: {
    },

    classic: {
        title: 'Classic',
        colors: classicColors,
        dimens: classicDimens,
    },
};

export const setTheme = (themeId) => {
    const theme = themes[themeId];

    initializeStyles({
        ...theme,
    });
};

export const dummy = {};
