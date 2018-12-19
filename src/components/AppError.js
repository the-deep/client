import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import hoistNonReactStatics from 'hoist-non-react-statics';
import _ts from '#ts';

import {
    authenticatedSelector,
} from '#redux';

import ErrorMessage from './ErrorMessage';

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    authenticated: authenticatedSelector(state),
});


@connect(mapStateToProps)
class AppError extends React.Component {
    static propTypes = propTypes;

    render() {
        const { authenticated, ...otherProps } = this.props;
        return (
            <ErrorMessage
                {...otherProps}
                errorText={
                    authenticated
                        ? _ts('components.appError', 'problemText')
                        : _ts('components.appError', 'noAuthProblemText')
                }
                reportButtonText={_ts('components.appError', 'reportErrorTitle')}
            />
        );
    }
}

export default hoistNonReactStatics(AppError, ErrorMessage);
