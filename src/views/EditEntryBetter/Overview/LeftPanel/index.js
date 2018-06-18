import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import MultiViewContainer from '#rs/components/View/MultiViewContainer';
import Message from '#rs/components/View/Message';
import FixedTabs from '#rs/components/View/FixedTabs';

import {
    LEAD_TYPE,
    LEAD_PANE_TYPE,
    leadPaneTypeMap,
} from '#entities/lead';
import _ts from '#ts';

import EntriesListing from './EntriesListing';
import styles from './styles.scss';

const propTypes = {
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedEntryId: PropTypes.string,
    setActiveEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryId: undefined,
};

export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            currentTab: undefined,
        };

        this.views = this.calculateTabComponents();
    }

    calculateTabComponents = () => ({
        'entries-listing': {
            component: () => (
                <div className={styles.entriesListContainer}>
                    <EntriesListing
                        selectedEntryId={this.props.selectedEntryId}
                        entries={this.props.entries}
                        handleEntryItemClick={this.handleEntryItemClick}
                    />
                </div>
            ),
            mount: true,
            wrapContainer: true,
        },
    })

    calculateTabsForLead = () => {
        const tabs = {};
        tabs['entries-listing'] = _ts('editEntry', 'entriesTabLabel');
        return tabs;
    }

    handleTabClick = (key) => {
        if (key === this.state.currentTab) {
            return;
        }
        this.setState({ currentTab: key });
    }

    // Entries

    handleEntryItemClick = (value) => {
        this.props.setActiveEntry({
            leadId: this.props.lead.id,
            entryId: value,
        });
    }

    render() {
        const { lead } = this.props;
        const { images } = this.state;
        let { currentTab } = this.state;

        // FIXME: move this to componentWillUpdate
        const tabs = this.calculateTabsForLead(lead, images);

        // If there is no tabs, the lead must have unrecognized type
        if (!tabs) {
            return (
                <Message>
                    {_ts('editEntry', 'unrecognizedLeadMessage')}
                </Message>
            );
        }

        // If there is no currentTab, get first visible tab
        if (!currentTab) {
            const tabKeys = Object.keys(tabs).filter(a => !!tabs[a]);
            currentTab = tabKeys.length > 0 ? Object.keys(tabs)[0] : undefined;
        }

        return (
            <Fragment>
                <FixedTabs
                    className={styles.tabs}
                    active={currentTab}
                    tabs={tabs}
                    onClick={this.handleTabClick}
                />
                <MultiViewContainer
                    active={currentTab}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
