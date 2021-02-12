import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import _cs from '#cs';

import EntryPreview from '../../../../EntryPreview';
import styles from './styles.scss';

const EntryItem = (props) => {
    const {
        className: classNameFromProps,

        entryKey,
        entryId,
        entryType,
        imageRaw,
        imageDetails,
        excerpt,
        order,
        tabularField,
        tabularFieldId,
    } = props;

    const className = _cs(
        classNameFromProps,
        styles.entriesListItem,
    );

    const handleDragStart = useCallback(
        (e) => {
            const data = JSON.stringify({
                entryKey,
                entryId,
            });
            e.dataTransfer.setData('text/plain', data);
            e.dataTransfer.dropEffect = 'copy';
        },
        [entryKey, entryId],
    );

    return (
        <div className={className}>
            <div
                className={styles.addEntryListItem}
                onDragStart={handleDragStart}
                draggable
            >
                <EntryPreview
                    entryType={entryType}
                    imageRaw={imageRaw}
                    imageDetails={imageDetails}
                    excerpt={excerpt}
                    order={order}
                    tabularFieldId={tabularFieldId}
                    tabularField={tabularField}
                />
            </div>
        </div>
    );
};
EntryItem.propTypes = {
    className: PropTypes.string,

    entryType: PropTypes.string.isRequired,
    imageRaw: PropTypes.string,
    imageDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    excerpt: PropTypes.string,
    order: PropTypes.number.isRequired,
    tabularField: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularFieldId: PropTypes.number,

    entryKey: PropTypes.string.isRequired,
    entryId: PropTypes.number,
};
EntryItem.defaultProps = {
    className: undefined,
    imageRaw: undefined,
    imageDetails: undefined,
    excerpt: undefined,
    tabularFieldId: undefined,
    tabularField: undefined,
    entryId: undefined,
};

export default EntryItem;
