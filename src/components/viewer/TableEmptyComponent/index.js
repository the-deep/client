import PropTypes from 'prop-types';
import React from 'react';

import Message from '#rscv/Message';

import noSearch from '#resources/img/no-search.png';
import noFilter from '#resources/img/no-filter.png';

import styles from './styles.scss';

const TableEmptyComponent = ({ emptyText, filteredEmptyText }) => ({
    // className,
    isFiltered,
}) => {
    if (isFiltered) {
        return (
            <Message
                className={styles.emptyFilterMessage}
            >
                <img
                    className={styles.image}
                    src={noFilter}
                    alt=""
                />
                <span>{filteredEmptyText}</span>
            </Message>
        );
    }

    return (
        <Message
            className={styles.emptyMessage}
        >
            <img
                className={styles.image}
                src={noSearch}
                alt=""
            />
            <span>{emptyText}</span>
        </Message>
    );
};

TableEmptyComponent.propTypes = {
    className: PropTypes.string,
    isFiltered: PropTypes.bool,
};

TableEmptyComponent.defaulProps = {
    className: undefined,
    isFiltered: false,
};

export default TableEmptyComponent;
