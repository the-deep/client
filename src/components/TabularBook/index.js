import PropTypes from 'prop-types';
import React from 'react';

import FixedTabs from '#rscv/FixedTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import { iconNames } from '#constants';
import TabularSheet from '#components/TabularSheet';
import { RequestClient, requestMethods } from '#request';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    setSaveTabularFunction: PropTypes.func,
    onEdited: PropTypes.func,

    setDefaultRequestParams: PropTypes.func.isRequired,
    extractRequest: RequestClient.prop.isRequired,
    bookRequest: RequestClient.prop.isRequired,
    deleteRequest: RequestClient.prop.isRequired,
    saveRequest: RequestClient.prop.isRequired,

    showDelete: PropTypes.bool,
    onDelete: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    className: '',
    showDelete: false,
    setSaveTabularFunction: undefined,
    onEdited: undefined,
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

    deleteRequest: {
        method: requestMethods.DELETE,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ props }) => props.onDelete(),
    },

    saveRequest: {
        method: requestMethods.PATCH,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        query: { fields: 'sheets,options,fields' },
        body: ({ params: { body } }) => body,
        onSuccess: ({ params: { callback } }) => {
            callback();
        },
    },
};

@RequestClient(requests)
export default class TabularBook extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            tabs: {},
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

        if (props.setSaveTabularFunction) {
            props.setSaveTabularFunction(this.save);
        }
    }

    componentWillUnmount() {
        if (this.props.setSaveTabularFunction) {
            this.props.setSaveTabularFunction(undefined);
        }
    }

    getRendererParams = sheetId => ({
        sheet: this.state.sheets[sheetId],
        onSheetChange: this.handleSheetChange,
    })

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

    save = (callback) => {
        const { sheets } = this.state;
        this.props.saveRequest.do({
            callback,
            body: {
                sheets: Object.keys(sheets).map(k => sheets[k]),
            },
        });
    }

    handleSheetChange = (newSheet) => {
        const sheets = { ...this.state.sheets };
        sheets[newSheet.id] = newSheet;
        this.setState({ sheets });

        if (this.props.onEdited) {
            this.props.onEdited();
        }
    }

    handleActiveSheetChange = (activeSheet) => {
        this.setState({ activeSheet });
    }

    handleDelete = () => {
        this.props.deleteRequest.do();
    }

    render() {
        const {
            className,
            showDelete,
        } = this.props;

        const {
            tabs,
            sheets,
            activeSheet,
            invalid,
            completed,
        } = this.state;

        if (invalid) {
            return (
                <div className={_cs(className, styles.tabularBook, 'tabular-book')}>
                    Invalid tabular book
                </div>
            );
        }

        if (!completed) {
            return (
                <div className={_cs(className, styles.tabularBook, 'tabular-book')}>
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <div className={_cs(className, styles.tabularBook, 'tabular-book')}>
                <header>
                    <h4>
                        Quantitiave Analysis
                    </h4>
                    {showDelete && (
                        <DangerConfirmButton
                            iconName={iconNames.delete}
                            onClick={this.handleDelete}
                            confirmationMessage={_ts('tabular', 'deleteMessage')}
                            transparent
                        />
                    )}
                </header>
                <TabularSheet
                    className={styles.sheetView}
                    sheet={sheets[activeSheet]}
                    onSheetChange={this.handleSheetChange}
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
