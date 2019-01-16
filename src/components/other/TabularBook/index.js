import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';

import Button from '#rsca/Button';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import update from '#rsu/immutable-update';
import { mapToList } from '#rsu/common';

import TriggerAndPoll from '#components/general/TriggerAndPoll';

import { iconNames } from '#constants';
import { RequestClient } from '#request';
import _ts from '#ts';
import _cs from '#cs';

import TabularSheet from './TabularSheet';
import EditField from './EditField';
import requests from './requests';
import styles from './styles.scss';

const noOp = () => {};

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    onEdited: PropTypes.func,

    deleteRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    saveRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    showDelete: PropTypes.bool,
    onDelete: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    className: '',
    showDelete: false,
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
        };
    }

    setBook = (book, callback) => {
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
        }, callback);
    }

    save = () => {
        const { sheets } = this.state;
        this.props.saveRequest.do({
            body: {
                project: this.props.projectId,
                sheets: mapToList(
                    sheets,
                    // eslint-disable-next-line no-unused-vars
                    ({ data, ...otherAttributes }) => otherAttributes,
                ),
            },
            setBook: response => this.setBook(response, noOp),
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
            this.save();
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

    handleDetailsChange = (newValues) => {
        console.warn(newValues);
    }

    renderActual = ({ invalid, completed }) => {
        const {
            tabs,
            sheets,
            activeSheet,
        } = this.state;

        const {
            deleteRequest,
            saveRequest,
            onCancel,
            showDelete,
        } = this.props;

        const className = _cs(
            this.props.className,
            styles.tabularBook,
            'tabular-book',
        );

        return (
            <div className={className}>
                <ModalHeader
                    title={_ts('tabular', 'title')}
                    rightComponent={
                        <div>
                            <Button
                                iconName={iconNames.sort}
                                onClick={this.resetSort}
                                title={_ts('tabular', 'resetSortTitle')}
                                transparent
                                disabled={deleteRequest.pending || !completed || invalid}
                            />
                            {showDelete && (
                                <DangerConfirmButton
                                    iconName={iconNames.delete}
                                    onClick={this.handleDelete}
                                    confirmationMessage={_ts('tabular', 'deleteMessage')}
                                    title={_ts('tabular', 'deleteButtonTooltip')}
                                    transparent
                                    disabled={deleteRequest.pending || !completed || invalid}
                                    pending={deleteRequest.pending}
                                />
                            )}
                            <EditField
                                onChange={this.handleDetailsChange}
                                iconName={iconNames.edit}
                                value={this.state.sheets}
                                transparent
                            />
                        </div>
                    }
                />
                <ModalBody className={styles.body}>
                    { invalid &&
                        <div className={className}>
                            <Message>
                                {_ts('tabular', 'invalid')}
                            </Message>
                        </div>
                    }
                    { completed && !saveRequest.pending ? (
                        <Fragment>
                            <TabularSheet
                                className={styles.sheetView}
                                sheet={sheets[activeSheet]}
                                onSheetChange={this.handleSheetChange}
                            />
                            <ScrollTabs
                                className={styles.tabs}
                                tabs={tabs}
                                active={activeSheet}
                                onClick={this.handleActiveSheetChange}
                                inverted
                            />
                        </Fragment>
                    ) : (
                        <div className={className}>
                            <LoadingAnimation />
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onCancel}>
                        {_ts('tabular', 'closeButtonTitle')}
                    </Button>
                </ModalFooter>
            </div>
        );
    }

    render() {
        const { bookId } = this.props;
        const ActualBook = this.renderActual;

        return (
            <TriggerAndPoll
                onDataReceived={this.setBook}
                url={`/tabular-books/${bookId}/`}
                // dataSchemaName={tabularSchemaName}
                triggerUrl={`/tabular-extraction-trigger/${bookId}/`}
                schemaName="TabularBookSchema"
                triggerSchemaName={undefined}
            >
                <ActualBook />
            </TriggerAndPoll>
        );
    }
}
