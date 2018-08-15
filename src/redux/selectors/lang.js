import { createSelector } from 'reselect';
import devLang from '../initial-state/dev-lang.json';

const emptyObject = {};

export const availableLanguagesSelector = ({ lang }) => ([
    ...lang.availableLanguages,
    { code: '$devLang', title: 'Default' },
]);

const languagesSelector = ({ lang }) => (
    lang.languages || emptyObject
);

// Selector Creators
export const createFooLanguageSelector = languageNameSelector => createSelector(
    languageNameSelector,
    languagesSelector,
    (selectedLanguage, languages) => (
        selectedLanguage === '$devLang'
            ? devLang
            : languages[selectedLanguage] || emptyObject
    ),
);
export const createFooStringsSelector = languageSelector => createSelector(
    languageSelector,
    selectedLanguage => selectedLanguage.strings || emptyObject,
);
export const createFooLinksSelector = languageSelector => createSelector(
    languageSelector,
    selectedLanguage => selectedLanguage.links || emptyObject,
);


// FIXME: using globalS.. for now, duplicate selector name
export const globalSelectedLanguageNameSelector = ({ lang }) => (
    lang.selectedLanguage || '$devLang'
);
const selectedLanguageSelector = createFooLanguageSelector(globalSelectedLanguageNameSelector);
export const selectedStringsSelector = createFooStringsSelector(selectedLanguageSelector);
export const selectedLinksSelector = createFooLinksSelector(selectedLanguageSelector);

const fallbackLanguageNameSelector = ({ lang }) => (
    lang.fallbackLanguage || '$devLang'
);
const fallbackLanguageSelector = createFooLanguageSelector(fallbackLanguageNameSelector);
export const fallbackStringsSelector = createFooStringsSelector(fallbackLanguageSelector);
export const fallbackLinksSelector = createFooLinksSelector(fallbackLanguageSelector);
