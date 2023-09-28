import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    ListView,
    Button,
    Header,
    Container,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    type Error,
    analyzeErrors,
    getErrorObject,
    type EntriesAsList,
} from '@togglecorp/toggle-form';
import { IoPencil } from 'react-icons/io5';

import Avatar from '#components/Avatar';
import Portal from '#components/Portal';
import {
    BasicOrganization,
    organizationTitleSelector,
    organizationLogoSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';
import NonFieldError from '#components/NonFieldError';

import {
    type PartialFormType,
    type ReportContainerType,
} from '../schema';

import ReportContainer, { Props as ReportContainerProps } from './ReportContainer';
import MetadataEdit from './MetadataEdit';
import { ContentDataFileMap } from '../utils';

import styles from './styles.css';

const metadataFields: (keyof PartialFormType)[] = [
    'slug',
    'title',
    'subTitle',
    'isPublic',
];

const reportContainerKeySelector = (item: ReportContainerType) => item.clientId;

interface Props {
    className?: string;
    value: PartialFormType;
    error: Error<PartialFormType>;
    reportId: string | undefined;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    readOnly?: boolean;
    disabled?: boolean;
    organizationOptions: BasicOrganization[] | undefined | null;
    onOrganizationOptionsChange: React.Dispatch<React.SetStateAction<
        BasicOrganization[] | undefined | null
    >>;
    contentDataToFileMap: ContentDataFileMap | undefined;
    setContentDataToFileMap: React.Dispatch<React.SetStateAction<ContentDataFileMap | undefined>>;
    leftContentRef: React.RefObject<HTMLDivElement> | undefined;
    onContentEditChange: (newVal: boolean) => void;
}

function ReportBuilder(props: Props) {
    const {
        className,
        reportId,
        error,
        value,
        setFieldValue,
        readOnly,
        disabled,
        organizationOptions,
        onOrganizationOptionsChange,
        contentDataToFileMap,
        setContentDataToFileMap,
        onContentEditChange,
        leftContentRef,
    } = props;

    const [containerToEdit, setContainerToEdit] = useState<string>();

    const orgMap = useMemo(() => (
        listToMap(
            organizationOptions,
            (org) => org.id,
            (org) => org,
        )
    ), [organizationOptions]);

    const handleContentEdit = useCallback(() => {
        setContainerToEdit('metadata');
        onContentEditChange(true);
    }, [
        onContentEditChange,
    ]);

    const handleContentEditClose = useCallback(() => {
        setContainerToEdit(undefined);
        onContentEditChange(false);
    }, [
        onContentEditChange,
    ]);

    const handleContainerEdit = useCallback((containerId: string | undefined) => {
        setContainerToEdit(containerId);
        onContentEditChange(!!containerId);
    }, [onContentEditChange]);

    const reportContainerRendererParams = useCallback(
        (
            containerKey: string,
            item: ReportContainerType,
        ): ReportContainerProps => {
            const containersError = getErrorObject(error)?.containers;
            const itemError = getErrorObject(containersError)?.[containerKey];

            return ({
                row: item.row,
                containerKey,
                column: item.column,
                width: item.width,
                onContentEditChange: handleContainerEdit,
                isBeingEdited: containerToEdit === containerKey,
                height: item.height,
                allItems: value?.containers,
                contentData: item?.contentData,
                configuration: item.contentConfiguration,
                contentType: item.contentType,
                generalConfiguration: value?.configuration,
                leftContentRef,
                style: item.style,
                reportId,
                error: itemError,
                setFieldValue,
                readOnly,
                disabled,
                contentDataToFileMap,
                setContentDataToFileMap,
            });
        },
        [
            reportId,
            contentDataToFileMap,
            containerToEdit,
            setContentDataToFileMap,
            handleContainerEdit,
            leftContentRef,
            error,
            value?.containers,
            value?.configuration,
            setFieldValue,
            readOnly,
            disabled,
        ],
    );

    const errorInMetadata = useMemo(() => (
        metadataFields.some((field) => analyzeErrors(
            getErrorObject(getErrorObject(error)?.[field]),
        ))
    ), [error]);

    const gap = value?.configuration?.bodyStyle?.gap;

    return (
        <div
            className={_cs(
                className,
                styles.reportBuilder,
            )}
        >
            <div className={styles.report}>
                <NonFieldError error={error} />
                <div
                    className={_cs(
                        styles.headingContainer,
                        readOnly && styles.readOnly,
                        errorInMetadata && styles.error,
                    )}
                >
                    <Header
                        heading={value?.title ?? 'Title goes here'}
                        headingSize="extraLarge"
                        description={value?.subTitle}
                        actions={value?.organizations?.map((org) => (
                            <Avatar
                                className={styles.organizationLogo}
                                key={org}
                                src={orgMap?.[org]
                                    ? organizationLogoSelector(orgMap[org]) : undefined}
                                name={orgMap?.[org]
                                    ? organizationTitleSelector(orgMap[org]) : undefined}
                            />
                        ))}
                    />
                    {!readOnly && (
                        <QuickActionButton
                            name={undefined}
                            onClick={handleContentEdit}
                            className={styles.editButton}
                            disabled={disabled}
                            title="Edit"
                        >
                            <IoPencil />
                        </QuickActionButton>
                    )}
                </div>
                <NonFieldError error={getErrorObject(error)?.containers} />
                <ListView
                    className={styles.containers}
                    data={value?.containers}
                    style={isDefined(gap) ? { gridGap: gap } : undefined}
                    keySelector={reportContainerKeySelector}
                    renderer={ReportContainer}
                    rendererParams={reportContainerRendererParams}
                    errored={false}
                    filtered={false}
                    pending={false}
                />
            </div>
            {containerToEdit === 'metadata' && leftContentRef?.current && (
                <Portal element={leftContentRef.current}>
                    <Container
                        className={styles.editContainer}
                        heading="Edit Metadata"
                        headingSize="small"
                        footerActions={(
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleContentEditClose}
                            >
                                Close
                            </Button>
                        )}
                    >
                        <MetadataEdit
                            setFieldValue={setFieldValue}
                            organizationOptions={organizationOptions}
                            onOrganizationOptionsChange={onOrganizationOptionsChange}
                            error={error}
                            value={value}
                            disabled={disabled}
                        />
                    </Container>
                </Portal>
            )}
        </div>
    );
}

export default ReportBuilder;
