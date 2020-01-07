import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import memoize from 'memoize-one';

import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';

import _ts from '#ts';

import EntriesList from './EntriesList';
import EntryGroupsList from './EntryGroupsList';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    bookId: PropTypes.number,
};

const defaultProps = {
    className: undefined,
    bookId: undefined,
};

export default class LeftPane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            currentTab: undefined,
        };

        this.views = {
            'entries-listing': {
                component: EntriesList,
                rendererParams: () => ({
                    className: styles.container,
                    bookId: this.props.bookId,
                }),
                mount: true,
                lazyMount: true,
                wrapContainer: true,
            },
            'entry-groups-listing': {
                component: EntryGroupsList,
                rendererParams: () => ({
                    className: styles.container,
                }),
                mount: true,
                lazyMount: true,
                wrapContainer: true,
            },
        };

        this.tabs = {
            'entries-listing': _ts('editEntry.group.leftpane', 'entriesListingTabLabel'),
            'entry-groups-listing': _ts('editEntry.group.leftpane', 'entryGroupsListingTabLabel'),
        };
    }

    getCurrentTab = memoize((currentTab, tabs) => {
        if (currentTab) {
            return currentTab;
        }
        // If there is no currentTab, get first visible tab
        const tabKeys = Object.keys(tabs).filter(a => !!tabs[a]);
        return tabKeys.length > 0 ? Object.keys(tabs)[0] : undefined;
    })

    handleTabClick = (key) => {
        this.setState({ currentTab: key });
    }

    render() {
        const {
            className,
        } = this.props;
        const {
            currentTab,
        } = this.state;

        const tabKey = this.getCurrentTab(currentTab, this.tabs);

        return (
            <div className={_cs(styles.leftPanel, className)}>
                <ScrollTabs
                    className={styles.tabs}
                    active={tabKey}
                    tabs={this.tabs}
                    onClick={this.handleTabClick}
                />
                <MultiViewContainer
                    containerClassName={styles.multiviewContainer}
                    activeClassName={styles.active}
                    active={tabKey}
                    views={this.views}
                />
            </div>
        );
    }
}
