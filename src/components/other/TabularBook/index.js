import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import produce from 'immer';

import Button from '#rsca/Button';
import WarningButton from '#rsca/Button/WarningButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import modalize from '#rscg/Modalize';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ScrollTabs from '#rscv/ScrollTabs';
import { CoordinatorBuilder } from '#rsu/coordinate';
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

import Cloak from '#components/general/Cloak';
import TriggerAndPoll from '#components/general/TriggerAndPoll';

import {
    createUrlForSheetEdit,
    createParamsForSheetEdit,
    createUrlForSheetDelete,
    createParamsForSheetDelete,
    createUrlForSheetRetrieve,
    createParamsForSheetRetrieve,
    createUrlForSheetOptionsSave,
    createParamsForSheetOptionsSave,
    createUrlForFieldDelete,
    createParamsForFieldDelete,
    createUrlForFieldRetrieve,
    createParamsForFieldRetrieve,
    createUrlForFieldEdit,
    createParamsForFieldEdit,
} from '#rest';
import { iconNames } from '#constants';
import { RequestCoordinator, RequestClient, requestMethods } from '#request';
import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';

import Sheet from './Sheet';
import SheetEditModal from './SheetEditModal';
import SheetRetrieveModal from './SheetRetrieveModal';
import styles from './styles.scss';

const WarningModalButton = modalize(WarningButton);
const ModalButton = modalize(Button);

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

    const rows = [...zipWith(getObjFromZippedRows, ...mapToList(newColumns))];

    const newSheet = {
        rows,
        fieldsStats,
        options: {
            ...options,
            defaultColumnWidth: 250,
        },
        ...other,
    };
    return newSheet;
};

// TODO: memoize this
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

    // NOTE: at least one sheet should be available
    const firstKey = Object.keys(tabs)[0];

    return {
        sheets,
        tabs,
        // NOTE: activeSheet was taken from Object.keys, so it is a strina
        firstTab: (firstKey !== undefined) && Number(firstKey),
    };
};

// TODO: memoize this
const getDeletedSheets = sheets => mapToList(
    sheets,
    s => ({
        title: s.title,
        id: s.id,
        hidden: s.hidden,
    }),
).filter(s => s.hidden);

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
};

const propTypes = {
    className: PropTypes.string,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    onDelete: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types

    deleteRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
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
            originalSheets: undefined,

            isSomePending: false,

            isSheetRetrievePending: false,
            // isSheetOptionsSavePending: false,

            sheetDeletePending: {},
            sheetEditPending: {},

            fieldRetrievePending: {},
            fieldDeletePending: {},
            fieldEditPending: {},
        };

        this.coordinator = new CoordinatorBuilder()
            .maxActiveActors(6)
            .preSession(() => {
                this.setState({ isSomePending: true });
            })
            .postSession(() => {
                this.setState({ isSomePending: false });
            })
            .build();
    }

    componentWillUnmount() {
        this.coordinator.stop();
    }

    handleActiveSheetChange = (activeSheet) => {
        // NOTE: activeSheet was taken from ScrollTabs, so it is a strina
        this.setState({ activeSheet: Number(activeSheet) });
    }

    handleBookGet = (response, onComplete) => {
        this.setState(
            { originalSheets: response.sheets },
            () => {
                if (onComplete) {
                    onComplete();
                }
            },
        );
    }

    handleBookDelete = () => {
        this.props.deleteRequest.do();
    }

    handleSheetDelete = (sheetId) => {
        const requestId = `sheet-delete-${sheetId}`;

        const request = new FgRestBuilder()
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
                    () => this.coordinator.notifyComplete(requestId),
                );
            })
            .build();

        this.coordinator.add(requestId, request);
        this.coordinator.start();
    }

    handleSheetEdit = (sheetId, value) => {
        const requestId = `sheet-edit-${sheetId}`;

        const request = new FgRestBuilder()
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
                    () => this.coordinator.notifyComplete(requestId),
                );
            })
            .build();

        this.coordinator.add(requestId, request);
        this.coordinator.start();
    }

    handleSheetOptionsSave = () => {
        const { bookId } = this.props;

        const requestId = `sheet-save-${bookId}`;
        this.coordinator.remove(requestId);

        const { originalSheets } = this.state;
        const modification = originalSheets.map((sheet) => {
            const { id, options } = sheet;
            return { id, options };
        });

        const request = new FgRestBuilder()
            .url(createUrlForSheetOptionsSave(bookId))
            .params(() => createParamsForSheetOptionsSave(modification))
            /*
            .preLoad(() => {
                this.setState({ isSheetOptionsSavePending: true });
            })
            */
            .postLoad(() => {
                /*
                this.setState(
                    { isSheetOptionsSavePending: false },
                    () => this.coordinator.notifyComplete(requestId),
                );
                */
                this.coordinator.notifyComplete(requestId);
            })
            .build();

        this.coordinator.add(requestId, request);
        this.coordinator.start();
    }

    handleSheetRetrieve = (sheetIds) => {
        const { bookId } = this.props;

        const requestId = `sheet-retrieve-for-${bookId}`;

        const sheetIdMap = listToMap(
            sheetIds,
            id => id,
            () => true,
        );

        const { originalSheets } = this.state;
        const modification = originalSheets.map((sheet) => {
            const { id } = sheet;
            return sheetIdMap[id] ? { id, hidden: false } : { id };
        });

        const request = new FgRestBuilder()
            .url(createUrlForSheetRetrieve(bookId))
            .params(() => createParamsForSheetRetrieve(modification))
            .preLoad(() => {
                this.setState({ isSheetRetrievePending: true });
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
                this.setState(
                    { isSheetRetrievePending: false },
                    () => this.coordinator.notifyComplete(requestId),
                );
            })
            .build();

        this.coordinator.add(requestId, request);
        this.coordinator.start();
    }

    handleFieldDelete = (sheetId, fieldId) => {
        const requestId = `field-delete-${fieldId}`;

        const request = new FgRestBuilder()
            .url(createUrlForFieldDelete(fieldId))
            .params(createParamsForFieldDelete)
            .preLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        safeState.fieldDeletePending[fieldId] = true;
                    }),
                );
            })
            .success(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        const sheetIndex = safeState.originalSheets.findIndex(
                            s => s.id === sheetId,
                        );
                        const fieldIndex = safeState.originalSheets[sheetIndex].fields
                            .findIndex(f => f.id === fieldId);
                        // eslint-disable-next-line no-param-reassign
                        safeState.originalSheets[sheetIndex].fields[fieldIndex].hidden = true;
                    }),
                );
            })
            .postLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        delete safeState.fieldDeletePending[fieldId];
                    }),
                    () => this.coordinator.notifyComplete(requestId),
                );
            })
            .build();

        this.coordinator.add(requestId, request);
        this.coordinator.start();
    }

    handleFieldEdit = (sheetId, fieldId, value) => {
        const requestId = `field-edit-${fieldId}`;
        const request = new FgRestBuilder()
            .url(createUrlForFieldEdit(fieldId))
            .params(() => createParamsForFieldEdit(value))
            .preLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        safeState.fieldEditPending[fieldId] = true;
                    }),
                );
            })
            .success((response) => {
                this.setState(
                    state => produce(state, (safeState) => {
                        const sheetIndex = safeState.originalSheets.findIndex(
                            s => s.id === sheetId,
                        );
                        const fieldIndex = safeState.originalSheets[sheetIndex].fields.findIndex(
                            f => f.id === fieldId,
                        );
                        // eslint-disable-next-line no-param-reassign
                        safeState.originalSheets[sheetIndex].data.columns[fieldId] = (
                            response.fieldData
                        );
                        // eslint-disable-next-line no-param-reassign
                        safeState.originalSheets[sheetIndex].fields[fieldIndex] = response.field;
                    }),
                );
            })
            .postLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        delete safeState.fieldEditPending[fieldId];
                    }),
                    () => this.coordinator.notifyComplete(requestId),
                );
            })
            .build();

        this.coordinator.add(requestId, request);
        this.coordinator.start();
    }

    handleFieldRetrieve = (sheetId, fieldIds) => {
        const requestId = `field-retrieve-for-${sheetId}`;

        const fieldIdMap = listToMap(
            fieldIds,
            id => id,
            () => true,
        );

        const { originalSheets } = this.state;
        const sheet = originalSheets.find(s => s.id === sheetId);
        const modification = sheet.fields.map((field) => {
            const { id } = field;
            return fieldIdMap[id] ? { id, hidden: false } : { id };
        });

        const request = new FgRestBuilder()
            .url(createUrlForFieldRetrieve(sheetId))
            .params(() => createParamsForFieldRetrieve(modification))
            .preLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        safeState.fieldRetrievePending[sheetId] = true;
                    }),
                );
            })
            .success(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        const sheetIndex = safeState.originalSheets.findIndex(
                            s => s.id === sheetId,
                        );
                        fieldIds.forEach((fieldId) => {
                            const fieldIndex = safeState.originalSheets[sheetIndex].fields
                                .findIndex(f => f.id === fieldId);
                            // eslint-disable-next-line no-param-reassign
                            safeState.originalSheets[sheetIndex].fields[fieldIndex].hidden = false;
                        });
                    }),
                );
            })
            .postLoad(() => {
                this.setState(
                    state => produce(state, (safeState) => {
                        // eslint-disable-next-line no-param-reassign
                        safeState.fieldRetrievePending[sheetId] = false;
                    }),
                    () => this.coordinator.notifyComplete(requestId),
                );
            })
            .build();

        this.coordinator.add(requestId, request);
        this.coordinator.start();
    }

    handleSheetOptionsChange = (sheetId, options) => {
        this.setState(
            state => produce(state, (safeState) => {
                const sheetIndex = safeState.originalSheets.findIndex(
                    s => s.id === sheetId,
                );
                // eslint-disable-next-line no-param-reassign
                safeState.originalSheets[sheetIndex].options = options;
            }),
        );

        clearTimeout(this.backgroundSaveTimeout);
        this.backgroundSaveTimeout = setTimeout(this.handleSheetOptionsSave, 2000);
    }

    tabsRendererParams = (key, data) => ({
        title: data,
        // NOTE: sheetId was taken from key, so it is a string
        sheetId: Number(key),
        deletePending: this.state.sheetDeletePending[key],
        editPending: this.state.sheetEditPending[key],
        originalSheets: this.state.originalSheets,
    })

    tabsRenderer = ({
        title, className, sheetId, onClick, deletePending, editPending, originalSheets,
    }) => {
        const { tabs, sheets } = transformSheets(originalSheets);
        // FIXME: memoize this
        const tabKeys = Object.keys(tabs);

        const sheet = sheets[sheetId];

        const disabledSheetEditModal = deletePending || editPending;
        const disabledSheetEditModalDelete = tabKeys.length <= 1;

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
                    title={_ts('tabular', 'sheetEditButtonTooltip')} // Edit
                    pending={disabledSheetEditModal}
                    modal={
                        <SheetEditModal
                            sheetId={sheetId}
                            title={sheet.title}
                            onSheetDelete={this.handleSheetDelete}
                            onSheetEdit={this.handleSheetEdit}
                            disabled={disabledSheetEditModal}
                            disabledDelete={disabledSheetEditModalDelete}
                        />
                    }
                />
            </div>
        );
    }

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
            isSheetRetrievePending,
            sheetDeletePending,
            fieldRetrievePending,
            fieldDeletePending,
            fieldEditPending,
        } = this.state;

        const {
            sheets,
            tabs,
            firstTab,
        } = transformSheets(originalSheets);

        const sheetList = getDeletedSheets(sheets);

        const activeSheetKey = (!activeSheet || !sheets[activeSheet] || sheets[activeSheet].hidden)
            ? firstTab
            : activeSheet;

        const disabledSheetRetrieveModal = isSheetRetrievePending;

        const sheet = sheets[activeSheetKey];
        const disabledSheet = sheetDeletePending[activeSheetKey];
        const isFieldRetrievePending = fieldRetrievePending[activeSheetKey];

        return (
            <Fragment>
                { disabled && <LoadingAnimation /> }
                {
                    isNotDefined(sheet) ? (
                        <Message>
                            {_ts('tabular', 'noSheets')}
                        </Message>
                    ) : (
                        <Sheet
                            // NOTE: dismount on different activeSheet
                            key={activeSheetKey}
                            className={styles.sheetView}
                            sheet={sheet}
                            sheetId={activeSheetKey}
                            onSheetOptionsChange={this.handleSheetOptionsChange}
                            disabled={disabledSheet}
                            onFieldRetrieve={this.handleFieldRetrieve}
                            isFieldRetrievePending={isFieldRetrievePending}
                            onFieldDelete={this.handleFieldDelete}
                            fieldDeletePending={fieldDeletePending}
                            fieldEditPending={fieldEditPending}
                            onFieldEdit={this.handleFieldEdit}
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
                            title={_ts('tabular', 'sheetShowButtonTooltip')} // Other Sheets
                            disabled={sheetList.length <= 0}
                            pending={disabledSheetRetrieveModal}
                            modal={
                                <SheetRetrieveModal
                                    sheets={sheetList}
                                    onSheetRetrieve={this.handleSheetRetrieve}
                                    disabled={disabledSheetRetrieveModal}
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
            onCancel,
        } = this.props;
        const { isSomePending } = this.state;

        const className = _cs(
            this.props.className,
            styles.tabularBook,
            'tabular-book',
        );

        const Body = this.renderBody;

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
                                    { isSomePending &&
                                        <div className={styles.pendingMessage}>
                                            {
                                                // Saving...
                                                _ts('tabular', 'tabularSavingMessage')
                                            }
                                        </div>
                                    }
                                    <DangerConfirmButton
                                        iconName={iconNames.delete}
                                        onClick={this.handleBookDelete}
                                        confirmationMessage={_ts('tabular', 'deleteMessage')}
                                        disabled={disabled || isSomePending}
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
                onDataReceived={this.handleBookGet}
                url={`/tabular-books/${bookId}/`}
                triggerUrl={`/tabular-extraction-trigger/${bookId}/`}
                // schemaName="TabularBookSchema"
            >
                <ActualTabularBook />
            </TriggerAndPoll>
        );
    }
}
