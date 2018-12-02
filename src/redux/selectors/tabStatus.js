import { createSelector } from 'reselect';

const emptyList = [];

export const tabsByUrlSelector = ({ tabStatus }) => (
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

export const currentUrlSelector = (state, { match }) => match.url;

export const tabsByCurrentUrlSelector = createSelector(
    tabsByUrlSelector,
    currentUrlSelector,
    (tabsByUrl, currentUrl) => tabsByUrl[currentUrl] || emptyList,
);
