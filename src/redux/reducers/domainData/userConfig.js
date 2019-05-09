import update from '#rsu/immutable-update';
import {
    setTheme,
    themes,
} from '#theme';


export const SET_CURRENT_THEME = 'userConfig/SET_CURRENT_THEME ';

export const setCurrentThemeAction = value => ({
    type: SET_CURRENT_THEME,
    value,
});

const setCurrentTheme = (state, action) => {
    const { value } = action;

    const settings = {
        currentThemeId: { $set: value },
    };

    console.info('setting theme to', themes[value].title);
    setTheme(value);

    return update(state, settings);
};

export const userConfigReducers = {
    [SET_CURRENT_THEME]: setCurrentTheme,
};

export default userConfigReducers;
