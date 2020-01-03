import PropTypes from 'prop-types';
import React from 'react';

import _ts from '#ts';

import styles from './styles.scss';

const EntryPreview = (props) => {
    const {
        entryType,

        image,

        excerpt,
        order,

        tabularField,
        tabularFieldId,
    } = props;

    switch (entryType) {
        case 'image': {
            return (
                <img
                    className={styles.image}
                    src={image}
                    alt={_ts('editEntry.overview.leftpane.entryList', 'altLabel')}
                />
            );
        }
        case 'dataSeries': {
            const tabularTitle = (tabularField && tabularField.title)
                || _ts('editEntry.overview.leftpane.entryList', 'unnamedColumnTitle', { id: tabularFieldId });
            return (
                <div className={styles.entryExcerpt}>
                    {tabularTitle}
                </div>
            );
        }
        default: {
            const excerptTitle = excerpt
                || _ts('editEntry.overview.leftpane.entryList', 'unnamedExcerptTitle', { index: order });
            return (
                <div className={styles.entryExcerpt}>
                    {excerptTitle}
                </div>
            );
        }
    }
};
EntryPreview.propTypes = {
    entryType: PropTypes.string.isRequired,
    image: PropTypes.string,
    excerpt: PropTypes.string,
    order: PropTypes.number.isRequired,
    tabularFieldId: PropTypes.number,
    tabularField: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
EntryPreview.defaultProps = {
    image: undefined,
    excerpt: undefined,
    tabularFieldId: undefined,
    tabularField: undefined,
};

export default EntryPreview;
