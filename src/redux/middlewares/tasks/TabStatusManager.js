import AbstractTask from '#utils/AbstractTask';

import {
    setTabTimeAction,
    removeTabStatusAction,
} from '../../reducers/tabStatus';

const REFRESH_TIME = 1000;
const PRECISION = 4;

// NOTE: REFRESH_TIME / PRECISION must be natural number

export default class TabStatusManager extends AbstractTask {
    constructor(store) {
        super();
        this.store = store;
        this.lastTime = undefined;
        this.counter = 0;
    }

    start = () => {
        this.clearInactiveTabs();
        this.listenerIntervalAnother = setInterval(this.handleInterval, REFRESH_TIME / PRECISION);
    }

    stop = () => {
        clearInterval(this.listenerIntervalAnother);
    }

    handleInterval = () => {
        if (this.counter + 1 === PRECISION / 2) {
            this.setTabs();
        } else if (this.counter + 1 === PRECISION) {
            this.clearInactiveTabs();
        }
        this.counter = (this.counter + 1) % PRECISION;
    }

    setTabs = () => {
        this.store.dispatch(setTabTimeAction());
    }

    clearInactiveTabs = () => {
        const tabStatus = this.store.getState().tabStatus || {};
        const tabIds = Object.keys(tabStatus);
        const tabIdsToRemove = tabIds.filter(tabId => !tabStatus[tabId].fresh);
        /*
        tabIds.forEach((tabId) => {
            const lastActiveTime = tabStatus[tabId].time;
            const diff = now - (+lastActiveTime);
            if (tabIdsToRemove.includes(tabId)) {
                console.warn(`Removing ${tabId}: ${diff}`);
            } else {
                console.warn(`Preserving ${tabId}: {diff}`);
            }
        });
        */
        this.store.dispatch(removeTabStatusAction({ tabIds: tabIdsToRemove }));
    }
}
