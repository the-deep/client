import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import _ts from '#ts';

import ErrorMessage from './ErrorMessage';

const VizError = ({ ...props }) => (
    <ErrorMessage
        {...props}
        errorText={_ts('components.vizError', 'problemText')}
        reportButtonText={_ts('components.vizError', 'reportErrorTitle')}
    />
);

export default hoistNonReactStatics(VizError, ErrorMessage);
