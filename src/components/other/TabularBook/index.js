import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';

import Button from '#rsca/Button';
import WarningButton from '#rsca/Button/WarningButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import update from '#rsu/immutable-update';
import {
    listToMap,
    isNotDefined,
    mapToMap,
    mapToList,
    randomString,
} from '#rsu/common';
import { zipWith } from '#rsu/functional';

import Cloak from '#components/general/Cloak';
import TriggerAndPoll from '#components/general/TriggerAndPoll';

import { iconNames } from '#constants';
import { RequestCoordinator, RequestClient, requestMethods } from '#request';
import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';

import TabularSheet from './TabularSheet';
import EditFieldButton from './EditField';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    onDelete: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types

    deleteRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    saveRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
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
    },

    saveRequest: {
        schemaName: 'TabularBookSchema',
        method: requestMethods.PATCH,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        body: ({ params: { body } }) => body,
        onSuccess: ({ response, params: { setBook } }) => {
            setBook(response);
        },
    },
};

const transformSheet = (sheet) => {
    const { data: { columns }, ...other } = sheet;

    const getObjFromZippedRows = (...zippedRow) => mapToMap(
        columns,
        k => k,
        (k, v, i) => zippedRow[i],
    );

    const rows = zipWith(getObjFromZippedRows, ...mapToList(columns));

    return {
        rows: [...rows].map(obj => ({ key: randomString(), ...obj })),
        ...other,
    };
};

@RequestCoordinator
@RequestClient(requests)
export default class TabularBook extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideButtons = ({ leadPermissions }) => (
        !leadPermissions.create || !leadPermissions.modify
    );

    constructor(props) {
        super(props);
        this.state = {
            tabs: {},
            activeSheet: undefined,
            sheets: undefined,
        };
    }

    setBook = (response, onComplete) => {
        const filteredSheets = response.sheets.filter(sheet => !sheet.hidden);
        const sheets = listToMap(
            response.sheets,
            sheet => sheet.id,
            sheet => ({
                ...transformSheet(sheet),
                options: {
                    ...sheet.options,
                    defaultColumnWidth: 250,
                },
            }),
        );

        const tabs = listToMap(
            filteredSheets,
            sheet => sheet.id,
            sheet => sheet.title,
        );

        this.setState(
            {
                tabs,
                sheets,
                // NOTE: there must be atleast on sheet
                activeSheet: Object.keys(tabs)[0],
            },
            () => {
                if (onComplete) {
                    onComplete();
                }
            },
        );
    }

    resetSort = () => {
        // FIXME: move this to redux
        const { sheets, activeSheet } = this.state;
        const settings = {
            [activeSheet]: { $auto: {
                options: { $auto: {
                    sortOrder: { $set: undefined },
                } },
            } },
        };

        this.setState({ sheets: update(sheets, settings) });
    }

    handleSheetChange = (newSheet) => {
        // FIXME: move this to redux
        const { sheets } = this.state;
        const settings = {
            [newSheet.id]: { $set: newSheet },
        };
        this.setState({ sheets: update(sheets, settings) });
    }

    handleActiveSheetChange = (activeSheet) => {
        this.setState({ activeSheet });
    }

    handleDelete = () => {
        this.props.deleteRequest.do();
    }

    handleDetailsChange = (newValues) => {
        this.props.saveRequest.do({
            body: {
                project: this.props.projectId,
                sheets: Object.keys(newValues).map(k => newValues[k]),
            },
            setBook: this.setBook,
        });
    }

    renderBody = ({ invalid, completed, disabled }) => {
        const {
            tabs,
            sheets,
            activeSheet,
        } = this.state;

        if (invalid) {
            return (
                <Message>
                    {_ts('tabular', 'invalid')}
                </Message>
            );
        }

        if (!completed) {
            return (
                <LoadingAnimation />
            );
        }

        const sheet = sheets[activeSheet];

        if (isNotDefined(sheet)) {
            return (
                <Message>
                    {_ts('tabular', 'noSheets')}
                </Message>
            );
        }

        return (
            <Fragment>
                { disabled && <LoadingAnimation /> }
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
            deleteRequest: {
                pending: deletePending,
            },
            saveRequest: {
                pending: savePending,
            },
            onCancel,
        } = this.props;

        const className = _cs(
            this.props.className,
            styles.tabularBook,
            'tabular-book',
        );

        const Body = this.renderBody;

        const disabled = savePending || deletePending || !completed || invalid;

        return (
            <div className={className}>
                <ModalHeader
                    title={_ts('tabular', 'title')}
                    rightComponent={
                        <div className={styles.headerContainer}>
                            <Button
                                iconName={iconNames.sort}
                                onClick={this.resetSort}
                                disabled={disabled}
                            >
                                {_ts('tabular', 'resetSortLabel')}
                            </Button>
                            <Cloak
                                hide={TabularBook.shouldHideButtons}
                                render={
                                    <Fragment>
                                        <EditFieldButton
                                            onChange={this.handleDetailsChange}
                                            iconName={iconNames.edit}
                                            disabled={disabled}
                                            value={sheets}
                                        >
                                            {_ts('tabular', 'editButtonLabel')}
                                        </EditFieldButton>
                                        <DangerConfirmButton
                                            iconName={iconNames.delete}
                                            onClick={this.handleDelete}
                                            confirmationMessage={_ts('tabular', 'deleteMessage')}
                                            disabled={disabled}
                                        >
                                            {_ts('tabular', 'deleteButtonLabel')}
                                        </DangerConfirmButton>
                                    </Fragment>
                                }
                            />
                        </div>
                    }
                />
                <ModalBody className={styles.body}>
                    <Body
                        completed={completed}
                        invalid={invalid}
                        disabled={disabled}
                    />
                </ModalBody>
                <ModalFooter>
                    <WarningButton onClick={onCancel}>
                        {_ts('tabular', 'closeButtonLabel')}
                    </WarningButton>
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
                // schemaName="TabularBookSchema"
            >
                <ActualBook />
            </TriggerAndPoll>
        );
    }
}
