import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import _ts from '#ts';

import ErrorMessage from './ErrorMessage';

const ComponentError = ({ ...props }) => (
    <ErrorMessage
        {...props}
        errorText={_ts('components.componentError', 'problemText')}
        reportButtonText={_ts('components.componentError', 'reportErrorTitle')}
    />
);

export default hoistNonReactStatics(ComponentError, ErrorMessage);
