import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import Spinner from '#rsu/../v2/View/Spinner';

import { ENTRY_STATUS } from '#entities/editEntries';
import _cs from '#cs';

import styles from './styles.scss';

const iconMap = {
    // [ENTRY_STATUS.requesting]: 'loading',
    [ENTRY_STATUS.localError]: 'error',
    [ENTRY_STATUS.serverError]: 'error',
    [ENTRY_STATUS.nonPristine]: 'codeWorking',
    [ENTRY_STATUS.complete]: 'checkCircle',
    markedAsDeleted: 'removeCircle',
};
const styleMap = {
    [ENTRY_STATUS.requesting]: styles.pending,
    [ENTRY_STATUS.localError]: styles.error,
    [ENTRY_STATUS.serverError]: styles.error,
    [ENTRY_STATUS.nonPristine]: styles.pristine,
    [ENTRY_STATUS.complete]: styles.complete,
    markedAsDeleted: styles.warning,
};
const EntryStatusIcon = (props) => {
    const {
        status,
        isMarkedAsDeleted,
        className,
    } = props;

    if (status === ENTRY_STATUS.requesting) {
        return (
            <Spinner
                className={_cs(styleMap[status], className)}
                small
            />
        );
    }

    const realStatus = isMarkedAsDeleted
        ? 'markedAsDeleted'
        : status;

    return (
        <Icon
            className={_cs(styleMap[realStatus], className)}
            name={iconMap[realStatus]}
        />
    );
};
EntryStatusIcon.propTypes = {
    status: PropTypes.string.isRequired,
    isMarkedAsDeleted: PropTypes.bool,
    className: PropTypes.string,
};
EntryStatusIcon.defaultProps = {
    className: undefined,
    isMarkedAsDeleted: false,
};

export default EntryStatusIcon;
