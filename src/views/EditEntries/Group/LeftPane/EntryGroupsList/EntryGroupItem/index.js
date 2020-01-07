import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';

import Cloak from '#components/general/Cloak';

import _ts from '#ts';
import _cs from '#cs';

// TODO: this status icon can be reused
import EntryGroupStatusIcon from '../../../../StatusIcon';

import styles from './styles.scss';


const EntryGroupItem = (props) => {
    const {
        className: classNameFromProps,

        status,
        pending,
        isMarkedAsDeleted,

        entryGroupServerId,
        entryGroupKey,
        title,
        order,

        leadId,
        onMarkAsDelete,
    } = props;

    const className = _cs(
        classNameFromProps,
        styles.entryGroupsListItem,
    );

    const handleDelete = useCallback(
        () => {
            onMarkAsDelete({
                leadId,
                key: entryGroupKey,
                value: true,
            });
        },
        [onMarkAsDelete, entryGroupKey, leadId],
    );

    const handleUndoDelete = useCallback(
        () => {
            onMarkAsDelete({
                leadId,
                key: entryGroupKey,
                value: false,
            });
        },
        [onMarkAsDelete, entryGroupKey, leadId],
    );

    const shouldHideEntryDelete = useCallback(
        ({ entryPermissions }) => (
            !entryPermissions.delete && entryGroupServerId
        ),
        [entryGroupServerId],
    );

    return (
        <div className={className}>
            <div
                className={styles.addEntryGroupListItem}
                type="button"
            >
                {/* FIXME: use strings */}
                {title || `Group ${order}`}
                <div className={styles.statusIcons}>
                    <EntryGroupStatusIcon
                        status={status}
                        isMarkedAsDeleted={isMarkedAsDeleted}
                    />
                </div>
            </div>
            {
                isMarkedAsDeleted ? (
                    <Button
                        className={styles.removeButton}
                        onClick={handleUndoDelete}
                        iconName="undo"
                        title={_ts('editEntry.group.leftpane.entryGroupList', 'removeEntryGroupButtonTitle')}
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
                                title={_ts('editEntry.group.leftpane.entryGroupList', 'undoRemoveEntryGroupButtonTitle')}
                                disabled={pending}
                            />
                        }
                    />
                )
            }
        </div>
    );
};
EntryGroupItem.propTypes = {
    className: PropTypes.string,
    status: PropTypes.string.isRequired,
    pending: PropTypes.bool,
    isMarkedAsDeleted: PropTypes.bool,

    entryGroupServerId: PropTypes.number,
    entryGroupKey: PropTypes.string.isRequired,
    order: PropTypes.number.isRequired,

    leadId: PropTypes.number.isRequired,
    onMarkAsDelete: PropTypes.func.isRequired,
    title: PropTypes.string,
};
EntryGroupItem.defaultProps = {
    className: undefined,
    pending: false,
    isMarkedAsDeleted: false,
    entryGroupServerId: undefined,
    title: undefined,
};

export default EntryGroupItem;
