import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import ListView from '#rscv/List/ListView';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import Cloak from '#components/general/Cloak';

import { entryAccessor } from '#entities/editEntries';

import _cs from '#cs';

import LabelItem from './LabelItem';
import styles from './styles.scss';

const EntryGroupItem = (props) => {
    const {
        title,
        order,
        className: classNameFromProps,
        disabled,
        entryGroupServerId,
        entryGroupKey,
        labels,
        entries,
        tabularFields,
        selections,
        onMarkAsDelete,
        onSelectionSet,
        onSelectionClear,
    } = props;

    const className = _cs(
        styles.entryGroupItem,
        classNameFromProps,
    );

    const shouldHideEntryGroupDelete = useCallback(
        ({ entryPermissions }) => (
            !entryPermissions.delete && !!entryGroupServerId
        ),
        [entryGroupServerId],
    );

    const shouldHideEntryGroupEdit = useCallback(
        ({ entryPermissions }) => (
            !entryPermissions.modify && !!entryGroupServerId
        ),
        [entryGroupServerId],
    );

    const handleDelete = useCallback(
        () => {
            onMarkAsDelete({
                key: entryGroupKey,
                value: true,
            });
        },
        [onMarkAsDelete, entryGroupKey],
    );

    const labelKeySelector = useCallback(
        item => item.id,
        [],
    );

    const rendererParams = useCallback(
        (key, item) => {
            // TODO: change this to a mapping
            const selection = selections.find(e => e.labelId === key);

            const params = {
                title: item.title,
                color: item.color,
                labelId: key,
                selected: false,

                disabled,
                onSelectionSet,
                onSelectionClear,

                entryGroupKey,
            };

            if (!selection) {
                return params;
            }

            // TODO: change this to a mapping
            const entry = entries.find(
                e => entryAccessor.key(e) === selection.entryClientId,
            );

            if (!entry) {
                return params;
            }

            const entryData = entryAccessor.data(entry);
            const {
                entryType,
                image,
                excerpt,
                order: entryOrder,
                tabularField: tabularFieldId,
            } = entryData;
            const tabularField = tabularFields[tabularFieldId];

            return {
                ...params,
                selected: true,

                entryType,
                image,
                excerpt,
                order: entryOrder,
                tabularFieldId,
                tabularField,

                shouldHideEntryGroupEdit,
            };
        },
        [
            disabled, entries, entryGroupKey, tabularFields,
            selections, shouldHideEntryGroupEdit,
            onSelectionClear, onSelectionSet,
        ],
    );

    return (
        <div className={className}>
            <div className={styles.labelHeader}>
                <h3 className={styles.heading}>
                    {/* FIXME: use strings */}
                    {title || `Group ${order}`}
                </h3>
                <Cloak
                    hide={shouldHideEntryGroupEdit}
                    render={
                        <WarningButton
                            className={styles.button}
                            // FIXME: uses strings
                            title="Edit group"
                            iconName="edit"
                            disabled
                        />
                    }
                />
                <Cloak
                    hide={shouldHideEntryGroupDelete}
                    render={
                        <DangerButton
                            className={styles.button}
                            // FIXME: uses strings
                            title="Delete group"
                            iconName="delete"
                            disabled={disabled}
                            onClick={handleDelete}
                        />
                    }
                />
            </div>
            <ListView
                className={styles.labelContainer}
                data={labels}
                keySelector={labelKeySelector}
                rendererParams={rendererParams}
                renderer={LabelItem}
            />
        </div>
    );
};
EntryGroupItem.propTypes = {
    title: PropTypes.string,
    order: PropTypes.number.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    entryGroupServerId: PropTypes.number,
    entryGroupKey: PropTypes.string.isRequired,
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selections: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    onMarkAsDelete: PropTypes.func.isRequired,
    onSelectionSet: PropTypes.func.isRequired,
    onSelectionClear: PropTypes.func.isRequired,
};
EntryGroupItem.defaultProps = {
    selections: [],
    title: undefined,
    className: undefined,
    disabled: false,
    entryGroupServerId: undefined,
    labels: [],
    entries: [],
    tabularFields: {},
};

export default EntryGroupItem;
