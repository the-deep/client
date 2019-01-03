import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import _ts from '#ts';

import ErrorMessage from './ErrorMessage';

const WidgetError = ({ ...props }) => (
    <ErrorMessage
        {...props}
        errorText={_ts('components.widgetError', 'problemText')}
        reportButtonText={_ts('components.widgetError', 'reportErrorTitle')}
    />
);

export default hoistNonReactStatics(WidgetError, ErrorMessage);
