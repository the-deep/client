import AbstractTask from '#utils/AbstractTask';

import { removeTabStatusAction, getDefaultTabId } from '../../reducers/tabStatus';

const REFRESH_TIME = 1000;

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
            console.warn('removing', tabId, 'no value so removing');
            tabIdsToRemove.push(tabId);
            return;
        }

        const lastActiveTime = +value;
        if (Date.now() - lastActiveTime > REFRESH_TIME) {
            console.warn('removing', tabId, Date.now() - lastActiveTime, lastActiveTime);
            tabIdsToRemove.push(tabId);
            localStorage.removeItem(key);
        }
    });
    return tabIdsToRemove;
};

export class TabStatusSetter extends AbstractTask {
    constructor(props) {
        super(props);
        this.lastTime = 0;
    }

    start = () => {
        this.setActive();
        this.setterInterval = setInterval(this.setActive, REFRESH_TIME / 4);
    }

    stop = () => {
        clearInterval(this.setterInterval);
    }

    setActive = () => {
        const now = Date.now();
        console.warn('Setting', now - this.lastTime);
        this.lastTime = now;
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
        // TODO: Use single dispatch
        tabIdsToRemove.forEach((tabId) => {
            this.store.dispatch(removeTabStatusAction({ tabId }));
        });
    }
}
