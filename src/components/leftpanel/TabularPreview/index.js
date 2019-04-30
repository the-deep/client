import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { listToMap } from '@togglecorp/fujs';
import { connect } from 'react-redux';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';

import {
    selectedTabForTabularBook,
    setTabularSelectedTabAction,
} from '#redux';

import { RequestClient } from '#request';
import _ts from '#ts';
import _cs from '#cs';

import SheetPreview from './TabularSheetPreview';
import requests from './requests';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    highlights: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedTab: PropTypes.string,

    onClick: PropTypes.func.isRequired,
    setDefaultRequestParams: PropTypes.func.isRequired,
    extractRequest: RequestClient.propType.isRequired,
    bookRequest: RequestClient.propType.isRequired,
    onLoad: PropTypes.func.isRequired,
    showGraphs: PropTypes.bool.isRequired,
    setSelectedTab: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    highlights: [],
    selectedTab: undefined,
};

const mapStateToProps = (state, props) => ({
    selectedTab: selectedTabForTabularBook(state, props),
});

const mapDispatchToProps = dispatch => ({
    setSelectedTab: params => dispatch(setTabularSelectedTabAction(params)),
});

@RequestClient(requests)
@connect(mapStateToProps, mapDispatchToProps)
export default class TabularPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            tabs: {},
            sheets: {},
            completed: false,
            invalid: false,
        };

        props.setDefaultRequestParams({
            triggerExtraction: this.triggerExtraction,
            startPolling: this.startPolling,
            setBook: this.setBook,
            setInvalid: this.setInvalid,
        });
    }

    getHighlights = memoize(highlights => (
        listToMap(
            highlights.filter(highlight => !!highlight.tabularFieldId),
            highlight => highlight.tabularFieldId,
            highlight => highlight,
        )
    ))

    setBook = (response) => {
        const validSheets = response.sheets.filter(
            sheet => sheet.fields.length > 0,
        );

        const sheets = listToMap(
            validSheets,
            sheet => sheet.id,
            sheet => sheet,
        );

        const filteredSheets = validSheets.filter(
            sheet => !sheet.hidden,
        );

        const tabs = listToMap(
            filteredSheets,
            sheet => sheet.id,
            sheet => sheet.title,
        );

        this.setState({
            invalid: false,
            completed: true,
            tabs,
            sheets,
        });

        this.props.onLoad(response);
    }

    setInvalid = () => {
        this.setState({ invalid: true });
    }

    triggerExtraction = () => {
        this.props.extractRequest.do();
    }

    startPolling = () => {
        this.props.bookRequest.do();
    }

    handleActiveSheetChange = (selectedTab) => {
        const {
            setSelectedTab,
            bookId,
        } = this.props;

        setSelectedTab({
            bookId,
            selectedTab,
        });
    }

    render() {
        const {
            tabs,
            sheets,
            invalid,
            completed,
        } = this.state;

        const {
            className: classNameFromProps,
            highlights: highlightsFromProps,
            onClick,
            selectedTab: selectedTabFromProps,
            showGraphs,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.tabularPreview,
            'tabular-preview',
        );

        if (invalid) {
            return (
                <Message className={className}>
                    {_ts('tabular', 'invalid')}
                </Message>
            );
        }

        if (!completed) {
            return (
                <div className={className}>
                    <LoadingAnimation />
                </div>
            );
        }

        const highlights = this.getHighlights(highlightsFromProps);

        const firstKey = Object.keys(tabs)[0];
        // NOTE: activeTab was taken from Object.keys, so it is a string
        const firstTab = (firstKey !== undefined) && Number(firstKey);
        const selectedTab = (!selectedTabFromProps || !tabs[selectedTabFromProps])
            ? firstTab
            : selectedTabFromProps;

        return (
            <div className={className}>
                <SheetPreview
                    // FIXME:
                    // virtualized list doesn't work properly when child height change, so
                    // unmounting sheet preview when graph is added/removed
                    key={showGraphs}
                    className={styles.sheet}
                    sheet={sheets[selectedTab]}
                    highlights={highlights}
                    onClick={onClick}
                    showGraphs={showGraphs}
                />
                <ScrollTabs
                    className={styles.tabs}
                    tabs={tabs}
                    active={selectedTab}
                    onClick={this.handleActiveSheetChange}
                />
            </div>
        );
    }
}
