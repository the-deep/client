import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';

import EntryAdder from './EntryAdder';
import EntryRemover from './EntryRemover';

import styles from './styles.scss';

// Component to show entry
const EntryItem = ({ id }) => (
    <div className={styles.entry}>
        Entry {id}
    </div>
);
EntryItem.propTypes = {
    id: PropTypes.number.isRequired,
};

// function to get key from entry
const entryKeySelector = entry => entry.id;

export default class EntriesViz extends React.PureComponent {
    constructor(props) {
        super(props);

        // This is the global entries state that is shared between the two input components
        this.state = {
            entries: [
                { id: 101 },
                { id: 102 },
                { id: 103 },
            ],
        };
    }

    entryRendererParams = (key, entry) => ({
        id: entry.id,
    })

    handleEntryChange = (entries) => {
        this.setState({ entries });
    }

    render() {
        const { entries } = this.state;

        return (
            <div className={styles.content}>
                {/* Component 1 */}
                <EntryAdder
                    className={styles.adder}
                    value={entries}
                    onChange={this.handleEntryChange}
                />
                {/* Component 2 */}
                <EntryRemover
                    className={styles.remover}
                    value={entries}
                    onChange={this.handleEntryChange}
                    disabled={entries.length <= 1}
                />
                {/* Components in parent */}
                <ListView
                    data={entries}
                    keySelector={entryKeySelector}
                    renderer={EntryItem}
                    rendererParams={this.entryRendererParams}
                />
                <div>
                    <b>Total Entries:</b> { entries.length }
                </div>
            </div>
        );
    }
}
