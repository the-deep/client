import React, { useState, useMemo, ReactElement, useCallback, useEffect } from 'react';
import { _cs, isNotDefined, isDefined } from '@togglecorp/fujs';
import { VscLoading } from 'react-icons/vsc';
import { IoDownloadOutline, IoClose, IoSearch } from 'react-icons/io5';
import {
    AiOutlineRedo,
    AiFillFilePdf,
    AiFillFileExcel,
    AiFillFileWord,
    AiFillFileText,
} from 'react-icons/ai';
import {
    Pager,
    Button,
    TableView,
    TableColumn,
    useAlert,
    Container,
    PendingMessage,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    SortContext,
    useSortState,
    IconsProps,
    Kraken,
    Icons,
    TextInput,
    DateRangeInput,
    Modal,
} from '@the-deep/deep-ui';
import {
    getErrorObject,
    ObjectSchema,
    useForm,
    removeNull,
    createSubmitHandler,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import { useQuery, useMutation } from '@apollo/client';

import {
    ProjectExportsQuery,
    ProjectExportsQueryVariables,
    ExportDataTypeEnum,
    DeleteExportMutation,
    UpdateExportTitleMutation,
    UpdateExportTitleMutationVariables,
    DeleteExportMutationVariables,
} from '#generated/types';
import {
    convertDateToIsoDateTime,
} from '#utils/common';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { createDateColumn } from '#components/tableHelpers';
import LeadPreview from '#components/lead/LeadPreview';

import _ts from '#ts';

import {
    PROJECT_EXPORTS,
    DELETE_EXPORT,
    UPDATE_EXPORT,
} from './queries';
import TableActions, { Props as TableActionsProps } from './TableActions';
import Status, { Props as StatusProps } from './Status';
import styles from './styles.css';

type ExportItem = NonNullable<NonNullable<NonNullable<NonNullable<ProjectExportsQuery['project']>['exports']>>['results']>[number];

const statusIconMap: Record<ExportItem['status'], ReactElement> = {
    PENDING: <VscLoading />,
    STARTED: <VscLoading />,
    SUCCESS: <IoDownloadOutline />,
    FAILURE: <IoClose />,
    CANCELED: <AiOutlineRedo />,
};
const statusVariantMap: Record<ExportItem['status'], 'default' | 'accent' | 'complement1' | 'complement2'> = {
    PENDING: 'default',
    STARTED: 'default',
    SUCCESS: 'accent',
    FAILURE: 'complement1',
    CANCELED: 'complement2',
};
const statusLabelMap: Record<ExportItem['status'], string> = {
    PENDING: 'In queue to be exported',
    STARTED: 'Generating the file',
    SUCCESS: 'Download',
    FAILURE: 'Failed',
    CANCELED: 'Canceled',
};
const exportFormatIconMap: Record<ExportItem['format'], ReactElement> = {
    DOCX: <AiFillFileWord title="Word export" className={styles.icon} />,
    PDF: <AiFillFilePdf title="PDF export" className={styles.icon} />,
    XLSX: <AiFillFileExcel title="Excel export" className={styles.icon} />,
    JSON: <AiFillFileText title="JSON export" className={styles.icon} />,
};
const maxItemsPerPage = 25;
const defaultSorting = {
    name: 'exportedAt',
    direction: 'Descending',
};

function exportKeySelector(d: ExportItem) {
    return d.id;
}

interface TitleFormFields {
    title: string;
}

type FormType = Partial<TitleFormFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
    }),
};

const initialValue: FormType = {};

interface DateRangeValue {
    startDate: string;
    endDate: string;
}

const debounceTime = 500;

interface Props {
    projectId: string;
    className?: string;
    type: ExportDataTypeEnum[];
}

function ExportHistory(props: Props) {
    const {
        className,
        projectId,
        type,
    } = props;

    const [selectedExport, setSelectedExport] = useState<ExportItem>();
    const [activePage, setActivePage] = useState(1);
    const [exportedAt, setExportedAt] = useState<DateRangeValue>();
    const [searchText, setSearchText] = useState<string>();
    // FIXME: we can safely remove useDebouncedValue if we are using TextInput from deep-ui
    const debouncedSearchText = useDebouncedValue(searchText, debounceTime);

    const handleSetSearchText = useCallback((search: string | undefined) => {
        setSearchText(search);
        setActivePage(1);
    }, []);

    const handleSetExportedAt = useCallback((date: DateRangeValue | undefined) => {
        setExportedAt(date);
        setActivePage(1);
    }, []);

    const alert = useAlert();
    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = useMemo(() => (
        validSorting.direction === 'Ascending'
            ? validSorting.name
            : `-${validSorting.name}`
    ), [validSorting]);

    const variables = useMemo(
        (): ProjectExportsQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ordering,
                exportedAtGte: convertDateToIsoDateTime(exportedAt?.startDate),
                exportedAtLte: convertDateToIsoDateTime(
                    exportedAt?.endDate,
                    { endOfDay: true },
                ),
                search: debouncedSearchText,
                type,
            } : undefined
        ),
        [
            projectId,
            activePage,
            ordering,
            type,
            exportedAt,
            debouncedSearchText,
        ],
    );

    const {
        previousData,
        data: projectExportsResponse = previousData,
        loading: projectExportsPending,
        refetch: getProjectExports,
        startPolling,
        stopPolling,
    } = useQuery<ProjectExportsQuery, ProjectExportsQueryVariables>(
        PROJECT_EXPORTS,
        {
            skip: isNotDefined(variables),
            variables,
            onCompleted: (response) => {
                if ((response.project?.exports?.totalCount ?? 0) < (activePage * maxItemsPerPage)) {
                    setActivePage(1);
                }
            },
        },
    );

    // FIXME: memoize this
    const exports = projectExportsResponse?.project?.exports?.results;
    const shouldPoll = exports?.some(
        (v) => (v.status === 'PENDING' || v.status === 'STARTED'),
    );

    const [exportToEdit, setExportToEdit] = useState<ExportItem | undefined>();

    const {
        pristine: exportToEditPristine,
        value: exportToEditValue,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, initialValue);

    const handleExportEditCancel = useCallback(() => {
        setExportToEdit(undefined);
    }, []);

    const handleExportEditClick = useCallback((data: ExportItem) => {
        setExportToEdit(data);
        setFieldValue(data.title, 'title');
    }, [setFieldValue]);

    useEffect(
        () => {
            if (shouldPoll) {
                startPolling(5000);
            } else {
                stopPolling();
            }
        },
        [shouldPoll, startPolling, stopPolling],
    );

    const [
        deleteExport,
        {
            loading: deleteExportPending,
        },
    ] = useMutation<DeleteExportMutation, DeleteExportMutationVariables>(
        DELETE_EXPORT,
        {
            onCompleted: (response) => {
                if (response?.project?.exportDelete?.ok) {
                    alert.show(
                        _ts('export', 'deleteExportSuccess'),
                        { variant: 'success' },
                    );
                    getProjectExports();
                } else {
                    alert.show(
                        'Failed to delete export.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete export.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const [
        updateExportTitle,
        {
            loading: updateExportTitlePending,
        },
    ] = useMutation<UpdateExportTitleMutation, UpdateExportTitleMutationVariables>(
        UPDATE_EXPORT,
        {
            onCompleted: (response) => {
                if (response?.project?.exportUpdate?.ok) {
                    alert.show(
                        'Successfully renamed the desired export.',
                        {
                            variant: 'success',
                        },
                    );
                } else if (response?.project?.exportUpdate?.errors) {
                    const errors = response?.project?.exportUpdate?.errors;
                    const formError = transformToFormError(
                        removeNull(errors) as ObjectError[],
                    );
                    setError(formError);
                }
            },
            onError: () => {
                alert.show(
                    'Failed to update export title.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleDeleteExport = useCallback((data: ExportItem) => {
        if (data.id === selectedExport?.id) {
            setSelectedExport(undefined);
        }
        deleteExport({
            variables: {
                projectId,
                exportId: data.id,
            },
        });
    }, [deleteExport, projectId, selectedExport]);

    const columns = useMemo(() => {
        const exportTypeColumn: TableColumn<
        ExportItem, string, IconsProps, TableHeaderCellProps
        > = {
            id: 'format',
            title: 'Export Type',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Icons,
            cellRendererClassName: styles.icons,
            columnWidth: '120px',
            cellRendererParams: (_, data) => ({
                children: (
                    exportFormatIconMap[data.format]
                ),
            }),
        };
        const statusColumn: TableColumn<
        ExportItem, string, StatusProps, TableHeaderCellProps
        > = {
            id: 'status',
            title: 'Status',
            cellRendererClassName: styles.status,
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Status,
            columnWidth: '164px',
            cellRendererParams: (_, data) => ({
                icon: statusIconMap[data.status],
                tagVariant: statusVariantMap[data.status],
                status: statusLabelMap[data.status],
                file: data.file?.url,
                children: data.file?.name,
            }),
        };
        const actionsColumn: TableColumn<
        ExportItem, string, TableActionsProps, TableHeaderCellProps
        > = {
            id: 'actions',
            title: '',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: TableActions,
            columnWidth: '120px',
            cellRendererParams: (_, data) => ({
                viewDisabled: data.status === 'PENDING'
                    || data.status === 'STARTED'
                    || data.status === 'FAILURE'
                    || data.id === selectedExport?.id,
                data,
                onDeleteClick: handleDeleteExport,
                onEditClick: handleExportEditClick,
                onViewExportClick: setSelectedExport,
            }),
        };
        return ([
            exportTypeColumn,
            createDateColumn<ExportItem, string>(
                'exportedAt',
                'Exported At',
                (item) => item.exportedAt,
                {
                    sortable: true,
                    columnWidth: '120px',
                    format: 'dd MMM, yyyy hh:mm aaa',
                },
            ),
            createStringColumn<ExportItem, string>(
                'title',
                'Title',
                (item) => item.title,
                {
                    columnWidth: '240px',
                    sortable: true,
                },
            ),
            statusColumn,
            actionsColumn,
        ]);
    }, [
        handleExportEditClick,
        handleDeleteExport,
        selectedExport,
    ]);

    const pending = deleteExportPending;
    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    if (exportToEdit?.id) {
                        updateExportTitle({
                            variables: {
                                projectId,
                                exportId: exportToEdit?.id,
                                newTitle: val.title,
                            },
                        });
                    }
                },
            );
            submit();
        },
        [
            setError,
            validate,
            updateExportTitle,
            projectId,
            exportToEdit,
        ],
    );

    return (
        <Container
            className={_cs(styles.exportHistoryContainer, className)}
            contentClassName={styles.content}
            headerIcons={(
                <div className={styles.headerIcons}>
                    <TextInput
                        name="searchText"
                        autoFocus
                        icons={<IoSearch />}
                        label="Search"
                        placeholder="Search"
                        value={searchText}
                        onChange={handleSetSearchText}
                    />
                    <DateRangeInput
                        name="exportedAt"
                        label="Exported At"
                        value={exportedAt}
                        onChange={handleSetExportedAt}
                    />
                </div>
            )}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={projectExportsResponse?.project?.exports?.totalCount ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                />
            )}
        >
            {pending && (<PendingMessage />)}
            <SortContext.Provider value={sortState}>
                <TableView
                    className={styles.tableView}
                    emptyMessage="Looks like you don't have any exports."
                    data={projectExportsResponse?.project?.exports?.results}
                    keySelector={exportKeySelector}
                    columns={columns}
                    pending={projectExportsPending}
                    errored={false}
                    filtered={isDefined(debouncedSearchText) || isDefined(exportedAt)}
                    filteredEmptyMessage="No matching exports found."
                    filteredEmptyIcon={(
                        <Kraken
                            variant="search"
                            size="large"
                        />
                    )}
                    emptyIcon={(
                        <Kraken
                            variant="coffee"
                            size="large"
                        />
                    )}
                    messageShown
                    messageIconShown
                />
            </SortContext.Provider>
            <Container
                className={styles.exportPreview}
                headingSize="small"
                heading="Preview"
                spacing="none"
                headerClassName={styles.header}
                headingClassName={styles.heading}
                contentClassName={styles.mainContent}
            >
                {isDefined(selectedExport?.file?.url) ? (
                    <LeadPreview
                        className={styles.preview}
                        url={selectedExport?.file?.url}
                    />
                ) : (
                    <div className={styles.label}>
                        {selectedExport?.file ? 'Preview not available.' : 'Select an export to preview it.'}
                    </div>
                )}
            </Container>
            {exportToEdit && (
                <Modal
                    heading="Edit Export Title"
                    onCloseButtonClick={handleExportEditCancel}
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleExportEditCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                type="submit"
                                onClick={handleSubmit}
                                disabled={exportToEditPristine || updateExportTitlePending}
                            >
                                Update
                            </Button>
                        </>
                    )}
                    size="small"
                    freeHeight
                >
                    {updateExportTitlePending && <PendingMessage />}
                    <TextInput
                        name="title"
                        label="Title"
                        value={exportToEditValue?.title}
                        onChange={setFieldValue}
                        error={error?.title}
                    />
                </Modal>
            )}
        </Container>
    );
}

export default ExportHistory;
