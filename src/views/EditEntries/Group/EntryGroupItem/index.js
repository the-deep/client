import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import modalize from '#rscg/Modalize';

import Cloak from '#components/general/Cloak';
import EntryGroupEditModal from '#components/general/EntryGroupEditModal';

import { entryAccessor } from '#entities/editEntries';

import _ts from '#ts';

import LabelItem from './LabelItem';
import styles from './styles.scss';

const WarningModalButton = modalize(WarningButton);

const EntryGroupItem = (props) => {
    const {
        title,
        order,
        className: classNameFromProps,
        pending,
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

                disabled: pending,
                onSelectionSet,
                onSelectionClear,

                entryGroupKey,
                entryGroupServerId,
            };

            const selection = selectionMap[key];
            if (!selection) {
                return params;
            }

            const entry = entryMap[selection.entryClientId];
            if (!entry) {
                return params;
            }

            const entryKey = entryAccessor.key(entry);
            const entryData = entryAccessor.data(entry);
            const imageDetails = entryAccessor.imageDetails(entry);

            const {
                entryType,
                imageRaw,
                excerpt,
                order: entryOrder,
                tabularField: tabularFieldId,
            } = entryData;
            const tabularField = tabularFields[tabularFieldId];

            return {
                ...params,
                selected: true,

                entryKey,
                entryType,
                imageDetails,
                imageRaw,
                excerpt,
                order: entryOrder,
                tabularFieldId,
                tabularField,
            };
        },
        [
            pending, entryMap, tabularFields,
            entryGroupKey, entryGroupServerId, selectionMap,
            onSelectionClear, onSelectionSet,
        ],
    );

    const groupTitle = title || _ts('editEntry.group', 'defaultGroupTitle', { order });

    return (
        <div className={className}>
            {pending && (
                <LoadingAnimation />
            )}
            <div className={styles.labelHeader}>
                <h3 className={styles.heading}>
                    {groupTitle}
                </h3>
                <Cloak
                    hide={shouldHideEntryGroupEdit}
                    render={
                        <WarningModalButton
                            className={styles.button}
                            title={_ts('editEntry.group', 'editEntryGroupButtonTitle')}
                            iconName="edit"
                            disabled={pending}
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
                            title={_ts('editEntry.group', 'deleteEntryGroupButtonTitle')}
                            iconName="delete"
                            disabled={pending}
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
    pending: PropTypes.bool,
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
    pending: false,
    entryGroupServerId: undefined,
    labels: [],
    entries: [],
    tabularFields: {},
};

export default EntryGroupItem;
