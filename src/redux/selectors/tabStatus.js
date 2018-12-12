import { createSelector } from 'reselect';

const emptyList = [];

const groupMapByValue = (obj, groupKeySelector, modifier) => Object.keys(obj).reduce(
    (acc, key) => {
        const entry = obj[key];
        const groupKey = groupKeySelector(entry, key);
        const newValue = modifier(entry, key);
        if (!groupKey) {
            return acc;
        }

        if (!acc[groupKey]) {
            return {
                ...acc,
                [groupKey]: [newValue],
            };
        }
        return {
            ...acc,
            [groupKey]: [...acc[groupKey], newValue],
        };
    },
    {},
);

const tabsByUrlSelector = ({ tabStatus }) => groupMapByValue(
    tabStatus,
    (tab) => {
        // NOTE: tab.url is undefined
        // when tabStatus/SET_TIME is earier than tabStatus/SET_STATUS
        if (!tab.url) {
            return undefined;
        }
        // removing everying after has in tab url
        const indexOfHash = tab.url.indexOf('#');
        if (indexOfHash !== -1) {
            return tab.url.substring(0, indexOfHash);
        }
        return tab.url;
    },
    (tab, tabKey) => tabKey,
);

const currentUrlSelector = (state, { match }) => match.url;

// eslint-disable-next-line import/prefer-default-export
export const tabsByCurrentUrlSelector = createSelector(
    tabsByUrlSelector,
    currentUrlSelector,
    (tabsByUrl, currentUrl) => tabsByUrl[currentUrl] || emptyList,
);
