import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import produce from 'immer';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import WarningButton from '#rsca/Button/WarningButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import modalize from '#rscg/Modalize';
import ListSelection from '#rsci/ListSelection';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ScrollTabs from '#rscv/ScrollTabs';

import Faram, { requiredCondition } from '#rscg/Faram';
import { FgRestBuilder } from '#rsu/rest';
import {
    listToMap,
    isNotDefined,
    mapToMap,
    mapToList,
} from '#rsu/common';
import {
    getNaturalNumbers,
    zipWith,
} from '#rsu/functional';
import update from '#rsu/immutable-update';

import Cloak from '#components/general/Cloak';
import TriggerAndPoll from '#components/general/TriggerAndPoll';

import {
    createUrlForSheetEdit,
    createParamsForSheetEdit,
    createUrlForSheetDelete,
    createParamsForSheetDelete,
    createUrlForSheetRetrieve,
    createParamsForSheetRetrieve,
} from '#rest';
import { iconNames } from '#constants';
import { RequestCoordinator, RequestClient, requestMethods } from '#request';
import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';

import TabularSheet from './TabularSheet';
// import EditFieldButton from './EditField';
import styles from './styles.scss';

const WarningModalButton = modalize(WarningButton);
const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    onDelete: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types

    deleteRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // projectId: PropTypes.number.isRequired,
    // saveRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
};


const transformSheet = (sheet) => {
    const {
        data: { columns },
        options,
        ...other
    } = sheet;

    const fieldsStats = mapToMap(
        columns,
        k => k,
        (value) => {
            const invalidCount = value.filter(x => x.invalid).length;
            const emptyCount = value.filter(x => x.empty).length;
            const totalCount = value.length;
            return {
                healthBar: [
                    {
                        key: 'valid',
                        value: totalCount - emptyCount - invalidCount,
                    },
                    {
                        key: 'invalid',
                        value: invalidCount,
                    },
                    {
                        key: 'empty',
                        value: emptyCount,
                    },
                ],
            };
        },
    );

    const newColumns = {
        ...columns,
        key: getNaturalNumbers(), // gives a list of natural numbers
    };

    const getObjFromZippedRows = (...zippedRow) => mapToMap(
        newColumns,
        k => k,
        (k, v, i) => zippedRow[i],
    );

    const rows = zipWith(getObjFromZippedRows, ...mapToList(newColumns));

    const newSheet = {
        rows: [...rows],
        fieldsStats,
        options: {
            ...options,
            defaultColumnWidth: 250,
        },
        ...other,
    };
    return newSheet;
};

const transformSheets = (originalSheets) => {
    const sheets = listToMap(
        originalSheets,
        sheet => sheet.id,
        transformSheet,
    );

    const filteredSheets = originalSheets.filter(sheet => !sheet.hidden);
    const tabs = listToMap(
        filteredSheets,
        sheet => sheet.id,
        sheet => sheet.title,
    );

    return {
        sheets,
        tabs,
        firstTab: Object.keys(tabs)[0],
    };
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

    /*
    saveRequest: {
        schemaName: 'TabularBookSchema',
        method: requestMethods.PATCH,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        body: ({ params: { body } }) => body,
        onSuccess: ({ response, params: { setBook } }) => {
            setBook(response);
        },
    },
    */
};

class SheetEditModal extends React.PureComponent {
    constructor(props) {
        super(props);

        const { title } = this.props;

        this.state = {
            value: { title },
            error: {},
            hasError: false,
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            value: faramValues,
            error: faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ error: faramErrors });
    };

    handleFaramValidationSuccess = (value) => {
        const {
            onSheetEdit,
            sheetId,
            closeModal,
        } = this.props;

        onSheetEdit(sheetId, value);
        closeModal();
    };

    handleDeleteClick = () => {
        const {
            onSheetDelete,
            sheetId,
            closeModal,
        } = this.props;

        onSheetDelete(sheetId);
        closeModal();
    }

    render() {
        const { closeModal, disabled, disabledDelete } = this.props;
        const { value, error, hasError, pristine } = this.state;
        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
            >
                <ModalBody>
                    <Faram
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleFaramValidationFailure}
                        onValidationSuccess={this.handleFaramValidationSuccess}

                        schema={this.schema}
                        value={value}
                        error={error}
                        disabled={disabled}
                    >
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            label="Title"
                            autoFocus
                        />
                        <DangerButton
                            disabled={disabled || disabledDelete}
                            onClick={this.handleDeleteClick}
                        >
                            Delete Sheet
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={disabled || hasError || pristine}
                        >
                            Save
                        </PrimaryButton>
                    </Faram>
                </ModalBody>
            </Modal>
        );
    }
}

// eslint-disable-next-line react/no-multi-comp
class SheetRetrieveModal extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selectedSheets: [],
        };
    }

    handleSelection = (value) => {
        this.setState({ selectedSheets: value });
    }

    handleRetrieveClick = () => {
        const {
            onSheetRetrieve,
            closeModal,
        } = this.props;
        const { selectedSheets } = this.state;

        onSheetRetrieve(selectedSheets);
        closeModal();
    }

    render() {
        const { closeModal, sheets, disabled } = this.props;
        const { selectedSheets } = this.state;
        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
            >
                <ModalBody>
                    <ListSelection
                        label="Sheets to retrieve"
                        disabled={disabled}
                        labelSelector={SheetRetrieveModal.labelSelector}
                        keySelector={SheetRetrieveModal.keySelector}
                        options={sheets}
                        value={this.state.selectedSheets}
                        onChange={this.handleSelection}

                    />
                    <PrimaryButton
                        disabled={disabled || selectedSheets.length <= 0}
                        onClick={this.handleRetrieveClick}
                    >
                        Retrieve
                    </PrimaryButton>
                </ModalBody>
            </Modal>
        );
    }
}

SheetRetrieveModal.labelSelector = s => s.title;
SheetRetrieveModal.keySelector = s => s.id;

// eslint-disable-next-line react/no-multi-comp
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
            originalSheets: undefined,

            sheetRetrievingPending: false,
            sheetDeletePending: {},
            sheetEditPending: {},

            /*
            columnDeletePending: {},
            columnEditPending: {},
            columnRetrievingPending: {},
            sheetOptionsEditPending: false,
            */
        };
    }

    setBook = (response, onComplete) => {
        this.setState(
            { originalSheets: response.sheets },
            () => {
                if (onComplete) {
                    onComplete();
                }
            },
        );
    }

    handleDelete = () => {
        this.props.deleteRequest.do();
    }

    handleSheetDelete = (sheetId) => {
        const sheetDeleteRequest = new FgRestBuilder()
            .url(createUrlForSheetDelete(sheetId))
            .params(createParamsForSheetDelete)
            .preLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        safeState.sheetDeletePending[sheetId] = true;
                    }),
                );
            })
            .success(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        const sheetIndex = safeState.originalSheets.findIndex(
                            s => s.id === sheetId,
                        );
                        // eslint-disable-next-line no-param-reassign
                        safeState.originalSheets[sheetIndex].hidden = true;
                    }),
                );
            })
            .postLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        delete safeState.sheetDeletePending[sheetId];
                    }),
                );
            })
            .build();
        sheetDeleteRequest.start();
    }

    handleSheetEdit = (sheetId, value) => {
        const sheetDeleteRequest = new FgRestBuilder()
            .url(createUrlForSheetEdit(sheetId))
            .params(() => createParamsForSheetEdit(value))
            .preLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        safeState.sheetEditPending[sheetId] = true;
                    }),
                );
            })
            .success(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        const sheetIndex = safeState.originalSheets.findIndex(
                            s => s.id === sheetId,
                        );
                        // eslint-disable-next-line no-param-reassign
                        safeState.originalSheets[sheetIndex] = {
                            ...safeState.originalSheets[sheetIndex],
                            ...value,
                        };
                    }),
                );
            })
            .postLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        delete safeState.sheetEditPending[sheetId];
                    }),
                );
            })
            .build();
        sheetDeleteRequest.start();
    }

    handleSheetRetrieve = (sheetIds) => {
        const { bookId } = this.props;

        const sheetIdMap = listToMap(
            sheetIds,
            id => id,
            () => true,
        );

        const modification = this.state.originalSheets.map((sheet) => {
            const { id } = sheet;
            return sheetIdMap[id] ? { id, hidden: false } : { id };
        });

        const sheetRetrieveRequest = new FgRestBuilder()
            .url(createUrlForSheetRetrieve(bookId))
            .params(() => createParamsForSheetRetrieve(modification))
            .preLoad(() => {
                this.setState({ sheetRetrievingPending: true });
            })
            .success(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        sheetIds.forEach((sheetId) => {
                            const sheetIndex = safeState.originalSheets.findIndex(
                                s => s.id === sheetId,
                            );
                            // eslint-disable-next-line no-param-reassign
                            safeState.originalSheets[sheetIndex].hidden = false;
                        });
                    }),
                );
            })
            .postLoad(() => {
                this.setState({ sheetRetrievingPending: false });
            })
            .build();
        sheetRetrieveRequest.start();
    }

    handleSheetChange = (newSheet) => {
        // TODO:
        console.warn('sheet should change', newSheet);
        /*
        // FIXME: move this to redux
        const { sheets } = this.state;
        const settings = {
            [newSheet.id]: { $set: newSheet },
        };
        this.setState({ sheets: update(sheets, settings) });
        */
    }

    handleActiveSheetChange = (activeSheet) => {
        this.setState({ activeSheet });
    }

    /*
    handleDetailsChange = (newValues) => {
        this.props.saveRequest.do({
            body: {
                project: this.props.projectId,
                sheets: Object.keys(newValues).map(k => newValues[k]),
            },
            setBook: this.setBook,
        });
    }
    */

    tabsRenderer = ({
        title, className, sheetId, onClick, deletePending, editPending, originalSheets,
    }) => {
        const { tabs, sheets } = transformSheets(originalSheets);
        const tabKeys = Object.keys(tabs);

        const sheet = sheets[sheetId];

        return (
            <div className={_cs(className, styles.tab)}>
                <button
                    onClick={onClick}
                    className={styles.tabButton}
                >
                    {title}
                </button>
                <WarningModalButton
                    className={styles.editButton}
                    iconName={iconNames.edit}
                    transparent
                    title="Edit"
                    pending={deletePending || editPending}
                    modal={
                        <SheetEditModal
                            sheetId={sheetId}
                            title={sheet.title}
                            onSheetDelete={this.handleSheetDelete}
                            onSheetEdit={this.handleSheetEdit}
                            disabled={deletePending || editPending}
                            disabledDelete={tabKeys.length <= 1}
                        />
                    }
                />
            </div>
        );
    }

    tabsRendererParams = (key, data) => ({
        title: data,
        // NOTE: sheetId was taken from key, so it is a string
        sheetId: Number(key),
        deletePending: this.state.sheetDeletePending[key],
        editPending: this.state.sheetEditPending[key],
        originalSheets: this.state.originalSheets,
    })

    renderBody = ({ invalid, completed, disabled }) => {
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

        const {
            originalSheets,
            activeSheet,
            sheetRetrievingPending,
        } = this.state;

        const {
            sheets,
            tabs,
            firstTab,
        } = transformSheets(originalSheets);

        const sheetList = mapToList(
            sheets,
            s => ({
                title: s.title,
                id: s.id,
                hidden: s.hidden,
            }),
        ).filter(s => s.hidden);

        const activeSheetKey = (!activeSheet || !sheets[activeSheet] || sheets[activeSheet].hidden)
            ? firstTab
            : activeSheet;

        const sheet = sheets[activeSheetKey];

        return (
            <Fragment>
                { disabled && <LoadingAnimation /> }
                {
                    isNotDefined(sheet) ? (
                        <Message>
                            {_ts('tabular', 'noSheets')}
                        </Message>
                    ) : (
                        <TabularSheet
                            // dismount on different activeSheet
                            key={activeSheetKey}
                            className={styles.sheetView}
                            sheet={sheet}
                            onSheetChange={this.handleSheetChange}
                        />
                    )
                }
                { (sheetList.length > 0 || Object.keys(tabs).length > 0) &&
                    <ScrollTabs
                        className={styles.tabs}
                        tabs={tabs}
                        active={activeSheetKey}
                        onClick={this.handleActiveSheetChange}
                        inverted
                        showBeforeTabs
                        renderer={this.tabsRenderer}
                        rendererParams={this.tabsRendererParams}
                    >
                        <ModalButton
                            iconName={iconNames.more}
                            title="Other Columns"
                            disabled={sheetList.length <= 0}
                            pending={sheetRetrievingPending}
                            // pending
                            modal={
                                <SheetRetrieveModal
                                    sheets={sheetList}
                                    onSheetRetrieve={this.handleSheetRetrieve}
                                    disabled={sheetRetrievingPending}
                                    // disabled
                                />
                            }
                        />
                    </ScrollTabs>
                }
            </Fragment>
        );
    }

    renderTabularBook = ({ invalid, completed }) => {
        const {
            deleteRequest: {
                pending: deletePending,
            },
            /*
            saveRequest: {
                pending: savePending,
            },
            */
            onCancel,
        } = this.props;

        const className = _cs(
            this.props.className,
            styles.tabularBook,
            'tabular-book',
        );

        const Body = this.renderBody;

        // const disabled = savePending || deletePending || !completed || invalid;
        const disabled = deletePending || !completed || invalid;

        return (
            <div className={className}>
                <ModalHeader
                    title={_ts('tabular', 'title')}
                    rightComponent={
                        <Cloak
                            hide={TabularBook.shouldHideButtons}
                            render={
                                <div className={styles.headerContainer}>
                                    {/*
                                    <EditFieldButton
                                        onChange={this.handleDetailsChange}
                                        iconName={iconNames.edit}
                                        disabled={disabled}
                                        value={sheets}
                                    >
                                        {_ts('tabular', 'editButtonLabel')}
                                    </EditFieldButton>
                                    */}
                                    <DangerConfirmButton
                                        iconName={iconNames.delete}
                                        onClick={this.handleDelete}
                                        confirmationMessage={_ts('tabular', 'deleteMessage')}
                                        disabled={disabled}
                                    >
                                        {_ts('tabular', 'deleteButtonLabel')}
                                    </DangerConfirmButton>
                                </div>
                            }
                        />
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
        const ActualTabularBook = this.renderTabularBook;

        return (
            <TriggerAndPoll
                onDataReceived={this.setBook}
                url={`/tabular-books/${bookId}/`}
                triggerUrl={`/tabular-extraction-trigger/${bookId}/`}
                // schemaName="TabularBookSchema"
            >
                <ActualTabularBook />
            </TriggerAndPoll>
        );
    }
}


/*
1. Load everything
    LOAD EVERYTHING
    http://localhost:8000/api/v1/tabular-books/<id>

1. Hide field
    PATCH http://localhost:8000/api/v1/tabular-fields/<id>
    { hidden: true }
    NO DATA REQUIRED

*2. Modify field: name, type, options
    PATCH http://localhost:8000/api/v1/tabular-fields/<id>
    { name, type, options }
    FIELD, COLUMN DATA

3. Undo hide fields:
    PATCH http://localhost:8000/api/v1/tabular-sheets/<id>
    { fields: [ { id: 12, hidden: true } ] }
    NO DATA NEEDED

DONE
1. Hide sheet
    PATCH http://localhost:8000/api/v1/tabular-sheets/<id>
    { hidden: true }
    NO DATA REQUIRED

DONE
2. Modify sheet
    PATCH http://localhost:8000/api/v1/tabular-sheets/<id>
    { name }
    SHEET INFO

DONE
3. Undo hide sheets
    PATCH http://localhost:8000/api/v1/tabular-books/<id>
    { sheets: [ { id: 12, hidden: true } ] }
    NO DATA NEEDED

1. Save options (in bg)
    PATCH http://localhost:8000/api/v1/tabular-sheets/<id>
    { sorting, searching, sizing }
    NO DATA NEEDED
*/

