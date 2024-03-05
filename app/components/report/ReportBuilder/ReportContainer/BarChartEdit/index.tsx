import React, { useMemo, useCallback, useState } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
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
    getErrorObject,
    useFormObject,
    useFormArray,
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

    const onFieldChange = useFormObject<
        NAME, BarChartConfigType
    >(name, onChange, {});

    const onHorizontalAxisChange = useFormObject<
        'horizontalAxis', HorizontalAxisFormType
    >('horizontalAxis', onFieldChange, {});

    const {
        upload: selectedFile,
        clientId: selectedFileClientId,
    } = contentData ?? {};

    const {
        reportId,
        projectId,
    } = useParams<{
        projectId: string | undefined,
        reportId: string | undefined,
    }>();

    const [rawData, setRawData] = useState<unknown[]>();
    const [columns, setColumns] = useState<AnalysisReportVariableType[]>();

    const handleDataFetch = useCallback((
        columnsFromData: AnalysisReportVariableType[],
        data: unknown[],
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
                    name="here"
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
                heading="General"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                defaultVisibility
                withoutBorder
            >
                <ContainerCard
                    className={styles.container}
                    heading="Horizontal Axis"
                    headingSize="extraSmall"
                    spacing="compact"
                >
                    <SelectInput
                        label="Column"
                        name="field"
                        value={value?.horizontalAxis?.field}
                        onChange={onHorizontalAxisChange}
                        keySelector={columnKeySelector}
                        labelSelector={columnLabelSelector}
                        options={columns}
                        error={getErrorObject(error?.horizontalAxis)?.field}
                    />
                    <SegmentInput
                        label="Data Type"
                        name="type"
                        value={value?.horizontalAxis?.type}
                        onChange={onHorizontalAxisChange}
                        keySelector={newEnumKeySelector}
                        labelSelector={newEnumLabelSelector}
                        options={horizontalAxisTypeOptions ?? []}
                        error={getErrorObject(error?.horizontalAxis)?.type}
                    />
                </ContainerCard>
                <ContainerCard
                    className={styles.container}
                    heading="Vertical Axis"
                    headingSize="extraSmall"
                    spacing="compact"
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
                            onChange={onVerticalAxisChange}
                            error={verticalAxisError?.[attribute.clientId]}
                            onRemove={onVerticalAxisRemove}
                            aggregationTypeOptions={aggregationTypeOptions ?? []}
                            columns={columns}
                        />
                    ))}
                </ContainerCard>
                <SegmentInput
                    label="Chart Type"
                    name="type"
                    value={value?.type}
                    onChange={onFieldChange}
                    keySelector={newEnumKeySelector}
                    labelSelector={newEnumLabelSelector}
                    options={barChartTypeOptions ?? []}
                    error={error?.type}
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
                />
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
                    label="Vertical Grid Label"
                    value={value?.style?.verticalGridLine}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <GridLineStylesEdit
                    name="horizontalGridLine"
                    label="Horizontal Grid Label"
                    value={value?.style?.horizontalGridLine}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TickStylesEdit
                    name="verticalTick"
                    label="Vertical Grid Label"
                    value={value?.style?.verticalTick}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
                <TickStylesEdit
                    name="horizontalTick"
                    label="Horizontal Grid Label"
                    value={value?.style?.horizontalTick}
                    onChange={onStyleChange}
                    disabled={disabled}
                />
            </ExpandableContainer>
        </div>
    );
}

export default BarChartChartEdit;
