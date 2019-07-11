import PropTypes from 'prop-types';
import React from 'react';

import {
    RequestClient,
    requestMethods,
} from '#request';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    frameworkId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    frameworkId: undefined,
};

const requests = {
};

@RequestClient(requests)
export default class FrameworkUsersTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div>
                Table
            </div>
        );
    }
}
