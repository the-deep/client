import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';

import Cloak from '#components/general/Cloak';

import _ts from '#ts';
import _cs from '#cs';

import EntryPreview from '../../../../EntryPreview';
import EntryStatusIcon from '../../../../StatusIcon';
import styles from './styles.scss';

const EntryItem = (props) => {
    const {
        className: classNameFromProps,

        isActive,
        status,
        pending,
        isMarkedAsDeleted,

        entryServerId,
        entryKey,
        entryType,
        image,
        imageRaw,
        imageDetails,
        excerpt,
        order,
        tabularField,
        tabularFieldId,

        leadId,
        onSelect,
        onMarkAsDelete,
    } = props;

    const className = _cs(
        classNameFromProps,
        styles.entriesListItem,
        isActive && styles.active,
    );

    const handleClick = useCallback(
        () => {
            onSelect({
                leadId,
                key: entryKey,
            });
        },
        [onSelect, leadId, entryKey],
    );

    const handleDelete = useCallback(
        () => {
            onMarkAsDelete({
                leadId,
                key: entryKey,
                value: true,
            });
        },
        [onMarkAsDelete, entryKey, leadId],
    );

    const handleUndoDelete = useCallback(
        () => {
            onMarkAsDelete({
                leadId,
                key: entryKey,
                value: false,
            });
        },
        [onMarkAsDelete, entryKey, leadId],
    );

    const shouldHideEntryDelete = useCallback(
        ({ entryPermissions }) => (
            !entryPermissions.delete && entryServerId
        ),
        [entryServerId],
    );

    return (
        <div className={className}>
            <button
                className={styles.addEntryListItem}
                onClick={handleClick}
                disabled={isMarkedAsDeleted}
                type="button"
            >
                <EntryPreview
                    entryType={entryType}
                    image={image}
                    imageRaw={imageRaw}
                    imageDetails={imageDetails}
                    excerpt={excerpt}
                    order={order}
                    tabularFieldId={tabularFieldId}
                    tabularField={tabularField}
                    disabled={isMarkedAsDeleted}
                />
                <div className={styles.statusIcons}>
                    <EntryStatusIcon
                        status={status}
                        isMarkedAsDeleted={isMarkedAsDeleted}
                    />
                </div>
            </button>
            {
                isMarkedAsDeleted ? (
                    <Button
                        className={styles.removeButton}
                        onClick={handleUndoDelete}
                        iconName="undo"
                        title={_ts('editEntry.overview.leftpane.entryList', 'removeEntryButtonTitle')}
                        disabled={pending}
                    />
                ) : (
                    <Cloak
                        hide={shouldHideEntryDelete}
                        render={
                            <DangerButton
                                className={styles.removeButton}
                                onClick={handleDelete}
                                iconName="delete"
                                title={_ts('editEntry.overview.leftpane.entryList', 'undoRemoveEntryButtonTitle')}
                                disabled={pending}
                            />
                        }
                    />
                )
            }
        </div>
    );
};
EntryItem.propTypes = {
    className: PropTypes.string,
    isActive: PropTypes.bool,
    status: PropTypes.string.isRequired,
    pending: PropTypes.bool,
    isMarkedAsDeleted: PropTypes.bool,

    entryServerId: PropTypes.number,
    entryKey: PropTypes.string.isRequired,
    entryType: PropTypes.string.isRequired,
    image: PropTypes.number,
    imageRaw: PropTypes.string,
    imageDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    excerpt: PropTypes.string,
    order: PropTypes.number.isRequired,
    tabularField: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularFieldId: PropTypes.number,

    leadId: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
    onMarkAsDelete: PropTypes.func.isRequired,
};
EntryItem.defaultProps = {
    className: undefined,
    isActive: false,
    pending: false,
    isMarkedAsDeleted: false,
    entryServerId: undefined,
    image: undefined,
    imageRaw: undefined,
    imageDetails: undefined,
    excerpt: undefined,
    tabularFieldId: undefined,
    tabularField: undefined,
};

export default EntryItem;
