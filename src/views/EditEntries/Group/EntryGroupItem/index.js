import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import { listToMap } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import modalize from '#rscg/Modalize';

import Cloak from '#components/general/Cloak';

import { entryAccessor } from '#entities/editEntries';

import _cs from '#cs';

import EntryGroupEditModal from './EntryGroupEditModal';
import LabelItem from './LabelItem';
import styles from './styles.scss';

const WarningModalButton = modalize(WarningButton);

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
        onEntryGroupDataSet,
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

    const handleEntryGroupDataSet = useCallback(
        (data) => {
            onEntryGroupDataSet({
                entryGroupKey,
                data,
            });
        },
        [onEntryGroupDataSet, entryGroupKey],
    );

    const labelKeySelector = useCallback(
        item => item.id,
        [],
    );

    const selectionMap = useMemo(
        () => listToMap(
            selections,
            selection => selection.labelId,
            selection => selection,
        ),
        [selections],
    );
    // NOTE: entryMap can be moved outside
    const entryMap = useMemo(
        () => listToMap(
            entries,
            entryAccessor.key,
            entry => entry,
        ),
        [entries],
    );

    const rendererParams = useCallback(
        (key, item) => {
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

            const selection = selectionMap[key];
            if (!selection) {
                return params;
            }

            const entry = entryMap[selection.entryClientId];
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

                entryGroupServerId,
            };
        },
        [
            disabled, entryMap, tabularFields,
            entryGroupKey, entryGroupServerId, selectionMap,
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
                        <WarningModalButton
                            className={styles.button}
                            // FIXME: uses strings
                            title="Edit group"
                            iconName="edit"
                            disabled={disabled}
                            modal={
                                <EntryGroupEditModal
                                    title={title}
                                    onSave={handleEntryGroupDataSet}
                                />
                            }
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
    onEntryGroupDataSet: PropTypes.func.isRequired,
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
