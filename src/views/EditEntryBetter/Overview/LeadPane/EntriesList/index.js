import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rs/components/Action/Button';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import ListView from '#rs/components/View/List/ListView';

import { ENTRY_STATUS } from '#entities/entry';
import { entryAccessor } from '#entities/editEntriesBetter';
import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
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

        if (values.entryType === 'image') {
            return (
                <img
                    className={styles.image}
                    src={values.image}
                    alt={_ts('editEntry', 'altLabel')}
                />
            );
        }
        // FIXME: use strings
        return (
            <div className={styles.entryExcerpt}>
                {values.excerpt || `Excerpt ${values.order}`}
            </div>
        );
    }

    renderEntryItem = (key, entry) => {
        const {
            selectedEntryKey,
            // entries,
            // choices,
        } = this.props;

        const onEntryDelete = (deleteOrUndo, k) => {
            console.warn('TODO: delete or undo', k);
        };
        const handleEntryItemClick = (currentEntryId) => {
            this.props.setSelectedEntryKey({ leadId: this.props.leadId, key: currentEntryId });
        };

        const currentEntryId = EntriesListing.calcEntryKey(entry);
        const isActive = currentEntryId === selectedEntryKey;
        /*
        // const status = choices[key].choice;
        const selectedEntry = entries.find(
            e => entryAccessor.key(e) === currentEntryId,
        );
        const isMarkedForDelete = entryAccessor.isMarkedForDelete(selectedEntry);
        */
        const isMarkedForDelete = false;

        const isSelectedEntryMarkedForDelete = false;
        // const isSelectedEntryMarkedForDelete = entryAccessor.isMarkedForDelete(entry);

        return (
            <div
                className={`${styles.entriesListItem} ${isActive ? styles.active : ''}`}
                key={key}
            >
                <button
                    className={styles.addEntryListItem}
                    onClick={() => handleEntryItemClick(currentEntryId)}
                    disabled={isMarkedForDelete}
                >
                    {this.renderEntryLabel(entry)}
                    <div className={styles.statusIcons}>
                        {
                            isSelectedEntryMarkedForDelete &&
                            <span className={EntriesListing.iconMap.markedForRemoval} />
                        }
                        {/* this.renderIcon(status) */}
                    </div>
                </button>
                {
                    isMarkedForDelete ? (
                        <Button
                            key="undo-button"
                            className={styles.removeButton}
                            onClick={() => onEntryDelete(false, key)}
                            iconName={iconNames.undo}
                            title={_ts('editEntry', 'removeEntryButtonTitle')}
                        />
                    ) : (
                        <DangerButton
                            key="remove-button"
                            className={styles.removeButton}
                            onClick={() => onEntryDelete(true, key)}
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
