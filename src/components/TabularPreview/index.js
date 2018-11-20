import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import FixedTabs from '#rscv/FixedTabs';

import SheetPreview from '#components/TabularSheetPreview';
import { RequestClient } from '#request';
import _ts from '#ts';
import _cs from '#cs';

import requests from './requests';
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
