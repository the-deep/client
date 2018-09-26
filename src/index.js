import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';

import Root from './Root';

ReactDOM.render(<Root />, document.getElementById('root'));

const originalConsoleError = console.error;
console.error = function consoleError(message, error, ...otherParams) {
    Raven.captureException(error);
    originalConsoleError.apply(this, [message, error, ...otherParams]);
};
