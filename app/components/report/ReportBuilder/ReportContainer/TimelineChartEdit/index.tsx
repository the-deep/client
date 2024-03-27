import React, { useState, useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import { useParams } from 'react-router-dom';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    useFormObject,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import {
    ExpandableContainer,
    SelectInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import {
    AnalysisReportVariableType,
} from '#generated/types';

import DatasetSelectInput, {
    type BasicAnalysisReportUpload,
} from '../../DatasetSelectInput';
import {
    type TimelineChartConfigType,
    type ContentDataType,
} from '../../../schema';

import styles from './styles.css';

export interface Metadata {
    clientId: string;
    completeness?: number;
    name: string;
    type: 'TEXT' | 'DATE' | 'NUMBER' | 'BOOLEAN' | undefined;
}

const columnLabelSelector = (col: AnalysisReportVariableType) => col.name ?? '';
const columnKeySelector = (col: AnalysisReportVariableType) => col.clientId ?? '';

interface Props<NAME extends string> {
    className?: string;
    name: NAME;
    value: TimelineChartConfigType | undefined;
    onChange: (value: SetValueArg<TimelineChartConfigType | undefined>, name: NAME) => void;
    error?: Error<TimelineChartConfigType>;
    contentData: ContentDataType | undefined;
    onFileUploadChange: (newFile: string | undefined) => void;
    quantitativeReportUploads: BasicAnalysisReportUpload[] | undefined | null;
    onQuantitativeReportUploadsChange: React.Dispatch<React.SetStateAction<
        BasicAnalysisReportUpload[] | undefined | null
    >>;
    onCacheChange: (
        newCache: Record<string, string | number | undefined>[] | undefined,
        clientId: string,
    ) => void;
}

function TimelineChartEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        name,
        contentData,
        onFileUploadChange,
        quantitativeReportUploads,
        onQuantitativeReportUploadsChange,
        onCacheChange,
    } = props;

    const onFieldChange = useFormObject<
        NAME, TimelineChartConfigType
    >(name, onChange, {});

    const {
        upload: selectedFile,
        clientId: selectedClientId,
    } = contentData ?? {};

    const error = getErrorObject(riskyError);

    const generalFieldMap: (keyof NonNullable<typeof error>)[] = [
        'title',
        'date',
        'detail',
        'category',
        'source',
        'sourceUrl',
    ];

    const configurationHasError = generalFieldMap.some(
        (key) => analyzeErrors(error?.[key]),
    );

    const {
        reportId,
        projectId,
    } = useParams<{
        projectId: string | undefined,
        reportId: string | undefined,
    }>();

    const [rawData, setRawData] = useState<Record<string | number, unknown>[]>();
    const [columns, setColumns] = useState<AnalysisReportVariableType[]>();

    const handleDataFetch = useCallback((
        columnsFromData: AnalysisReportVariableType[],
        data: Record<string | number, unknown>[],
    ) => {
        setRawData(data);
        setColumns(columnsFromData);
    }, []);

    const handleCacheCalculation = useCallback((newConfig: TimelineChartConfigType) => {
        const cacheData = rawData?.map((item) => {
            const {
                title,
                date,
                detail,
                category,
                source,
                sourceUrl,
            } = newConfig;

            if (
                !title
                || !date
                || Number.isNaN(new Date(String(item[date])).getTime())
            ) {
                return undefined;
            }

            return ({
                title: item[title],
                date: item[date],
                details: detail ? item[detail] : item[title],
                category: category ? item[category] : undefined,
                source: source ? item[source] : undefined,
                sourceUrl: sourceUrl ? item[sourceUrl] : undefined,
            });
        }).filter(isDefined);

        if (selectedClientId) {
            onCacheChange(
                cacheData as Record<string, string | number | undefined>[],
                selectedClientId,
            );
        }
    }, [
        onCacheChange,
        selectedClientId,
        rawData,
    ]);

    const handleSheetChange = useCallback((item: string | undefined) => {
        onFieldChange(item, 'sheet');
    }, [onFieldChange]);

    const handleFieldChange = useCallback((
        newDate: string | undefined,
        fieldName: 'date' | 'title' | 'detail' | 'category' | 'source' | 'sourceUrl',
    ) => {
        handleCacheCalculation({
            ...value,
            [fieldName]: newDate,
        });
        onFieldChange(newDate, fieldName);
    }, [
        onFieldChange,
        value,
        handleCacheCalculation,
    ]);

    const textColumns = columns?.filter(
        (datum) => datum.type === 'TEXT',
    );

    const dateColumns = columns?.filter(
        (datum) => datum.type === 'DATE',
    );

    return (
        <div className={_cs(className, styles.timelineChartEdit)}>
            <NonFieldError error={error} />
            {projectId && reportId && (
                <DatasetSelectInput
                    name=""
                    value={selectedFile}
                    onChange={onFileUploadChange}
                    projectId={projectId}
                    reportId={reportId}
                    options={quantitativeReportUploads}
                    label="Dataset"
                    onOptionsChange={onQuantitativeReportUploadsChange}
                    types={['XLSX']}
                    sheetValue={value?.sheet}
                    onSheetValueChange={handleSheetChange}
                    onDataFetch={handleDataFetch}
                />
            )}
            <ExpandableContainer
                heading={configurationHasError ? 'Configure*' : 'Configure'}
                headingSize="small"
                errored={configurationHasError}
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <SelectInput
                    name="date"
                    label="Date selector"
                    options={dateColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.date}
                    onChange={handleFieldChange}
                    error={error?.date}
                />
                <SelectInput
                    name="title"
                    label="Title selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.title}
                    onChange={handleFieldChange}
                    error={error?.title}
                />
                <SelectInput
                    name="detail"
                    label="Description selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.detail}
                    onChange={handleFieldChange}
                    error={error?.detail}
                />
                <SelectInput
                    name="category"
                    label="Category selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.category}
                    onChange={handleFieldChange}
                    error={error?.category}
                />
                <SelectInput
                    name="source"
                    label="Source selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.source}
                    onChange={handleFieldChange}
                    error={error?.source}
                />
                <SelectInput
                    name="sourceUrl"
                    label="Source URL selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.sourceUrl}
                    onChange={handleFieldChange}
                    error={error?.sourceUrl}
                />
            </ExpandableContainer>
        </div>
    );
}

export default TimelineChartEdit;
