import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';
import FixedTabs from '#rscv/FixedTabs';

import SheetPreview from '#components/TabularSheetPreview';
import { RequestClient, requestMethods } from '#request';

import _cs from '#cs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types

    setDefaultRequestParams: PropTypes.func.isRequired,
    extractRequest: RequestClient.prop.isRequired,
    bookRequest: RequestClient.prop.isRequired,
};

const defaultProps = {
    className: '',
};

const requests = {
    initialRequest: {
        onMount: true,
        onPropsChanged: ['bookId'],

        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ response, params: {
            triggerExtraction,
            startPolling,
            setBook,
            setInvalid,
        } }) => {
            if (response.status === 'initial') {
                triggerExtraction();
            } else if (response.status === 'pending') {
                startPolling();
            } else if (response.status === 'success') {
                setBook(response);
            } else {
                setInvalid();
            }
        },
        onFailure: ({ params: { setInvalid } }) => setInvalid(),
        onFatal: ({ params: { setInvalid } }) => setInvalid(),
    },

    extractRequest: {
        method: requestMethods.POST,
        url: ({ props }) => `/tabular-extraction-trigger/${props.bookId}/`,
        onSuccess: ({ params: { startPolling } }) => startPolling(),
    },

    bookRequest: {
        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        options: {
            pollTime: 1200,
            maxPollAttempts: 100,
            shouldPoll: r => r.status === 'pending',
        },
        onSuccess: ({ response, params: { setBook, setInvalid } }) => {
            if (response.status === 'success') {
                setBook(response);
            } else {
                setInvalid();
            }
        },
    },
};

@RequestClient(requests)
export default class TabularPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            tabs: {},
            sheets: {},
            activeSheet: undefined,
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

    setBook = (book) => {
        const tabs = {};
        const sheets = {};

        book.sheets.forEach((sheet) => {
            tabs[sheet.id] = sheet.title;
            sheets[sheet.id] = sheet;
        });

        this.setState({
            tabs,
            sheets,
            activeSheet: Object.keys(tabs)[0],
            invalid: false,
            completed: true,
        });
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

    handleActiveSheetChange = (activeSheet) => {
        this.setState({ activeSheet });
    }

    render() {
        const {
            tabs,
            sheets,
            activeSheet,
            invalid,
            completed,
        } = this.state;

        const className = _cs(this.props.className, styles.tabularPreview, 'tabular-preview');

        if (invalid) {
            return (
                // FIXME: Use _ts and Message
                <div className={className}>
                    Invalid tabular book
                </div>
            );
        }

        if (!completed) {
            return (
                <div className={className}>
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <div className={className}>
                <SheetPreview
                    className={styles.sheet}
                    sheet={sheets[activeSheet]}
                />
                <FixedTabs
                    className={styles.tabs}
                    tabs={tabs}
                    active={activeSheet}
                    onClick={this.handleActiveSheetChange}
                />
            </div>
        );
    }
}
