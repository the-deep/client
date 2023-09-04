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
    Modal,
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import {
    IoAdd,
    IoTrashOutline,
    IoPencil,
} from 'react-icons/io5';

import { reorder } from '#utils/common';
import { useModalState } from '#hooks/stateManagement';
import NonFieldError from '#components/NonFieldError';
import {
    AnalysisReportUploadType,
    AnalysisReportContainerContentTypeEnum,
} from '#generated/types';

import {
    type PartialFormType,
    type HeadingConfigType,
    type TextConfigType,
    type ImageConfigType,
    type UrlConfigType,
    type ContentConfigType,
    type ReportContainerType,
    type ContentDataType,
} from '../../schema';
import { ContentDataFileMap } from '../../index';

import ContentAddModal from './ContentAddModal';
import HeadingEdit from './HeadingEdit';
import UrlEdit from './UrlEdit';
import TextEdit from './TextEdit';
import ImageEdit from './ImageEdit';
import Content from './Content';

import styles from './styles.css';

const widthSelector = (item: { width: number }) => item.width;

export interface Props {
    className?: string;
    row?: number;
    column?: number;
    width?: number;
    height?: number;
    containerKey?: string;
    contentData: ContentDataType[] | undefined;
    allItems: ReportContainerType[] | undefined;
    error: Error<ReportContainerType> | undefined;
    contentType: AnalysisReportContainerContentTypeEnum | undefined;
    configuration: ContentConfigType | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    contentDataToFileMap: ContentDataFileMap | undefined;
    setContentDataToFileMap: React.Dispatch<React.SetStateAction<ContentDataFileMap | undefined>>;
    readOnly?: boolean;
    disabled?: boolean;
}

function ReportContainer(props: Props) {
    const {
        className,
        contentType,
        error: riskyError,
        row = 1,
        column = 1,
        width = 1,
        allItems,
        configuration,
        height,
        containerKey,
        contentData,
        setFieldValue,
        readOnly,
        contentDataToFileMap,
        setContentDataToFileMap,
        disabled,
    } = props;

    const index = allItems?.findIndex((item) => item.clientId === containerKey);

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
        contentEditModalVisible,
        showContentEditModal,
        hideContentEditModal,
    ] = useModalState(false);

    const [
        contentAddModalVisible,
        showContentAddModal,
        hideContentAddModal,
    ] = useModalState(false);

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
        showContentEditModal();
        onFieldChange(newContentType, 'contentType');
    }, [
        onFieldChange,
        showContentEditModal,
        hideContentAddModal,
    ]);

    const onConfigChange = useFormObject<
        'contentConfiguration', ContentConfigType
    >('contentConfiguration', onFieldChange, {});

    const onHeadingConfigChange = useFormObject<
        'heading', HeadingConfigType
    >('heading', onConfigChange, {});

    const onTextConfigChange = useFormObject<
        'text', TextConfigType
    >('text', onConfigChange, {});

    const onImageConfigChange = useFormObject<
        'image', ImageConfigType
    >('image', onConfigChange, {});

    const onUrlConfigChange = useFormObject<
        'url', UrlConfigType
    >('url', onConfigChange, {});

    const handleImageFileUploadChange = useCallback((file: AnalysisReportUploadType) => {
        const newClientId = randomString();
        onFieldChange([
            {
                upload: file.id,
                clientId: newClientId,
            },
        ], 'contentData');
        setContentDataToFileMap((oldVal) => ({
            ...(oldVal ?? {}),
            [newClientId]: {
                url: file.file.file?.url ?? undefined,
                name: file.file.file?.name ?? undefined,
            },
        }));
    }, [
        onFieldChange,
        setContentDataToFileMap,
    ]);

    const isErrored = analyzeErrors(error);

    return (
        <div
            className={_cs(
                className,
                styles.reportContainer,
                isErrored && styles.errored,
            )}
            style={{
                gridRow: row,
                gridColumn: `span ${width}`,
            }}
        >
            <NonFieldError error={error} />
            {!readOnly && (
                <>
                    <QuickActionButton
                        className={_cs(styles.beforeButton, styles.addButton)}
                        name={undefined}
                        onClick={handleAddBeforeClick}
                        disabled={disableAddButtons || disabled}
                        variant="secondary"
                        spacing="compact"
                    >
                        <IoAdd />
                    </QuickActionButton>
                    <QuickActionButton
                        className={_cs(styles.afterButton, styles.addButton)}
                        name={undefined}
                        onClick={handleAddAfterClick}
                        disabled={disableAddButtons || disabled}
                        variant="secondary"
                        spacing="compact"
                    >
                        <IoAdd />
                    </QuickActionButton>
                    <QuickActionButton
                        className={_cs(styles.aboveButton, styles.addButton)}
                        name={undefined}
                        onClick={handleAddAboveClick}
                        disabled={disabled}
                        variant="secondary"
                        spacing="compact"
                    >
                        <IoAdd />
                    </QuickActionButton>
                    <QuickActionButton
                        className={_cs(styles.belowButton, styles.addButton)}
                        name={undefined}
                        onClick={handleAddBelowClick}
                        disabled={disabled}
                        variant="secondary"
                        spacing="compact"
                    >
                        <IoAdd />
                    </QuickActionButton>
                </>
            )}
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
                    contentData={contentData}
                    contentDataToFileMap={contentDataToFileMap}
                />
            )}
            {!readOnly && (
                <Footer
                    className={styles.footer}
                    actions={(
                        <>
                            <QuickActionDropdownMenu
                                label={width}
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
                                onClick={showContentEditModal}
                            >
                                <IoPencil />
                            </QuickActionButton>
                            <QuickActionConfirmButton
                                name={undefined}
                                title="Remove Content"
                                message="Are you sure you want to delete this content?"
                                onConfirm={handleItemRemove}
                            >
                                <IoTrashOutline />
                            </QuickActionConfirmButton>
                        </>
                    )}
                />
            )}
            {!readOnly && contentAddModalVisible && (
                <ContentAddModal
                    onCloseButtonClick={hideContentAddModal}
                    onSelect={handleContentAddClick}
                />
            )}
            {!readOnly && contentEditModalVisible && (
                <Modal
                    onCloseButtonClick={hideContentEditModal}
                    heading="Configuration"
                >
                    {contentType === 'HEADING' && (
                        <HeadingEdit
                            value={configuration?.heading}
                            error={getErrorObject(error?.contentConfiguration)?.heading}
                            onFieldChange={onHeadingConfigChange}
                            additionalStylingSettings={(
                                <NumberInput
                                    name="height"
                                    label="Height"
                                    value={height}
                                    onChange={onFieldChange}
                                    disabled={disabled}
                                />
                            )}
                        />
                    )}
                    {contentType === 'TEXT' && (
                        <TextEdit
                            value={configuration?.text}
                            error={getErrorObject(error?.contentConfiguration)?.text}
                            onFieldChange={onTextConfigChange}
                            additionalStylingSettings={(
                                <NumberInput
                                    name="height"
                                    label="Height"
                                    value={height}
                                    onChange={onFieldChange}
                                    disabled={disabled}
                                />
                            )}
                        />
                    )}
                    {contentType === 'IMAGE' && (
                        <ImageEdit
                            value={configuration?.image}
                            error={getErrorObject(error?.contentConfiguration)?.image}
                            onFieldChange={onImageConfigChange}
                            onFileUpload={handleImageFileUploadChange}
                            additionalStylingSettings={(
                                <NumberInput
                                    name="height"
                                    label="Height"
                                    value={height}
                                    onChange={onFieldChange}
                                    disabled={disabled}
                                />
                            )}
                        />
                    )}
                    {contentType === 'URL' && (
                        <UrlEdit
                            value={configuration?.url}
                            error={getErrorObject(error?.contentConfiguration)?.url}
                            onFieldChange={onUrlConfigChange}
                            additionalStylingSettings={(
                                <NumberInput
                                    name="height"
                                    label="Height"
                                    value={height}
                                    onChange={onFieldChange}
                                    disabled={disabled}
                                />
                            )}
                        />
                    )}
                </Modal>
            )}
        </div>
    );
}

export default ReportContainer;
