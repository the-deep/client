import { createSelector } from 'reselect';

const emptyList = [];

/*
const groupMapByValue = (obj, groupKeySelector, modifier) => Object.keys(obj).reduce(
    (acc, key) => {
        const entry = obj[key];
        const groupKey = groupKeySelector(entry, key);
        const newValue = modifier(entry);
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
*/

const tabsByUrlSelector = ({ tabStatus }) => (
    Object.keys(tabStatus).reduce((acc, tabId) => {
        const tab = tabStatus[tabId];
        const urls = { ...acc };
        if (!urls[tab.url]) {
            urls[tab.url] = [tabId];
        } else {
            urls[tab.url].push(tabId);
        }
        return urls;
    }, {})
);

const currentUrlSelector = (state, { match }) => match.url;

// eslint-disable-next-line import/prefer-default-export
export const tabsByCurrentUrlSelector = createSelector(
    tabsByUrlSelector,
    currentUrlSelector,
    (tabsByUrl, currentUrl) => tabsByUrl[currentUrl] || emptyList,
);
