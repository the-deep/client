import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rs/components/Action/Button';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import ListView from '#rs/components/View/List/ListView';

import { entryAccessor, ENTRY_STATUS } from '#entities/editEntries';
import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryKey: undefined,
};

export default class EntriesListing extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static iconMap = {
        [ENTRY_STATUS.requesting]: `${iconNames.loading} ${styles.pending}`,
        [ENTRY_STATUS.invalid]: `${iconNames.error} ${styles.error}`,
        [ENTRY_STATUS.nonPristine]: `${iconNames.codeWorking} ${styles.pristine}`,
        [ENTRY_STATUS.complete]: `${iconNames.checkCircle} ${styles.complete}`,
        markedForRemoval: `${iconNames.removeCircle} ${styles.error}`,
    };

    static calcEntryKey = entry => entryAccessor.key(entry);

    renderIcon = (status) => {
        const className = EntriesListing.iconMap[status] || '';
        return <span className={className} />;
    }

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
                    alt={_ts('editEntry', 'altLabel')}
                />
            );
        }
        // FIXME: use strings
        return (
            <div className={styles.entryExcerpt}>
                {excerpt || `Excerpt ${order}`}
            </div>
        );
    }

    renderEntryItem = (key, entry) => {
        const {
            selectedEntryKey,
            // entries,
            // choices,
        } = this.props;

        const handleEntryItemClick = (currentEntryId) => {
            this.props.setSelectedEntryKey({ leadId: this.props.leadId, key: currentEntryId });
        };
        const handleMarkAsDeletedEntry = (currentEntryId, value) => {
            this.props.markAsDeletedEntry({
                leadId: this.props.leadId,
                key: currentEntryId,
                value,
            });
        };

        const currentEntryId = EntriesListing.calcEntryKey(entry);
        const isActive = currentEntryId === selectedEntryKey;
        /*
        const status = choices[key].choice;
        */
        /*
        const selectedEntry = entries.find(
            e => entryAccessor.key(e) === currentEntryId,
        );
        */
        const isMarkedAsDeleted = entryAccessor.isMarkedAsDeleted(entry);

        // const isSelectedEntryMarkedForDelete = false;
        // const isSelectedEntryMarkedForDelete = entryAccessor.isMarkedAsDeleted(entry);

        const classNames = [
            styles.entriesListItem,
        ];
        if (isActive) {
            classNames.push(styles.active);
        }
        if (isMarkedAsDeleted) {
            classNames.push(styles.markedForDelete);
        }
        return (
            <div
                className={classNames.join(' ')}
                key={key}
            >
                <button
                    className={styles.addEntryListItem}
                    onClick={() => handleEntryItemClick(currentEntryId)}
                    disabled={isMarkedAsDeleted}
                    type="button"
                >
                    {this.renderEntryLabel(entry)}
                    <div className={styles.statusIcons}>
                        {
                            isMarkedAsDeleted &&
                            <span className={EntriesListing.iconMap.markedForRemoval} />
                        }
                        {/* this.renderIcon(status) */}
                    </div>
                </button>
                {
                    isMarkedAsDeleted ? (
                        <Button
                            key="undo-button"
                            className={styles.removeButton}
                            onClick={() => handleMarkAsDeletedEntry(currentEntryId, false)}
                            iconName={iconNames.undo}
                            title={_ts('editEntry', 'removeEntryButtonTitle')}
                        />
                    ) : (
                        <DangerButton
                            key="remove-button"
                            className={styles.removeButton}
                            onClick={() => handleMarkAsDeletedEntry(currentEntryId, true)}
                            iconName={iconNames.delete}
                            title={_ts('editEntry', 'undoRemoveEntryButtonTitle')}
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
                keyExtractor={EntriesListing.calcEntryKey}
            />
        );
    }
}
