import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import ListView from '#rscv/List/ListView';

import { entryAccessor, ENTRY_STATUS } from '#entities/editEntries';
import Cloak from '#components/general/Cloak';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
    className: PropTypes.string,
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    selectedEntryKey: undefined,
    statuses: {},
    className: '',
    tabularFields: {},
};

export default class EntriesList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static iconMap = {
        [ENTRY_STATUS.requesting]: 'loading',
        [ENTRY_STATUS.localError]: 'error',
        [ENTRY_STATUS.serverError]: 'error',
        [ENTRY_STATUS.nonPristine]: 'codeWorking',
        [ENTRY_STATUS.complete]: 'checkCircle',
        markedAsDeleted: 'removeCircle',
    };

    static styleMap = {
        [ENTRY_STATUS.requesting]: styles.pending,
        [ENTRY_STATUS.localError]: styles.error,
        [ENTRY_STATUS.serverError]: styles.error,
        [ENTRY_STATUS.nonPristine]: styles.pristine,
        [ENTRY_STATUS.complete]: styles.complete,
        markedAsDeleted: styles.warning,
    }

    static calcEntryKey = entry => entryAccessor.key(entry)

    static shouldHideEntryDelete = entry => ({ entryPermissions }) => (
        !entryPermissions.delete && entryAccessor.serverId(entry)
    )

    renderEntryLabel = (entry) => {
        const values = entryAccessor.data(entry);
        const {
            entryType,
            excerpt,
            order,
            image,
            tabularField,
        } = values;

        if (entryType === 'image') {
            return (
                <img
                    className={styles.image}
                    src={image}
                    alt={_ts('editEntry.overview.leftpane.entryList', 'altLabel')}
                />
            );
        }

        if (entryType === 'dataSeries') {
            const { tabularFields } = this.props;
            const fieldId = entryAccessor.tabularField(entry);

            const field = this.props.tabularFields[fieldId];
            // FIXME: use strings
            const tabularTitle = (field && field.title) || `Column ${fieldId}`;

            return (
                <div className={styles.entryExcerpt}>
                    {/* FIXME: get title */}
                    {tabularTitle}
                </div>
            );
        }

        const excerptTitle = excerpt || _ts('editEntry.overview.leftpane.entryList', 'unnamedExcerptTitle', { index: order });
        return (
            <div className={styles.entryExcerpt}>
                {excerptTitle}
            </div>
        );
    }

    renderEntryItem = (key, entry) => {
        const {
            selectedEntryKey,
            statuses,
        } = this.props;

        const handleEntryItemClick = (currentEntryKey) => {
            this.props.setSelectedEntryKey({ leadId: this.props.leadId, key: currentEntryKey });
        };
        const handleMarkAsDeletedEntry = (currentEntryKey, value) => {
            this.props.markAsDeletedEntry({
                leadId: this.props.leadId,
                key: currentEntryKey,
                value,
            });
        };

        const currentEntryKey = EntriesList.calcEntryKey(entry);
        const isActive = currentEntryKey === selectedEntryKey;
        const isMarkedAsDeleted = entryAccessor.isMarkedAsDeleted(entry);


        const className = _cs(
            styles.entriesListItem,
            isActive && styles.active,
            // isMarkedAsDeleted && styles.markedForDelete,
        );

        const status = statuses[currentEntryKey];
        const realStatus = isMarkedAsDeleted ? 'markedAsDeleted' : status;

        const pending = (status === ENTRY_STATUS.requesting);

        return (
            <div
                className={className}
                key={key}
            >
                <button
                    className={styles.addEntryListItem}
                    onClick={() => handleEntryItemClick(currentEntryKey)}
                    disabled={isMarkedAsDeleted}
                    type="button"
                >
                    {this.renderEntryLabel(entry)}
                    <div className={styles.statusIcons}>
                        <Icon
                            name={EntriesList.iconMap[realStatus]}
                            className={EntriesList.styleMap[realStatus]}
                        />
                    </div>
                </button>
                {
                    isMarkedAsDeleted ? (
                        <Button
                            className={styles.removeButton}
                            onClick={() => handleMarkAsDeletedEntry(currentEntryKey, false)}
                            iconName="undo"
                            title={_ts('editEntry.overview.leftpane.entryList', 'removeEntryButtonTitle')}
                            disabled={pending}
                        />
                    ) : (
                        <Cloak
                            hide={EntriesList.shouldHideEntryDelete(entry)}
                            render={
                                <DangerButton
                                    className={styles.removeButton}
                                    onClick={() => handleMarkAsDeletedEntry(currentEntryKey, true)}
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
    }

    render() {
        const { className } = this.props;
        return (
            <ListView
                className={_cs(styles.entriesList, className)}
                modifier={this.renderEntryItem}
                data={this.props.entries}
                keySelector={EntriesList.calcEntryKey}
            />
        );
    }
}
