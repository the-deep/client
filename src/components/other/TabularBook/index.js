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
import { RequestClient, requestMethods } from '#request';
import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';

import TabularSheet from './TabularSheet';
import EditField from './EditField';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    onEdited: PropTypes.func,

    deleteRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    saveRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    onDelete: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    className: '',
    onEdited: undefined,
};

const requests = {
    deleteRequest: {
        method: requestMethods.DELETE,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ props }) => props.onDelete(),
        onFailure: ({ error = {} }) => {
            const { nonFieldErrors } = error;
            const displayError = nonFieldErrors
                ? nonFieldErrors.join(' ')
                : _ts('tabular', 'deleteFailed');
            notify.send({
                type: notify.type.ERROR,
                title: _ts('tabular', 'tabularBookTitle'),
                message: displayError,
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                type: notify.type.ERROR,
                title: _ts('tabular', 'tabularBookTitle'),
                message: _ts('tabular', 'deleteFailed'),
                duration: notify.duration.SLOW,
            });
        },
        schemaName: 'TabularBookSchema',
    },

    saveRequest: {
        schemaName: 'TabularBookSchema',
        method: requestMethods.PATCH,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        query: { fields: 'id,sheets,options,fields,project' },
        body: ({ params: { body } }) => body,
        onSuccess: ({ response, params: { callback } }) => {
            callback(response);
        },
    },
};

const noOp = () => {};

@RequestClient(requests)
export default class TabularBook extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            tabs: {},
            activeSheet: undefined,
            sheets: undefined,
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
        // TODO: may use setBook instead of a callback
        // TODO: save some things locally, and merge those here
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

        // TODO: no need to call edited
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

        // TODO: dont' call save here, no need to call edited as well
        // TODO: no need to call edited
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
        // TODO: save this thing
        console.warn(newValues);
    }

    renderBody = ({ invalid, completed }) => {
        const {
            tabs,
            sheets,
            activeSheet,
        } = this.state;

        const { saveRequest } = this.props;

        if (invalid) {
            return (
                <div>
                    <Message>
                        {_ts('tabular', 'invalid')}
                    </Message>
                </div>
            );
        }
        if (!completed || saveRequest.pending) {
            return (
                <div>
                    <LoadingAnimation />
                </div>
            );
        }

        const sheet = sheets[activeSheet];

        return (
            <Fragment>
                <TabularSheet
                    // dismount on different activeSheet
                    key={activeSheet}
                    className={styles.sheetView}
                    sheet={sheet}
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
        );
    }

    renderActual = ({ invalid, completed }) => {
        const { sheets } = this.state;

        const {
            deleteRequest,
            onCancel,
        } = this.props;

        const className = _cs(
            this.props.className,
            styles.tabularBook,
            'tabular-book',
        );

        const Body = this.renderBody;

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
                            <DangerConfirmButton
                                iconName={iconNames.delete}
                                onClick={this.handleDelete}
                                confirmationMessage={_ts('tabular', 'deleteMessage')}
                                title={_ts('tabular', 'deleteButtonTooltip')}
                                transparent
                                disabled={!completed || invalid}
                                pending={deleteRequest.pending}
                            />
                            <EditField
                                onChange={this.handleDetailsChange}
                                iconName={iconNames.edit}
                                value={sheets}
                                transparent
                            />
                        </div>
                    }
                />
                <ModalBody className={styles.body}>
                    <Body
                        completed={completed}
                        invalid={invalid}
                    />
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
                triggerUrl={`/tabular-extraction-trigger/${bookId}/`}
                schemaName="TabularBookSchema"
                triggerSchemaName={undefined}
            >
                <ActualBook />
            </TriggerAndPoll>
        );
    }
}
