import React from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { BrowserRouter } from 'react-router-dom';

import { RequestContext } from '#utils/request';
import styleProperties from '#constants/styleProperties';
import { startActionsSync } from '#rsu/redux-sync';
import getUserConfirmation from '#utils/getUserConfirmation';
import { addIcon } from '#rscg/Icon';
import {
    processDeepUrls,
    processDeepOptions,
    processDeepResponse,
    processDeepError,
} from '#utils/request/deep';
import {
    iconNames,
    svgPaths,
    imagePaths,
} from '#constants';
import { initializeStyles } from '#rsu/styles';

import store from '#store';

import App from './App';

// Add icons
Object.keys(iconNames).forEach((key) => {
    addIcon('font', key, iconNames[key]);
});

Object.keys(svgPaths).forEach((key) => {
    addIcon('svg', key, svgPaths[key]);
});

Object.keys(imagePaths).forEach((key) => {
    addIcon('image', key, imagePaths[key]);
});

export default class Root extends React.Component {
    constructor(props) {
        super(props);

        this.state = { rehydrated: false };
        this.store = store;

        initializeStyles({
            ...styleProperties.colors,
            ...styleProperties.dimens,
        });
        console.info('React version:', React.version);
    }

    componentWillMount() {
        const afterRehydrateCallback = () => this.setState({ rehydrated: true });
        // NOTE: We can also use PersistGate instead of callback to wait for rehydration
        persistStore(this.store, undefined, afterRehydrateCallback);
        startActionsSync(this.store);
    }

    render() {
        if (!this.state.rehydrated) {
            // NOTE: showing empty div, this lasts for a fraction of a second
            return <div />;
        }

        const requestContextValue = {
            transformUrl: processDeepUrls,
            transformOptions: processDeepOptions,
            transformResponse: processDeepResponse,
            transformError: processDeepError,
        };

        return (
            <Provider store={this.store}>
                <BrowserRouter getUserConfirmation={getUserConfirmation}>
                    <RequestContext.Provider value={requestContextValue}>
                        <App />
                    </RequestContext.Provider>
                </BrowserRouter>
            </Provider>
        );
    }
}
