import React, { useMemo, useCallback } from 'react';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormObject,
    useFormArray,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import {
    _cs,
    sum,
    isDefined,
    randomString,
    compareNumber,
} from '@togglecorp/fujs';
import {
    Message,
    Kraken,
    Footer,
    Button,
    SegmentInput,
    NumberInput,
    QuickActionDropdownMenu,
    Container,
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import {
    IoAdd,
    IoTrashOutline,
    IoPencil,
} from 'react-icons/io5';

import Portal from '#components/Portal';
import { useModalState } from '#hooks/stateManagement';
import NonFieldError from '#components/NonFieldError';
import {
    AnalysisReportUploadType,
    AnalysisReportContainerContentTypeEnum,
} from '#generated/types';
import { BasicAnalysisReportUpload } from '#components/report/ReportBuilder/DatasetSelectInput';

import {
    type PartialFormType,
    type ContentConfigType,
    type ReportContainerType,
    type ContentDataType,
    type ContainerStyleFormType,
    type ConfigType,
} from '../../schema';

import ContentAddModal from './ContentAddModal';
import HeadingEdit from './HeadingEdit';
import ContainerStylesEdit from './ContainerStylesEdit';
import UrlEdit from './UrlEdit';
import KpiEdit from './KpiEdit';
import TextEdit from './TextEdit';
import TimelineChartEdit from './TimelineChartEdit';
import BarChartEdit from './BarChartEdit';
import ImageEdit from './ImageEdit';
import Content from './Content';
import {
    resolveContainerStyle,
} from '../../utils';

import styles from './styles.css';

const widthSelector = (item: { width: number }) => item.width;
// FIXME: Optimize reorder function by not editing the object is new
// order is equal to old order
export function reorder<T>(
    data: T[],
    orderKey = 'order',
): T[] {
    return data.map((v, i) => ({ ...v, [orderKey]: i + 1 }));
}

export interface Props {
    className?: string;
    row?: number;
    column?: number;
    width?: number;
    height?: number;
    containerKey?: string;
    reportId?: string;
    contentData: ContentDataType[] | undefined;
    allItems: ReportContainerType[] | undefined;
    error: Error<ReportContainerType> | undefined;
    contentType: AnalysisReportContainerContentTypeEnum | undefined;
    configuration: ContentConfigType | undefined;
    generalConfiguration: ConfigType | undefined;
    setFieldValue: ((...entries: EntriesAsList<PartialFormType>) => void);
    style: ContainerStyleFormType | undefined;
    quantitativeReportUploads: BasicAnalysisReportUpload[] | undefined | null;
    onQuantitativeReportUploadsChange: React.Dispatch<React.SetStateAction<
        BasicAnalysisReportUpload[] | undefined | null
    >>;
    imageReportUploads: BasicAnalysisReportUpload[] | undefined | null;
    onImageReportUploadsChange: React.Dispatch<React.SetStateAction<
        BasicAnalysisReportUpload[] | undefined | null
    >>;
    readOnly?: boolean;
    disabled?: boolean;
    leftContentRef: React.RefObject<HTMLDivElement> | undefined;
    onContentEditChange: (newVal: string | undefined) => void;
    isBeingEdited: boolean;
}

function ReportContainer(props: Props) {
    const {
        className,
        contentType,
        error: riskyError,
        row = 1,
        column = 1,
        width = 1,
        reportId,
        allItems,
        style,
        configuration,
        height,
        containerKey,
        contentData,
        setFieldValue,
        readOnly,
        disabled,
        generalConfiguration,
        isBeingEdited,
        onContentEditChange,
        leftContentRef,
        imageReportUploads,
        onImageReportUploadsChange,
        quantitativeReportUploads,
        onQuantitativeReportUploadsChange,
    } = props;

    const index = useMemo(() => (
        allItems?.findIndex((item) => item.clientId === containerKey)
    ), [allItems, containerKey]);

    const error = getErrorObject(riskyError);

    const {
        setValue: onReportContainerChange,
        removeValue,
    } = useFormArray(
        'containers',
        setFieldValue,
    );

    const handleItemRemove = useCallback(() => {
        if (isDefined(index)) {
            removeValue(index);
        }
    }, [
        index,
        removeValue,
    ]);

    const onFieldChange = useFormObject(
        index,
        onReportContainerChange,
        () => ({
            row,
            column: column + 1,
            width: 1,
            clientId: randomString(),
        }),
    );

    const [
        contentAddModalVisible,
        showContentAddModal,
        hideContentAddModal,
    ] = useModalState(false);

    const handleContentEdit = useCallback(() => {
        onContentEditChange(containerKey);
    }, [
        containerKey,
        onContentEditChange,
    ]);

    const handleContentEditClose = useCallback(() => {
        onContentEditChange(undefined);
    }, [
        onContentEditChange,
    ]);

    const rowItems = useMemo(() => {
        const items = allItems?.filter((item) => item.row === row);
        const newItems = [...(items ?? [])];
        newItems.sort((a, b) => compareNumber(a.column, b.column));
        return newItems;
    }, [
        allItems,
        row,
    ]);

    const indexInCurrentRow = useMemo(() => (
        rowItems.findIndex((item) => item.column === column)
    ), [rowItems, column]);

    const totalColSpan = useMemo(() => (
        sum(rowItems.map((item) => item.width).filter(isDefined))
    ), [rowItems]);

    const widthOptions = useMemo(() => (
        // NOTE: Providing options to set content to a minimum of 3 units
        Array.from({ length: (12 - (totalColSpan - width)) - 2 }, (_, i) => ({ width: i + 3 }))
    ), [totalColSpan, width]);

    const disableAddButtons = totalColSpan >= 12;

    const handleAddBeforeClick = useCallback(() => {
        const newRowItems = [...rowItems];
        const newItem = {
            row,
            column,
            clientId: randomString(),
            width: 12 - totalColSpan,
        };
        newRowItems.splice(indexInCurrentRow, 0, newItem);
        const orderedItems = reorder(newRowItems, 'column');

        setFieldValue((oldVal: ReportContainerType[] | undefined = []) => {
            const newVal = oldVal.filter((item) => item.row !== row);
            const newItems = [
                ...newVal,
                ...orderedItems,
            ];
            newItems.sort((a, b) => (
                compareNumber(a.row, b.row) || compareNumber(a.column, b.column)
            ));

            return newItems;
        }, 'containers');
    }, [
        setFieldValue,
        indexInCurrentRow,
        row,
        totalColSpan,
        rowItems,
        column,
    ]);

    const handleAddAfterClick = useCallback(() => {
        const newRowItems = [...rowItems];
        const newItem = {
            row,
            column: column + 1,
            clientId: randomString(),
            width: 12 - totalColSpan,
        };
        newRowItems.splice(indexInCurrentRow + 1, 0, newItem);
        const orderedItems = reorder(newRowItems, 'column');

        setFieldValue((oldVal: ReportContainerType[] | undefined = []) => {
            const newVal = oldVal.filter((item) => item.row !== row);
            const newItems = [
                ...newVal,
                ...orderedItems,
            ];
            newItems.sort((a, b) => (
                compareNumber(a.row, b.row) || compareNumber(a.column, b.column)
            ));

            return newItems;
        }, 'containers');
    }, [
        setFieldValue,
        indexInCurrentRow,
        row,
        totalColSpan,
        rowItems,
        column,
    ]);

    const handleAddAboveClick = useCallback(() => {
        setFieldValue((oldVal: ReportContainerType[] | undefined = []) => {
            const newItems = [...oldVal];
            const newItem = {
                row,
                column: 1,
                clientId: randomString(),
                width: 6,
            };
            const indexOfCurrentRowBefore = oldVal.findIndex((item) => item.row === row);
            newItems.splice(indexOfCurrentRowBefore, 0, newItem);
            return newItems.map((item) => ({
                ...item,
                // NOTE: Only updating row values of items that appear after the new item
                row: ((item.row ?? 0) >= newItem.row && item.clientId !== newItem.clientId)
                    ? ((item.row ?? 0) + 1)
                    : item.row,
            }));
        }, 'containers');
    }, [
        setFieldValue,
        row,
    ]);

    const handleAddBelowClick = useCallback(() => {
        setFieldValue((oldVal: ReportContainerType[] | undefined = []) => {
            const newItems = [...oldVal];
            const newItem = {
                row: row + 1,
                column: 1,
                clientId: randomString(),
                width: 6,
            };
            const indexOfRow = oldVal.findIndex((item) => item.row === row);
            newItems.splice(indexOfRow + 1, 0, newItem);
            return newItems.map((item) => ({
                ...item,
                // NOTE: Only updating row values of items that appear after the new item
                row: ((item.row ?? 0) >= newItem.row && item.clientId !== newItem.clientId)
                    ? ((item.row ?? 0) + 1)
                    : item.row,
            }));
        }, 'containers');
    }, [
        setFieldValue,
        row,
    ]);

    const handleContentAddClick = useCallback((
        newContentType: AnalysisReportContainerContentTypeEnum,
    ) => {
        hideContentAddModal();
        handleContentEdit();
        onFieldChange(newContentType, 'contentType');
    }, [
        onFieldChange,
        handleContentEdit,
        hideContentAddModal,
    ]);

    const onConfigChange = useFormObject<
        'contentConfiguration', ContentConfigType
    >('contentConfiguration', onFieldChange, {});

    const handleImageFileUploadChange = useCallback((file: AnalysisReportUploadType) => {
        const newClientId = randomString();
        onFieldChange([
            {
                upload: file.id,
                clientId: newClientId,
            },
        ], 'contentData');
        onImageReportUploadsChange((oldFiles) => ([
            file,
            ...(oldFiles ?? []),
        ]));
    }, [
        onImageReportUploadsChange,
        onFieldChange,
    ]);

    const handleBarChartFileUploadChange = useCallback((file: string | undefined) => {
        if (!file) {
            onFieldChange(undefined, 'contentData');
        }
        const newClientId = randomString();
        onFieldChange([
            {
                upload: file,
                clientId: newClientId,
            },
        ], 'contentData');
    }, [onFieldChange]);

    const isErrored = analyzeErrors(error);

    const containerStyles = resolveContainerStyle(style, generalConfiguration?.containerStyle);

    const heading = useMemo(() => {
        if (contentType !== 'HEADING') {
            return undefined;
        }
        // NOTE: heading is used as id, so replacing space with dash for better
        // looking div ids
        return configuration?.heading?.content?.replace(' ', '-');
    }, [
        contentType,
        configuration?.heading,
    ]);

    return (
        <div
            id={heading}
            className={_cs(
                className,
                styles.reportContainer,
                isErrored && styles.errored,
                isBeingEdited && styles.selected,
                readOnly && styles.readOnly,
            )}
            style={{
                ...containerStyles,
                height: `${height}px`,
                gridRow: row,
                gridColumn: `span ${width}`,
            }}
        >
            <NonFieldError error={error} />
            {!contentType && (
                <Message
                    className={styles.message}
                    message="No content yet."
                    icon={(
                        <Kraken
                            variant="sleep"
                            size="extraSmall"
                        />
                    )}
                    actions={!readOnly && (
                        <Button
                            name={undefined}
                            onClick={showContentAddModal}
                            variant="tertiary"
                            spacing="compact"
                        >
                            Add content
                        </Button>
                    )}
                />
            )}
            {contentType && (
                <Content
                    contentType={contentType}
                    configuration={configuration}
                    generalConfiguration={generalConfiguration}
                    contentData={contentData}
                    imageReportUploads={imageReportUploads}
                    quantitativeReportUploads={quantitativeReportUploads}
                />
            )}
            {!readOnly && (
                <>
                    <QuickActionButton
                        className={_cs(styles.beforeButton, styles.addButton)}
                        name={undefined}
                        onClick={handleAddBeforeClick}
                        disabled={disableAddButtons || disabled}
                        variant="tertiary"
                        spacing="compact"
                    >
                        <IoAdd />
                    </QuickActionButton>
                    <QuickActionButton
                        className={_cs(styles.afterButton, styles.addButton)}
                        name={undefined}
                        onClick={handleAddAfterClick}
                        disabled={disableAddButtons || disabled}
                        variant="tertiary"
                        spacing="compact"
                    >
                        <IoAdd />
                    </QuickActionButton>
                    <QuickActionButton
                        className={_cs(styles.aboveButton, styles.addButton)}
                        name={undefined}
                        onClick={handleAddAboveClick}
                        disabled={disabled}
                        variant="tertiary"
                        spacing="compact"
                    >
                        <IoAdd />
                    </QuickActionButton>
                    <QuickActionButton
                        className={_cs(styles.belowButton, styles.addButton)}
                        name={undefined}
                        onClick={handleAddBelowClick}
                        disabled={disabled}
                        variant="tertiary"
                        spacing="compact"
                    >
                        <IoAdd />
                    </QuickActionButton>
                </>
            )}
            {!readOnly && (
                <Footer
                    className={styles.footer}
                    actions={(
                        <>
                            <QuickActionDropdownMenu
                                label={width}
                                variant="tertiary"
                            >
                                <SegmentInput
                                    name="width"
                                    label=""
                                    spacing="compact"
                                    value={width}
                                    onChange={onFieldChange}
                                    options={widthOptions}
                                    keySelector={widthSelector}
                                    labelSelector={widthSelector}
                                    disabled={disabled}
                                />
                            </QuickActionDropdownMenu>
                            <QuickActionButton
                                name={undefined}
                                title="Edit Content"
                                onClick={handleContentEdit}
                                variant="tertiary"
                            >
                                <IoPencil />
                            </QuickActionButton>
                            <QuickActionConfirmButton
                                name={undefined}
                                title="Remove Content"
                                message="Are you sure you want to delete this content?"
                                onConfirm={handleItemRemove}
                                variant="tertiary"
                            >
                                <IoTrashOutline />
                            </QuickActionConfirmButton>
                        </>
                    )}
                />
            )}
            {!readOnly && contentAddModalVisible && (
                <ContentAddModal
                    reportId={reportId}
                    onCloseButtonClick={hideContentAddModal}
                    onSelect={handleContentAddClick}
                />
            )}
            {!readOnly && isBeingEdited && leftContentRef?.current && (
                <Portal element={leftContentRef.current}>
                    <Container
                        className={styles.editContainer}
                        contentClassName={styles.editContentBody}
                        heading="Configuration"
                        headingSize="extraSmall"
                        footerActions={(
                            <Button
                                name={undefined}
                                variant="tertiary"
                                onClick={handleContentEditClose}
                            >
                                Close
                            </Button>
                        )}
                    >
                        {contentType === 'HEADING' && (
                            <HeadingEdit
                                name="heading"
                                value={configuration?.heading}
                                error={getErrorObject(error?.contentConfiguration)?.heading}
                                onChange={onConfigChange}
                            />
                        )}
                        {contentType === 'TEXT' && (
                            <TextEdit
                                name="text"
                                onChange={onConfigChange}
                                value={configuration?.text}
                                error={getErrorObject(error?.contentConfiguration)?.text}
                            />
                        )}
                        {contentType === 'IMAGE' && (
                            <ImageEdit
                                name="image"
                                onChange={onConfigChange}
                                value={configuration?.image}
                                error={getErrorObject(error?.contentConfiguration)?.image}
                                onFileUpload={handleImageFileUploadChange}
                            />
                        )}
                        {contentType === 'TIMELINE_CHART' && (
                            <TimelineChartEdit
                                name="timelineChart"
                                onChange={onConfigChange}
                                value={configuration?.timelineChart}
                                error={getErrorObject(error?.contentConfiguration)?.timelineChart}
                            />
                        )}
                        {contentType === 'BAR_CHART' && (
                            <BarChartEdit
                                name="barChart"
                                value={configuration?.barChart}
                                onChange={onConfigChange}
                                error={getErrorObject(error?.contentConfiguration)?.barChart}
                                // NOTE: Barchart only supports one content data at a time
                                contentData={contentData?.[0]}
                                onFileUploadChange={handleBarChartFileUploadChange}
                                quantitativeReportUploads={quantitativeReportUploads}
                                onQuantitativeReportUploadsChange={
                                    onQuantitativeReportUploadsChange
                                }
                            />
                        )}
                        {contentType === 'KPI' && (
                            <KpiEdit
                                name="kpi"
                                onChange={onConfigChange}
                                value={configuration?.kpi}
                                error={getErrorObject(error?.contentConfiguration)?.kpi}
                            />
                        )}
                        {contentType === 'URL' && (
                            <UrlEdit
                                name="url"
                                onChange={onConfigChange}
                                value={configuration?.url}
                                error={getErrorObject(error?.contentConfiguration)?.url}
                            />
                        )}
                        <ContainerStylesEdit
                            name="style"
                            value={style}
                            onChange={onFieldChange}
                            error={getErrorObject(error?.style)}
                            additionalStylingSettings={(
                                <NumberInput
                                    name="height"
                                    label="Height"
                                    value={height}
                                    error={error?.height}
                                    onChange={onFieldChange}
                                    disabled={disabled}
                                />
                            )}
                        />
                    </Container>
                </Portal>
            )}
        </div>
    );
}

export default ReportContainer;
