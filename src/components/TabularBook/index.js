import PropTypes from 'prop-types';
import React from 'react';

import FixedTabs from '#rscv/FixedTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Button from '#rsca/Button';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import update from '#rsu/immutable-update';

import { iconNames } from '#constants';
import TabularSheet from '#components/TabularSheet';

import { RequestClient } from '#request';
import _ts from '#ts';
import _cs from '#cs';

import requests from './requests';
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

    resetSort = () => {
        const { sheets, activeSheet } = this.state;
        const settings = {
            [activeSheet]: { $auto: {
                options: { $auto: {
                    sortOrder: { $set: undefined },
                } },
            } },
        };

        this.setState({ sheets: update(sheets, settings) }, () => {
            if (this.props.onEdited) {
                this.props.onEdited();
            }
        });
    }

    handleSheetChange = (newSheet) => {
        const { sheets } = this.state;
        const settings = {
            [newSheet.id]: { $set: newSheet },
        };

        this.setState({ sheets: update(sheets, settings) }, () => {
            if (this.props.onEdited) {
                this.props.onEdited();
            }
        });
    }

    handleActiveSheetChange = (activeSheet) => {
        this.setState({ activeSheet });
    }

    handleDelete = () => {
        this.props.deleteRequest.do();
    }

    render() {
        const {
            tabs,
            sheets,
            activeSheet,
            invalid,
            completed,
        } = this.state;

        const className = _cs(this.props.className, styles.tabularBook, 'tabular-book');

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
                <header>
                    <h4>
                        {_ts('tabular', 'title')}
                    </h4>
                    <div>
                        <Button
                            iconName={iconNames.sort}
                            onClick={this.resetSort}
                            title={_ts('tabular', 'resetSortTitle')}
                            transparent
                        />
                        {this.props.showDelete && (
                            <DangerConfirmButton
                                iconName={iconNames.delete}
                                onClick={this.handleDelete}
                                confirmationMessage={_ts('tabular', 'deleteMessage')}
                                title={_ts('tabular', 'deleteButtonTooltip')}
                                transparent
                            />
                        )}
                    </div>
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
