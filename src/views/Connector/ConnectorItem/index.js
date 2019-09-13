import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import { pathNames } from '#constants';

import styles from './styles.scss';

const ConnectorListItem = ({
    className,
    title,
    connectorId,
    currentConnectorId,
}) => (
    <Link
        to={reverseRoute(pathNames.connectors, { connectorId })}
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
    </Link>
);

ConnectorListItem.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    connectorId: PropTypes.number,
    currentConnectorId: PropTypes.number,
};

ConnectorListItem.defaultProps = {
    className: '',
    title: '',
    connectorId: undefined,
    currentConnectorId: undefined,
};

export default ConnectorListItem;
