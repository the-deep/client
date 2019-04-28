import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import produce from 'immer';
import memoize from 'memoize-one';
import { connect } from 'react-redux';

import { forEach } from '#rsu/common';
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
import FormattedDate from '#rscv/FormattedDate';

import {
    selectedTabForTabularBookSelector,
    setTabularSelectedTabAction,
} from '#redux';

import {
    listToMap,
    isNotDefined,
    mapToMap,
    mapToList,
} from '@togglecorp/fujs';
import {
    getNaturalNumbers,
    zipWith,
} from '#rsu/functional';

import Cloak from '#components/general/Cloak';
import TriggerAndPoll from '#components/general/TriggerAndPoll';

import {
    createUrlForSheetEdit,
    createUrlForProjectRegions,
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

const getFieldStat = (value) => {
    const invalidCount = value.data.filter(x => x.invalid).length;
    const emptyCount = value.data.filter(x => x.empty).length;
    const totalCount = value.data.length;
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
};

const getFieldMeta = (value) => {
    const newValue = { ...value };
    delete newValue.data;
    return newValue;
};

const transformSheet = (sheet) => {
    const {
        fields,
        options,
        ...other
    } = sheet;

    const columns = {
        ...listToMap(fields, elem => elem.id, elem => elem.data),
        key: getNaturalNumbers(),
    };
    const getObjFromZippedRows = (...zippedRow) => mapToMap(
        columns,
        k => k,
        (k, v, i) => zippedRow[i],
    );
    const rows = [...zipWith(getObjFromZippedRows, ...mapToList(columns))];

    const fieldsStats = listToMap(
        fields,
        value => value.id,
        getFieldStat,
    );

    const fieldsMeta = fields.map(getFieldMeta);

    const newSheet = {
        rows,
        fieldsStats,
        fields: fieldsMeta,
        options: {
            ...options,
            defaultColumnWidth: 250,
        },
        ...other,
    };
    return newSheet;
};

const getSheets = (sheetsFromServer) => {
    const validSheets = sheetsFromServer.filter(
        sheet => sheet.fields.length > 0,
    );

    const sheets = listToMap(
        validSheets,
        sheet => sheet.id,
        transformSheet,
    );
    return sheets;
};

const getTabs = (sheets) => {
    const tabs = {
        ...sheets,
    };
    forEach(tabs, (key, tab) => {
        if (tab.hidden) {
            delete tabs[key];
        }
    });

    return mapToMap(
        tabs,
        k => k,
        sheet => sheet.title,
    );
};

const getTransformSheets = (sheetsFromServer) => {
    const sheets = getSheets(sheetsFromServer);
    const tabs = getTabs(sheets);
    return {
        sheets,
        tabs,
    };
};


const requests = {
    deleteRequest: {
        method: requestMethods.DELETE,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ props }) => {
            props.onDelete();
        },
        onFailure: ({ error: { faramErrors } }) => {
            const displayError = faramErrors
                ? faramErrors.$internal.join(' ')
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
    projectRegionsRequest: {
        method: requestMethods.GET,
        schemaName: 'projectRegionsAdminLevelResponse',
        url: ({ params }) => createUrlForProjectRegions(params.project, ['admin_levels', 'title']),
        onFailure: () => {
            notify.send({
                type: notify.type.ERROR,
                title: _ts('tabular', 'tabularBookTitle'),
                message: _ts('tabular', 'regionDetailsFetchFailed'),
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                type: notify.type.ERROR,
                title: _ts('tabular', 'tabularBookTitle'),
                message: _ts('tabular', 'regionDetailsFetchFailed'),
                duration: notify.duration.SLOW,
            });
        },
    },
};

const propTypes = {
    className: PropTypes.string,
    leadTitle: PropTypes.string,
    bookId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    onDelete: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types

    deleteRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/forbid-prop-types
    projectRegionsRequest: PropTypes.object.isRequired,
    viewMode: PropTypes.bool,
    isModal: PropTypes.bool,

    highlightList: PropTypes.arrayOf(PropTypes.object),
    selectedTab: PropTypes.string,
    setSelectedTab: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    viewMode: false,
    isModal: true,
    leadTitle: '',
    highlightList: [],
    selectedTab: undefined,
};

const mapStateToProps = (state, props) => ({
    selectedTab: selectedTabForTabularBookSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setSelectedTab: params => dispatch(setTabularSelectedTabAction(params)),
});

@RequestCoordinator
@RequestClient(requests)
@connect(mapStateToProps, mapDispatchToProps)
export default class TabularBook extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            // originalSheets: undefined,
            sheets: undefined,
            tabs: undefined,

            entryCount: 0,

            isSomePending: false,
            lastSavedDate: undefined,

            isSheetRetrievePending: false,

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
                const date = new Date();
                this.setState({
                    isSomePending: false,
                    lastSavedDate: date,
                });
            })
            .build();
    }

    componentWillUnmount() {
        this.coordinator.stop();
    }

    getHighlightsFromHighlightList = memoize(highlightList =>
        listToMap(highlightList, d => d.tabularFieldId, d => d))

    getDeletedSheets = memoize(sheets => mapToList(
        sheets,
        s => ({
            title: s.title,
            id: s.id,
            hidden: s.hidden,
        }),
    ).filter(s => s.hidden));


    shouldHideEditButton = ({ leadPermissions }) => (
        this.props.viewMode || !leadPermissions.modify
    );

    shouldHideDeleteButton = ({ leadPermissions }) => (
        this.props.viewMode || !leadPermissions.delete
    );


    handleActiveSheetChange = (selectedTab) => {
        // NOTE: activeSheet was taken from ScrollTabs, so it is a strina
        const {
            setSelectedTab,
            bookId,
        } = this.props;

        setSelectedTab({
            bookId,
            selectedTab: Number(selectedTab),
        });
    }

    handleBookGet = (response, onComplete) => {
        const {
            projectRegionsRequest,
            viewMode,
        } = this.props;

        const {
            project,
            sheets: sheetsFromServer,
            entryCount,
        } = response;

        const {
            sheets,
            tabs,
        } = getTransformSheets(sheetsFromServer);

        this.setState(
            {
                sheets,
                tabs,
                // originalSheets: sheets,
                entryCount,
            },
            () => {
                if (onComplete) {
                    onComplete();
                }
            },
        );

        if (!viewMode) {
            projectRegionsRequest.do({ project });
        }
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
                this.setState((state) => {
                    const newSheets = produce(state.sheets, (safeSheets) => {
                        // eslint-disable-next-line no-param-reassign
                        safeSheets[sheetId].hidden = true;
                    });
                    const newTabs = getTabs(newSheets);
                    return { sheets: newSheets, tabs: newTabs };
                });
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
                this.setState((state) => {
                    const newSheets = produce(state.sheets, (safeSheets) => {
                        // eslint-disable-next-line no-param-reassign
                        safeSheets[sheetId] = {
                            ...safeSheets[sheetId],
                            ...value,
                        };
                    });
                    const newTabs = getTabs(newSheets);
                    return { sheets: newSheets, tabs: newTabs };
                });
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

        const { sheets } = this.state;
        const modification = mapToList(
            sheets,
            (sheet) => {
                const { id, options } = sheet;
                return { id, options };
            },
        );

        const request = new FgRestBuilder()
            .url(createUrlForSheetOptionsSave(bookId))
            .params(() => createParamsForSheetOptionsSave(modification))
            .postLoad(() => {
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

        const { sheets } = this.state;
        const modification = mapToList(
            sheets,
            (sheet) => {
                const { id } = sheet;
                return sheetIdMap[id] ? { id, hidden: false } : { id };
            },
        );

        const request = new FgRestBuilder()
            .url(createUrlForSheetRetrieve(bookId))
            .params(() => createParamsForSheetRetrieve(modification))
            .preLoad(() => {
                this.setState({ isSheetRetrievePending: true });
            })
            .success(() => {
                this.setState((state) => {
                    const newSheets = produce(state.sheets, (safeSheets) => {
                        sheetIds.forEach((sheetId) => {
                            // eslint-disable-next-line no-param-reassign
                            safeSheets[sheetId].hidden = false;
                        });
                    });
                    const newTabs = getTabs(newSheets);
                    return { sheets: newSheets, tabs: newTabs };
                });
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

    handleSheetOptionsChange = (sheetId, options) => {
        clearTimeout(this.backgroundSaveTimeout);

        this.setState(
            state => produce(state, (safeState) => {
                // eslint-disable-next-line no-param-reassign
                safeState.sheets[sheetId].options = options;
            }),
            () => {
                this.backgroundSaveTimeout = setTimeout(this.handleSheetOptionsSave, 2000);
            },
        );
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
                        const fieldIndex = safeState.sheets[sheetId].fields
                            .findIndex(f => f.id === fieldId);
                        // eslint-disable-next-line no-param-reassign
                        safeState.sheets[sheetId].fields[fieldIndex].hidden = true;
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
                        const fieldIndex = safeState.sheets[sheetId].fields.findIndex(
                            f => f.id === fieldId,
                        );
                        // eslint-disable-next-line no-param-reassign
                        safeState.sheets[sheetId].fieldsStats[fieldId] = getFieldStat(response);
                        // eslint-disable-next-line no-param-reassign
                        safeState.sheets[sheetId].fields[fieldIndex] = getFieldMeta(response);
                        // eslint-disable-next-line no-param-reassign
                        safeState.sheets[sheetId].rows = safeState.sheets[sheetId].rows.map(
                            (row, index) => ({
                                ...row,
                                [fieldId]: response.data[index],
                            }),
                        );
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

        const { sheets } = this.state;
        const sheet = sheets[sheetId];
        const modification = mapToList(
            sheet.fields,
            (field) => {
                const { id } = field;
                return fieldIdMap[id] ? { id, hidden: false } : { id };
            },
        );

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
                        fieldIds.forEach((fieldId) => {
                            const fieldIndex = safeState.sheets[sheetId].fields
                                .findIndex(f => f.id === fieldId);
                            // eslint-disable-next-line no-param-reassign
                            safeState.sheets[sheetId].fields[fieldIndex].hidden = false;
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

    tabsRendererParams = (key, data) => ({
        title: data,
        // NOTE: sheetId was taken from key, so it is a string
        sheetId: Number(key),
        deletePending: this.state.sheetDeletePending[key],
        editPending: this.state.sheetEditPending[key],
        // originalSheets: this.state.originalSheets,
        tabs: this.state.tabs,
        sheets: this.state.sheets,
    })

    tabsRenderer = ({
        title, className, sheetId, onClick, deletePending, editPending, // originalSheets,
        tabs, sheets,
    }) => {
        // const { tabs, sheets } = this.getTransformSheets(originalSheets);

        // TODO: memoize this
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
                <Cloak
                    hide={this.shouldHideEditButton}
                    render={
                        <WarningModalButton
                            className={styles.editButton}
                            iconName="edit"
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
                    }
                />
            </div>
        );
    }

    handleZeClick = () => {
        if (window.zE) {
            window.zE.activate({ hideOnClose: true });
        }
    }

    renderBody = ({ invalid, completed, disabled }) => {
        if (invalid) {
            return (
                <Message>
                    {_ts('tabular', 'invalid')}
                </Message>
            );
        }

        const zendeskLinkTitle = _ts('tabular', 'zendeskLinkTitle');
        const zendeskTitle = _ts('tabular', 'zendeskTitle');

        if (!completed) {
            return (
                <div className={styles.extractionProcess} >
                    <LoadingAnimation
                        message={
                            <div className={styles.processingText} >
                                {_ts('tabular', 'processing', {
                                    zendeskLink: (
                                        <button
                                            className={styles.joinLink}
                                            onClick={this.handleZeClick}
                                            title={zendeskLinkTitle}
                                            type="button"
                                        >
                                            {zendeskTitle}
                                        </button>
                                    ),
                                })}
                            </div>
                        }
                        delay={5000}
                    />
                </div>
            );
        }

        const {
            viewMode,
            projectRegionsRequest: {
                response: projectRegions,
            },
            highlightList,
            selectedTab: activeSheet,
        } = this.props;

        const {
            originalSheets,
            isSheetRetrievePending,
            sheetDeletePending,
            fieldRetrievePending,
            fieldDeletePending,
            fieldEditPending,

            tabs,
            sheets,
        } = this.state;

        /*
        const {
            sheets,
            tabs,
            firstTab,
        } = this.getTransformSheets(originalSheets);
        */

        const firstKey = Object.keys(tabs)[0];
        // NOTE: activeSheet was taken from Object.keys, so it is a string
        const firstTab = (firstKey !== undefined) && Number(firstKey);

        const sheetList = this.getDeletedSheets(sheets);

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
                            viewMode={viewMode}
                            projectRegions={projectRegions}
                            highlights={this.getHighlightsFromHighlightList(highlightList)}
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
                        <Cloak
                            hide={this.shouldHideEditButton}
                            render={
                                <ModalButton
                                    iconName="more"
                                    title={_ts('tabular', 'sheetShowButtonTooltip')} // Other Sheets
                                    disabled={sheetList.length <= 0}
                                    transparent
                                    pending={disabledSheetRetrieveModal}
                                    modal={
                                        <SheetRetrieveModal
                                            sheets={sheetList}
                                            onSheetRetrieve={this.handleSheetRetrieve}
                                            disabled={disabledSheetRetrieveModal}
                                        />
                                    }
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
            isModal,
            leadTitle,
        } = this.props;

        const {
            isSomePending,
            lastSavedDate,
            entryCount,
        } = this.state;

        const className = _cs(
            this.props.className,
            styles.tabularBook,
            'tabular-book',
        );

        const Body = this.renderBody;

        const disabled = deletePending || !completed || invalid;
        const body = (
            <Body
                completed={completed}
                invalid={invalid}
                disabled={disabled}
            />
        );

        return (
            <div className={className}>
                {isModal ? (
                    <React.Fragment>
                        <ModalHeader
                            title={_ts('tabular', 'title', { title: leadTitle })}
                            rightComponent={
                                <div className={styles.headerContainer}>
                                    { isSomePending ? (
                                        _ts('tabular', 'tabularSavingMessage')
                                    ) : (
                                        <div className={styles.lastSavedMessage}>
                                            {lastSavedDate &&
                                                _ts(
                                                    'tabular',
                                                    'lastSavedTitle',
                                                    {
                                                        value: (
                                                            <FormattedDate
                                                                className={styles.date}
                                                                value={lastSavedDate}
                                                                mode="dd-MM-yyyy hh:mm"
                                                            />
                                                        ),
                                                    },
                                                )
                                            }
                                        </div>
                                    )}
                                </div>
                            }
                        />
                        <ModalBody className={styles.body}>
                            {body}
                        </ModalBody>
                        <ModalFooter className={styles.footer}>
                            <Cloak
                                hide={this.shouldHideDeleteButton}
                                render={
                                    <DangerConfirmButton
                                        iconName="delete"
                                        onClick={this.handleBookDelete}
                                        confirmationMessage={_ts('tabular', 'deleteMessage', { count: entryCount })}
                                        disabled={disabled || isSomePending}
                                    >
                                        {_ts('tabular', 'deleteButtonLabel')}
                                    </DangerConfirmButton>
                                }
                                renderOnHide={<div />}
                            />
                            <Button
                                onClick={onCancel}
                                disabled={deletePending || isSomePending}
                            >
                                {_ts('tabular', 'closeButtonLabel')}
                            </Button>
                        </ModalFooter>
                    </React.Fragment>
                ) : (
                    <ModalBody className={styles.body}>
                        {body}
                    </ModalBody>
                )}
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
