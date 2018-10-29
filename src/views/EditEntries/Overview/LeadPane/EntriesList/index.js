import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import ListView from '#rscv/List/ListView';

import { entryAccessor, ENTRY_STATUS } from '#entities/editEntries';
import Cloak from '#components/Cloak';
import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryKey: undefined,
    statuses: {},
};

export default class EntriesList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static iconMap = {
        [ENTRY_STATUS.requesting]: `${iconNames.loading} ${styles.pending}`,
        [ENTRY_STATUS.localError]: `${iconNames.error} ${styles.error}`,
        [ENTRY_STATUS.serverError]: `${iconNames.error} ${styles.error}`,
        [ENTRY_STATUS.nonPristine]: `${iconNames.codeWorking} ${styles.pristine}`,
        [ENTRY_STATUS.complete]: `${iconNames.checkCircle} ${styles.complete}`,
        markedForRemoval: `${iconNames.removeCircle} ${styles.warning}`,
    };

    static calcEntryKey = entry => entryAccessor.key(entry)

    static shouldHideEntryDelete = entry => ({ entryPermissions }) => (
        !entryPermissions.includes('delete') && entryAccessor.serverId(entry)
    )

    renderEntryLabel = (entry) => {
        const values = entryAccessor.data(entry);
        const {
            entryType,
            excerpt,
            order,
            image,
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

        const status = statuses[currentEntryKey];

        const classNames = [
            styles.entriesListItem,
        ];
        if (isActive) {
            classNames.push(styles.active);
        }
        if (isMarkedAsDeleted) {
            classNames.push(styles.markedForDelete);
        }

        const pending = status === ENTRY_STATUS.requesting;

        return (
            <div
                className={classNames.join(' ')}
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
                        { isMarkedAsDeleted &&
                            <span className={EntriesList.iconMap.markedForRemoval} />
                        }
                        <span className={EntriesList.iconMap[status] || ''} />
                    </div>
                </button>
                {
                    isMarkedAsDeleted ? (
                        <Button
                            className={styles.removeButton}
                            onClick={() => handleMarkAsDeletedEntry(currentEntryKey, false)}
                            iconName={iconNames.undo}
                            title={_ts('editEntry.overview.leftpane.entryList', 'removeEntryButtonTitle')}
                            disabled={pending}
                        />
                    ) : (
                        <Cloak
                            hide={EntriesList.shouldHideEntryDelete(entry)}
                            render={() => (
                                <DangerButton
                                    className={styles.removeButton}
                                    onClick={() => handleMarkAsDeletedEntry(currentEntryKey, true)}
                                    iconName={iconNames.delete}
                                    title={_ts('editEntry.overview.leftpane.entryList', 'undoRemoveEntryButtonTitle')}
                                    disabled={pending}
                                />
                            )}
                        />
                    )
                }
            </div>
        );
    }

    render() {
        return (
            <ListView
                className={styles.entriesList}
                modifier={this.renderEntryItem}
                data={this.props.entries}
                keySelector={EntriesList.calcEntryKey}
            />
        );
    }
}
