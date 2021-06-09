import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { listToMap } from '@togglecorp/fujs';
import { connect } from 'react-redux';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';

import {
    selectedTabForTabularBookSelector,
    setTabularSelectedTabAction,
    setTabularDataAction,
    sheetsMapForTabularBookSelector,
    tabsForTabularBookSelector,
    patchTabularFieldsAction,
} from '#redux';

import { RequestClient } from '#request';
import _ts from '#ts';
import _cs from '#cs';

import SheetPreview from './TabularSheetPreview';
import requestOptions from './requests';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    highlights: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedTab: PropTypes.string,

    onClick: PropTypes.func.isRequired,
    showGraphs: PropTypes.bool.isRequired,
    setSelectedTab: PropTypes.func.isRequired,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setDefaultRequestParams: PropTypes.func.isRequired,

    setTabularData: PropTypes.func.isRequired,
    patchTabularFields: PropTypes.func.isRequired,

    sheets: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabs: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    highlights: [],
    selectedTab: undefined,
    sheets: undefined,
    tabs: undefined,
};

const mapStateToProps = (state, props) => ({
    selectedTab: selectedTabForTabularBookSelector(state, props),
    sheets: sheetsMapForTabularBookSelector(state, props),
    tabs: tabsForTabularBookSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setSelectedTab: params => dispatch(setTabularSelectedTabAction(params)),
    setTabularData: params => dispatch(setTabularDataAction(params)),
    patchTabularFields: params => dispatch(patchTabularFieldsAction(params)),
});

@RequestClient(requestOptions)
@connect(mapStateToProps, mapDispatchToProps)
export default class TabularPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            completed: false,
            invalid: false,
        };

        props.setDefaultRequestParams({
            // triggerExtraction: this.triggerExtraction,
            // startPolling: this.startPolling,
            setBook: this.setBook,
            setInvalid: this.setInvalid,
            pollFields: this.pollFields,
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
        this.setState({
            invalid: false,
            completed: true,
        });

        const {
            bookId,
            setTabularData,
        } = this.props;

        setTabularData({ bookId, book: response });
    }

    setFields = (fields) => {
        const {
            bookId,
            patchTabularFields,
        } = this.props;

        patchTabularFields({ bookId, fields });
    }

    setInvalid = () => {
        this.setState({ invalid: true });
    }

    pollFields = (fields) => {
        // NOTE: create a new polling request everytime
        const {
            requests: {
                pollRequest,
            },
        } = this.props;
        pollRequest.do({
            fields,
            setInvalid: this.setInvalid,
            setFields: this.setFields,
            pollFields: this.pollFields,
        });
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
            invalid,
            completed,
        } = this.state;
        const {
            sheets,
            tabs,
        } = this.props;

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
                    // NOTE:
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
