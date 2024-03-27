import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
    isNotDefined,
    randomString,
    unique,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
    Button,
    ContainerCard,
    ExpandableContainer,
    TextInput,
    NumberInput,
    SelectInput,
    SegmentInput,
    Checkbox,
} from '@the-deep/deep-ui';
import {
    type SetValueArg,
    type Error,
    isCallable,
    getErrorObject,
    useFormObject,
    useFormArray,
    analyzeErrors,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import {
    AnalysisReportVariableType,
    ReportBarChartEnumsQuery,
} from '#generated/types';
import {
    newEnumKeySelector,
    newEnumLabelSelector,
} from '#utils/common';

import DatasetSelectInput, {
    type BasicAnalysisReportUpload,
} from '../../DatasetSelectInput';
import {
    type FinalVerticalAxisType,
    type BarChartConfigType,
    type HorizontalAxisFormType,
    type BarChartStyleFormType,
    type ContentDataType,
} from '../../../schema';
import {
    aggregate,
} from '../../../utils';
import TextElementsStylesEdit from '../TextElementsStylesEdit';
import LegendElementsStylesEdit from '../LegendStylesEdit';
import GridLineStylesEdit from '../GridLineStylesEdit';
import TickStylesEdit from '../TickStylesEdit';
import VerticalAxisInput from './VerticalAxisInput';

import styles from './styles.css';

type VerticalAxisType = FinalVerticalAxisType;

const BAR_CHART_ENUMS = gql`
    query ReportBarChartEnums {
        enums {
            AnalysisReportHorizontalAxisSerializerType {
                description
                enum
                label
            }
            AnalysisReportBarChartConfigurationSerializerType {
                description
                enum
                label
            }
            AnalysisReportBarChartConfigurationSerializerDirection {
                description
                enum
                label
            }
            AnalysisReportVerticalAxisSerializerAggregationType {
                description
                enum
                label
            }
        }
    }
`;

export const defaultBarChartValue: BarChartConfigType = {
    verticalAxisLineVisible: true,
    verticalGridLineVisible: true,
    horizontalAxisLineVisible: true,
    horizontalGridLineVisible: true,
    type: 'SIDE_BY_SIDE',
    direction: 'HORIZONTAL',
    horizontalAxis: {
        type: 'CATEGORICAL' as const,
    },
};

const columnKeySelector = (item: AnalysisReportVariableType) => item.clientId ?? '';
const columnLabelSelector = (item: AnalysisReportVariableType) => item.name ?? '';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: BarChartConfigType | undefined;
    onChange: (value: SetValueArg<BarChartConfigType | undefined>, name: NAME) => void;
    error?: Error<BarChartConfigType>;
    disabled?: boolean;
    contentData: ContentDataType | undefined;
    quantitativeReportUploads: BasicAnalysisReportUpload[] | undefined | null;
    onFileUploadChange: (newFile: string | undefined) => void;
    onCacheChange: (
        newCache: Record<string, string | number | undefined>[] | undefined,
        clientId: string,
    ) => void;
    onQuantitativeReportUploadsChange: React.Dispatch<React.SetStateAction<
        BasicAnalysisReportUpload[] | undefined | null
    >>;
}

function BarChartChartEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        onChange,
        name,
        error: riskyError,
        disabled,
        contentData,
        onFileUploadChange,
        onCacheChange,
        quantitativeReportUploads,
        onQuantitativeReportUploadsChange,
    } = props;

    const {
        data: enumsData,
    } = useQuery<ReportBarChartEnumsQuery>(
        BAR_CHART_ENUMS,
    );

    const {
        horizontalAxisTypeOptions,
        barChartTypeOptions,
        barChartDirectionOptions,
        aggregationTypeOptions,
    } = useMemo(() => ({
        horizontalAxisTypeOptions: enumsData?.enums?.AnalysisReportHorizontalAxisSerializerType,
        barChartTypeOptions: enumsData?.enums?.AnalysisReportBarChartConfigurationSerializerType,
        barChartDirectionOptions: enumsData
            ?.enums?.AnalysisReportBarChartConfigurationSerializerDirection,
        aggregationTypeOptions: enumsData
            ?.enums?.AnalysisReportVerticalAxisSerializerAggregationType,
    }), [enumsData]);

    const error = getErrorObject(riskyError);

    const generalFieldMap: (keyof NonNullable<typeof error>)[] = [
        'title',
        'subTitle',
        'type',
        'direction',
        'horizontalAxis',
        'verticalAxis',
        'horizontalAxisTitle',
        'verticalAxisTitle',
        'legendHeading',
        'horizontalTickLabelRotation',
        'verticalAxisExtendMaximumValue',
        'verticalAxisExtendMinimumValue',
    ];

    const generalHasError = generalFieldMap.some(
        (key) => analyzeErrors(error?.[key]),
    );

    const onFieldChange = useFormObject<
        NAME, BarChartConfigType
    >(name, onChange, {});

    const onHorizontalAxisChange = useFormObject<
        'horizontalAxis', HorizontalAxisFormType
    >('horizontalAxis', onFieldChange, {});

    const {
        upload: selectedFile,
        clientId: selectedClientId,
    } = contentData ?? {};

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

    const {
        setValue: onVerticalAxisChange,
        removeValue: onVerticalAxisRemove,
    } = useFormArray<
        'verticalAxis',
        VerticalAxisType
    >('verticalAxis', onFieldChange);

    const handleAggregationChange = useCallback((
        horizontalAxisField: string | undefined,
        verticalAxis: FinalVerticalAxisType[] | undefined,
    ) => {
        if (
            isNotDefined(horizontalAxisField)
            || !verticalAxis
            || (verticalAxis?.length ?? 0) < 1
        ) {
            return;
        }
        const horizontalKeySelector = (
            data: Record<string | number, unknown>,
        ) => data[horizontalAxisField];

        const axisData = verticalAxis.map((axis) => {
            const verticalKeySelector = (
                data: Record<string | number, unknown>,
            ) => (axis.field ? data[axis.field] : undefined);

            const dataForAxis = aggregate(
                rawData,
                horizontalKeySelector,
                verticalKeySelector,
                axis.aggregationType,
            );
            return dataForAxis?.map((item) => ({
                key: item.key,
                [axis.label ?? axis.clientId]: item.value,
            }));
        }).filter(isDefined);
        const uniqueCategories = unique(axisData.flat().map((item) => item.key));
        const axisDataObjectByX = axisData.map((item) => (
            listToMap(item, (x) => x.key, (x) => x)
        ));
        const zippedData = uniqueCategories.map((item) => {
            const newObj: Record<string, string | number | undefined> = {
                [horizontalAxisField]: item,
            };
            return axisDataObjectByX.reduce((acc, axisIndividualData) => ({
                ...acc,
                ...axisIndividualData[item],
            }), newObj);
        });
        if (selectedClientId) {
            onCacheChange(zippedData, selectedClientId);
        }
    }, [
        onCacheChange,
        selectedClientId,
        rawData,
    ]);

    const handleHorizontalFieldChange = useCallback((newField: string | undefined) => {
        onHorizontalAxisChange(newField, 'field');
        handleAggregationChange(
            newField,
            value?.verticalAxis,
        );
    }, [
        value?.verticalAxis,
        handleAggregationChange,
        onHorizontalAxisChange,
    ]);

    const handleVerticalAxisChange = useCallback((
        newVal: SetValueArg<FinalVerticalAxisType>,
        index: number | undefined,
    ) => {
        onVerticalAxisChange(newVal, index);
        if (isNotDefined(index)) {
            return;
        }

        // TODO: Check if it works with @tnagorra
        const actualVal = !isCallable(newVal) ? newVal : newVal(value?.verticalAxis?.[index]);
        const newVerticalAxis = [...(value?.verticalAxis ?? [])];
        newVerticalAxis.splice(index, 1, actualVal);

        handleAggregationChange(
            value?.horizontalAxis?.field,
            newVerticalAxis,
        );
    }, [
        handleAggregationChange,
        value?.verticalAxis,
        value?.horizontalAxis,
        onVerticalAxisChange,
    ]);

    const verticalAxisError = useMemo(
        () => getErrorObject(error?.verticalAxis),
        [error?.verticalAxis],
    );

    const handleAddVerticalAxis = useCallback(() => {
        onFieldChange(
            (oldValue: BarChartConfigType['verticalAxis']) => {
                const safeOldValue = oldValue ?? [];
                const newClientId = randomString();
                const newVerticalAxis: VerticalAxisType = {
                    clientId: newClientId,
                };
                return [...safeOldValue, newVerticalAxis];
            },
            'verticalAxis',
        );
    }, [onFieldChange]);

    const handleSheetChange = useCallback((item: string | undefined) => {
        onFieldChange(item, 'sheet');
    }, [onFieldChange]);

    const onStyleChange = useFormObject<
        'style', BarChartStyleFormType
    >('style', onFieldChange, {});

    return (
        <div className={_cs(className, styles.barChartEdit)}>
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
                heading={generalHasError ? 'General *' : 'General'}
                headingSize="small"
                spacing="compact"
                errored={generalHasError}
                contentClassName={styles.expandedBody}
                defaultVisibility
                withoutBorder
            >
                <NonFieldError error={error} />
                <TextInput
                    value={value?.title}
                    name="title"
                    label="Title"
                    onChange={onFieldChange}
                    error={error?.title}
                    disabled={disabled}
                />
                <TextInput
                    value={value?.subTitle}
                    name="subTitle"
                    label="Subtitle"
                    onChange={onFieldChange}
                    error={error?.subTitle}
                    disabled={disabled}
                />
                <SegmentInput
                    label="Chart Type"
                    name="type"
                    value={value?.type}
                    onChange={onFieldChange}
                    keySelector={newEnumKeySelector}
                    labelSelector={newEnumLabelSelector}
                    options={barChartTypeOptions ?? []}
                    error={error?.type}
                    spacing="compact"
                />
                <SegmentInput
                    label="Chart Direction"
                    name="direction"
                    value={value?.direction}
                    onChange={onFieldChange}
                    keySelector={newEnumKeySelector}
                    labelSelector={newEnumLabelSelector}
                    options={barChartDirectionOptions ?? []}
                    error={error?.direction}
                    spacing="compact"
                    disabled
                />
                <ContainerCard
                    className={_cs(
                        styles.container,
                        analyzeErrors(error?.horizontalAxis) && styles.errored,
                    )}
                    heading="Horizontal Axis"
                    headingSize="extraSmall"
                    contentClassName={styles.containerContent}
                >
                    <SegmentInput
                        label="Data Type"
                        name="type"
                        value={value?.horizontalAxis?.type}
                        onChange={onHorizontalAxisChange}
                        keySelector={newEnumKeySelector}
                        labelSelector={newEnumLabelSelector}
                        options={horizontalAxisTypeOptions ?? []}
                        error={getErrorObject(error?.horizontalAxis)?.type}
                        spacing="compact"
                    />
                    <SelectInput
                        label="Column"
                        name="field"
                        value={value?.horizontalAxis?.field}
                        onChange={handleHorizontalFieldChange}
                        keySelector={columnKeySelector}
                        labelSelector={columnLabelSelector}
                        options={columns}
                        error={getErrorObject(error?.horizontalAxis)?.field}
                    />
                </ContainerCard>
                <ContainerCard
                    className={_cs(
                        styles.container,
                        analyzeErrors(error?.verticalAxis) && styles.errored,
                    )}
                    heading="Vertical Axis"
                    headingSize="extraSmall"
                    contentClassName={styles.containerContent}
                    headerActions={(
                        <Button
                            title="Add"
                            name={undefined}
                            onClick={handleAddVerticalAxis}
                            className={styles.addButton}
                            variant="tertiary"
                            spacing="compact"
                        >
                            Add Item
                        </Button>
                    )}
                >
                    {value?.verticalAxis?.map((attribute, index) => (
                        <VerticalAxisInput
                            key={attribute.clientId}
                            value={attribute}
                            index={index}
                            onChange={handleVerticalAxisChange}
                            error={verticalAxisError?.[attribute.clientId]}
                            onRemove={onVerticalAxisRemove}
                            aggregationTypeOptions={aggregationTypeOptions ?? []}
                            columns={columns}
                        />
                    ))}
                </ContainerCard>
                <TextInput
                    value={value?.horizontalAxisTitle}
                    name="horizontalAxisTitle"
                    label="Horizontal axis title"
                    onChange={onFieldChange}
                    error={error?.horizontalAxisTitle}
                    disabled={disabled}
                />
                <TextInput
                    value={value?.verticalAxisTitle}
                    name="verticalAxisTitle"
                    label="Vertical axis title"
                    onChange={onFieldChange}
                    error={error?.verticalAxisTitle}
                    disabled={disabled}
                />
                <TextInput
                    value={value?.legendHeading}
                    name="legendHeading"
                    label="Legend heading"
                    onChange={onFieldChange}
                    error={error?.legendHeading}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.horizontalTickLabelRotation}
                    name="horizontalTickLabelRotation"
                    label="Horizontal tick label rotation"
                    onChange={onFieldChange}
                    error={error?.horizontalTickLabelRotation}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.verticalAxisExtendMaximumValue}
                    name="verticalAxisExtendMaximumValue"
                    label="Vertical axis extend maximum value"
                    onChange={onFieldChange}
                    error={error?.verticalAxisExtendMaximumValue}
                    disabled={disabled}
                />
                <NumberInput
                    value={value?.verticalAxisExtendMinimumValue}
                    name="verticalAxisExtendMinimumValue"
                    label="Vertical axis extend minimum value"
                    onChange={onFieldChange}
                    error={error?.verticalAxisExtendMinimumValue}
                    disabled={disabled}
                />
                <Checkbox
                    value={value?.horizontalAxisLineVisible}
                    name="horizontalAxisLineVisible"
                    label="Horizontal axis line visible"
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <Checkbox
                    value={value?.verticalAxisLineVisible}
                    name="verticalAxisLineVisible"
                    label="Vertical axis line visible"
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <Checkbox
                    value={value?.horizontalGridLineVisible}
                    name="horizontalGridLineVisible"
                    label="Horizontal grid line visible"
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <Checkbox
                    value={value?.verticalGridLineVisible}
                    name="verticalGridLineVisible"
                    label="Vertical grid line visible"
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <Checkbox
                    value={value?.horizontalTickVisible}
                    name="horizontalTickVisible"
                    label="Horizontal tick visible"
                    onChange={onFieldChange}
                    disabled={disabled}
                />
                <Checkbox
                    value={value?.verticalTickVisible}
                    name="verticalTickVisible"
                    label="Vertical tick visible"
                    onChange={onFieldChange}
                    disabled={disabled}
                />
            </ExpandableContainer>
            <ExpandableContainer
                heading="Styling"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <TextElementsStylesEdit
                    name="title"
                    label="Title"
                    value={value?.style?.title}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="subTitle"
                    label="Subtitle"
                    value={value?.style?.subTitle}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <LegendElementsStylesEdit
                    name="legend"
                    label="Legend"
                    value={value?.style?.legend}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="horizontalAxisTitle"
                    label="Horizontal Axis Title"
                    value={value?.style?.horizontalAxisTitle}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="horizontalAxisTickLabel"
                    label="Horizontal Tick Label"
                    value={value?.style?.horizontalAxisTickLabel}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="verticalAxisTitle"
                    label="Vertical Axis Title"
                    value={value?.style?.verticalAxisTitle}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TextElementsStylesEdit
                    name="verticalAxisTickLabel"
                    label="Vertical Tick Label"
                    value={value?.style?.verticalAxisTickLabel}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <GridLineStylesEdit
                    name="verticalGridLine"
                    label="Vertical Grid Line"
                    value={value?.style?.verticalGridLine}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <GridLineStylesEdit
                    name="horizontalGridLine"
                    label="Horizontal Grid Line"
                    value={value?.style?.horizontalGridLine}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TickStylesEdit
                    name="verticalTick"
                    label="Vertical Tick"
                    value={value?.style?.verticalTick}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TickStylesEdit
                    name="horizontalTick"
                    label="Horizontal Tick"
                    value={value?.style?.horizontalTick}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
            </ExpandableContainer>
        </div>
    );
}

export default BarChartChartEdit;
