import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onFilterApply: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};
function ConnectorLeadsFilter(props) {
    const {
        className,
        onFilterApply,
    } = props;

    return (
        <div className={_cs(styles.filter, className)}>
            Filters go here
        </div>
    );
}

ConnectorLeadsFilter.propTypes = propTypes;
ConnectorLeadsFilter.defaultProps = defaultProps;

export default ConnectorLeadsFilter;
