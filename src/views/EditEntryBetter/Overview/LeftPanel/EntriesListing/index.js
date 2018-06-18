import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rs/components/Action/Button';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import ListView from '#rs/components/View/List/ListView';

import { entryAccessor, ENTRY_STATUS } from '#entities/entry';
import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    selectedEntryId: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    handleEntryItemClick: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryId: undefined,
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

    static calcEntryKey = entry => entryAccessor.getKey(entry);

    renderIcon = (status) => {
        const className = EntriesListing.iconMap[status] || '';
        return <span className={className} />;
    }

    renderEntryLabel = (entry) => {
        const values = entryAccessor.getValues(entry);

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
            selectedEntryId,
            entries,
        } = this.props;

        const currentEntryId = EntriesListing.calcEntryKey(entry);
        const isActive = currentEntryId === selectedEntryId;
        const selectedEntry = entries.find(
            e => entryAccessor.getKey(e) === currentEntryId,
        );

        const isMarkedForDelete = entryAccessor.isMarkedForDelete(selectedEntry);

        return (
            <div
                className={`${styles.entriesListItem} ${isActive ? styles.active : ''}`}
                key={key}
            >
                <button
                    className={styles.addEntryListItem}
                    onClick={() => this.props.handleEntryItemClick(currentEntryId)}
                    disabled={isMarkedForDelete}
                >
                    {this.renderEntryLabel(entry)}
                    <div className={styles.statusIcons}>
                        {
                            entryAccessor.isMarkedForDelete(entry) &&
                            <span className={EntriesListing.iconMap.markedForRemoval} />
                        }
                    </div>
                </button>
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
