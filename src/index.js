import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';
import { setMapboxToken } from '@togglecorp/re-map';

import Root from './Root';

setMapboxToken(process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);

ReactDOM.render(<Root />, document.getElementById('root'));

const originalConsoleError = console.error;
console.error = function consoleError(message, error, ...otherParams) {
    Raven.captureException(error);
    originalConsoleError.apply(this, [message, error, ...otherParams]);
};
