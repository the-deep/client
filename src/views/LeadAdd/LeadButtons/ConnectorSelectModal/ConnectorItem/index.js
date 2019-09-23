import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    connectorId: PropTypes.number,
    currentConnectorId: PropTypes.number,
    onConnectorClick: PropTypes.func,
};

const defaultProps = {
    className: '',
    title: '',
    connectorId: undefined,
    currentConnectorId: undefined,
    onConnectorClick: undefined,
};

export default class ConnectorListItem extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    handleConnectorClick = () => {
        const {
            onConnectorClick,
            connectorId,
        } = this.props;

        if (onConnectorClick) {
            onConnectorClick(connectorId);
        }
    }

    render() {
        const {
            className,
            title,
            connectorId,
            currentConnectorId,
        } = this.props;

        return (
            <button
                onClick={this.handleConnectorClick}
                type="button"
                className={
                    _cs(
                        className,
                        styles.listItem,
                        'connector-list-item',
                        currentConnectorId === connectorId && styles.active,
                    )
                }
            >
                {title}
            </button>
        );
    }
}
