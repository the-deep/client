import PropTypes from 'prop-types';
import React from 'react';

import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const EntryPreview = (props) => {
    const {
        className,

        entryType,

        imageRaw,
        imageDetails,

        excerpt,
        order,

        tabularField,
        tabularFieldId,
    } = props;

    switch (entryType) {
        case 'image': {
            return (
                <img
                    className={_cs(className, styles.image)}
                    src={imageDetails?.file ?? imageRaw}
                    alt={_ts('editEntry.overview.leftpane.entryList', 'altLabel')}
                />
            );
        }
        case 'dataSeries': {
            const tabularTitle = (tabularField && tabularField.title)
                || _ts('editEntry.overview.leftpane.entryList', 'unnamedColumnTitle', { index: tabularFieldId });
            return (
                <div className={_cs(styles.entryExcerpt, className)}>
                    {tabularTitle}
                </div>
            );
        }
        default: {
            const excerptTitle = excerpt
                || _ts('editEntry.overview.leftpane.entryList', 'unnamedExcerptTitle', { index: order });
            return (
                <div className={_cs(styles.entryExcerpt, className)}>
                    {excerptTitle}
                </div>
            );
        }
    }
};
EntryPreview.propTypes = {
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    order: PropTypes.number,
    tabularFieldId: PropTypes.number,
    tabularField: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};
EntryPreview.defaultProps = {
    excerpt: undefined,
    tabularFieldId: undefined,
    tabularField: undefined,
    className: undefined,
    entryType: undefined,
    order: undefined,
};

export default EntryPreview;
