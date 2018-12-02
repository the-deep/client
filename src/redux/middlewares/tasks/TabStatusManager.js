import AbstractTask from '#utils/AbstractTask';

import { removeTabStatusAction, getDefaultTabId } from '../../reducers/tabStatus';

// Refresh statuses every few seconds
const REFRESH_TIME = 500;

const tabStatusKeySelector = tabId => `tabStatus-${tabId}`;

export const setTabActive = () => {
    const key = tabStatusKeySelector(getDefaultTabId());
    localStorage.setItem(key, Date.now());
};

export const refreshTabStatus = (tabIds) => {
    const tabIdsToRemove = [];
    tabIds.forEach((tabId) => {
        const key = tabStatusKeySelector(tabId);
        const value = localStorage.getItem(key);
        if (!value) {
            tabIdsToRemove.push(tabId);
            return;
        }

        const lastActiveTime = +value;
        if (Date.now() - lastActiveTime > REFRESH_TIME * 2) {
            tabIdsToRemove.push(tabId);
            localStorage.removeItem(key);
        }
    });
    return tabIdsToRemove;
};

export class TabStatusSetter extends AbstractTask {
    start = () => {
        this.setterInterval = setInterval(this.setActive, REFRESH_TIME);
    }

    stop = () => {
        clearInterval(this.setterInterval);
    }

    setActive = () => {
        setTabActive();
    }
}

export class TabStatusListener extends AbstractTask {
    constructor(store) {
        super();
        this.store = store;
    }

    start = () => {
        this.listenerInterval = setInterval(this.refreshStatus, REFRESH_TIME);
    }

    stop = () => {
        clearInterval(this.listenerInterval);
    }

    refreshStatus = () => {
        const tabIds = Object.keys(this.store.getState().tabStatus || {});
        const tabIdsToRemove = refreshTabStatus(tabIds);
        tabIdsToRemove.forEach((tabId) => {
            this.store.dispatch(removeTabStatusAction({ tabId }));
        });
    }
}
