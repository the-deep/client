import React, { useState, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    SelectInput,
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    AnalysisReportUploadTypeEnum,
    AnalysisReportUploadsQuery,
    AnalysisReportVariableType,
    AnalysisReportUploadsQueryVariables,
} from '#generated/types';
import {
    read,
    type WorkBook,
} from 'xlsx';

import useDebouncedValue from '#hooks/useDebouncedValue';
import { useRequest } from '#base/utils/restRequest';

import DatasetsConfigureButton from '../DatasetsConfigureButton';
import {
    getRawDataForWorkSheet,
} from '../../utils';

import styles from './styles.css';

const ANALYSIS_REPORT_UPLOADS = gql`
    query AnalysisReportUploads(
        $projectId: ID!,
        $reportId: ID!,
        $search: String,
        $types: [AnalysisReportUploadTypeEnum!],
        $page: Int,
        $pageSize: Int,
    ) {
        project(
            id: $projectId,
        ) {
            id
            analysisReportUploads(
                search: $search,
                report: [$reportId],
                page: $page,
                types: $types,
                pageSize: $pageSize,
            ) {
                results {
                    id
                    file {
                        id
                        file {
                            name
                            url
                        }
                        title
                    }
                    metadata {
                        csv {
                            headerRow
                            variables {
                                clientId
                                completeness
                                name
                                type
                            }
                        }
                        xlsx {
                            sheets {
                                clientId
                                headerRow
                                name
                                variables {
                                    clientId
                                    completeness
                                    name
                                    type
                                }
                            }
                        }
                    }
                    type
                }
                totalCount
                page
                pageSize
            }
        }
    }
`;

export type BasicAnalysisReportUpload = NonNullable<NonNullable<NonNullable<NonNullable<AnalysisReportUploadsQuery['project']>['analysisReportUploads']>['results']>[number]>;
export type Sheet = NonNullable<NonNullable<BasicAnalysisReportUpload['metadata']>['xlsx']>['sheets'][number];

type Def = { containerClassName?: string };
type AnalysisReportUploadSelectInputProps<
    GT extends string,
    NAME extends string
> = SearchSelectInputProps<
    string,
    GT,
    NAME,
    BasicAnalysisReportUpload,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    projectId: string;
    reportId: string;
    types?: AnalysisReportUploadTypeEnum[];
    sheetValue?: string;
    onChange: (newVal: string | undefined, name: NAME) => void;
    onSheetValueChange: (newVal: string | undefined) => void;
    onDataFetch: (
        columns: AnalysisReportVariableType[],
        data: Record<string | number, unknown>[],
    ) => void;
};
const keySelector = (d: BasicAnalysisReportUpload) => d.id;
const labelSelector = (d: BasicAnalysisReportUpload) => d.file.title;

const sheetKeySelector = (d: Sheet) => d.clientId ?? '';
const sheetLabelSelector = (d: Sheet) => d.name ?? '';

function AnalysisReportUploadSelectInput<GT extends string, NAME extends string>(
    props: AnalysisReportUploadSelectInputProps<GT, NAME>,
) {
    const {
        className,
        projectId,
        reportId,
        types,
        value,
        options,
        sheetValue,
        onDataFetch,
        onChange,
        name,
        onSheetValueChange,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const [workBook, setWorkBook] = useState<WorkBook>();
    const debouncedSearchText = useDebouncedValue(searchText);

    const uploadsListQueryVariable = useMemo(
        (): AnalysisReportUploadsQueryVariables => ({
            search: debouncedSearchText,
            projectId,
            reportId,
            types,
            page: 1,
            pageSize: 10,
        }),
        [
            types,
            debouncedSearchText,
            projectId,
            reportId,
        ],
    );

    const {
        data,
        loading,
        fetchMore,
    } = useQuery<AnalysisReportUploadsQuery, AnalysisReportUploadsQueryVariables>(
        ANALYSIS_REPORT_UPLOADS,
        {
            variables: uploadsListQueryVariable,
            skip: !opened,
        },
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...uploadsListQueryVariable,
                page: (data?.project?.analysisReportUploads?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.project) {
                    return previousResult;
                }

                const oldAnalysisReportUploads = previousResult.project.analysisReportUploads;
                const newAnalysisReportUploads = fetchMoreResult?.project?.analysisReportUploads;

                if (!newAnalysisReportUploads) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    project: {
                        ...previousResult.project,
                        userMembers: {
                            ...newAnalysisReportUploads,
                            results: [
                                ...(oldAnalysisReportUploads?.results ?? []),
                                ...(newAnalysisReportUploads.results ?? []),
                            ],
                        },
                    },
                });
            },
        });
    }, [
        fetchMore,
        uploadsListQueryVariable,
        data?.project?.analysisReportUploads?.page,
    ]);

    const selectedFileDetails = useMemo(() => (
        options?.find((item) => item.id === value)
    ), [options, value]);

    const sheetOptions = selectedFileDetails?.metadata?.xlsx?.sheets;

    const onSheetChange = useCallback((newSheetValue: string) => {
        onSheetValueChange(newSheetValue);
        const selectedSheetDetails = selectedFileDetails?.metadata?.xlsx?.sheets?.find(
            (item) => item.clientId === newSheetValue,
        );
        if (!workBook) {
            // eslint-disable-next-line no-console
            console.error('no workbook yet');
            return;
        }
        if (!value || !selectedSheetDetails || !selectedSheetDetails.name) {
            // eslint-disable-next-line no-console
            console.error('no selection');
            return;
        }
        const {
            name: sheetName,
            variables,
            headerRow,
        } = selectedSheetDetails;

        const workSheet = workBook?.Sheets[sheetName];
        const dataInObject = getRawDataForWorkSheet(
            workSheet,
            variables.map((item) => item.clientId ?? ''),
            headerRow ?? 1,
        );
        onDataFetch(variables, dataInObject);
    }, [
        workBook,
        onDataFetch,
        value,
        onSheetValueChange,
        selectedFileDetails,
    ]);

    const onFileChange = useCallback((newFile: string | undefined) => {
        onChange(newFile, name);
        onSheetValueChange(undefined);
    }, [
        onSheetValueChange,
        onChange,
        name,
    ]);

    const {
        pending,
    } = useRequest<File>({
        method: 'GET',
        isFile: true,
        url: selectedFileDetails?.file?.file?.url ?? '',
        skip: !selectedFileDetails?.file?.file?.url,
        onSuccess: (res) => {
            const workBookFromUrl = read(
                res,
                { type: 'binary' },
            );
            setWorkBook(workBookFromUrl);
            if (!sheetValue) {
                return;
            }
            const selectedSheetDetails = selectedFileDetails?.metadata?.xlsx?.sheets?.find(
                (item) => item.clientId === sheetValue,
            );
            if (!selectedSheetDetails || !selectedSheetDetails.name) {
                return;
            }
            const {
                name: sheetName,
                variables,
                headerRow,
            } = selectedSheetDetails;
            const workSheet = workBookFromUrl?.Sheets[sheetName];
            const dataInObject = getRawDataForWorkSheet(
                workSheet,
                variables.map((item) => item.clientId ?? ''),
                headerRow ?? 1,
            );
            onDataFetch(variables, dataInObject);
        },
    });

    return (
        <div className={_cs(styles.datasetSelectInput, className)}>
            <div className={styles.top}>
                <SearchSelectInput
                    {...otherProps}
                    options={options}
                    value={value}
                    className={styles.selectInput}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    name={name}
                    onChange={onFileChange}
                    onSearchValueChange={setSearchText}
                    searchOptions={data?.project?.analysisReportUploads?.results}
                    optionsPending={loading}
                    totalOptionsCount={(
                        data?.project?.analysisReportUploads?.totalCount ?? undefined
                    )}
                    onShowDropdownChange={setOpened}
                    handleShowMoreClick={handleShowMoreClick}
                />
                <DatasetsConfigureButton />
            </div>
            {selectedFileDetails?.type === 'XLSX' && (
                <SelectInput
                    name={undefined}
                    label="Sheet"
                    options={sheetOptions}
                    keySelector={sheetKeySelector}
                    labelSelector={sheetLabelSelector}
                    value={sheetValue}
                    onChange={onSheetChange}
                    nonClearable
                    disabled={pending}
                />
            )}
        </div>
    );
}

export default AnalysisReportUploadSelectInput;
