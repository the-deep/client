import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    _cs,
    randomString,
    isDefined,
    listToMap,
    mapToMap,
    unique,
} from '@togglecorp/fujs';
import {
    useAlert,
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
import { useLazyRequest } from '#base/utils/restRequest';

import {
    BasicOrganization,
    organizationTitleSelector,
    organizationLogoSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';
import NonFieldError from '#components/NonFieldError';
import { BasicAnalysisReportUpload } from '#components/report/ReportBuilder/DatasetSelectInput';
import { ReportGeoUploadType } from '#components/report/ReportBuilder/GeoDataSelectInput';

import {
    type PartialFormType,
    type ReportContainerType,
} from '../schema';

import ReportContainer, { Props as ReportContainerProps } from './ReportContainer';
import MetadataEdit from './MetadataEdit';

import styles from './styles.css';

export declare type Properties = {
    [name: string]: unknown;
} | null;

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
    imageReportUploads: BasicAnalysisReportUpload[] | undefined | null;
    onImageReportUploadsChange: React.Dispatch<React.SetStateAction<
        BasicAnalysisReportUpload[] | undefined | null
    >>;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    onGeoDataUploadsChange: React.Dispatch<React.SetStateAction<
        ReportGeoUploadType[] | undefined | null
    >>;
    quantitativeReportUploads: BasicAnalysisReportUpload[] | undefined | null;
    onQuantitativeReportUploadsChange: React.Dispatch<React.SetStateAction<
        BasicAnalysisReportUpload[] | undefined | null
    >>;
    leftContentRef: React.RefObject<HTMLDivElement> | undefined;
    onContentEditChange: (newVal: boolean) => void;
    pending: boolean;
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
        pending,
        organizationOptions,
        onOrganizationOptionsChange,
        onContentEditChange,
        leftContentRef,
        imageReportUploads,
        onImageReportUploadsChange,
        quantitativeReportUploads,
        onQuantitativeReportUploadsChange,
        geoDataUploads,
        onGeoDataUploadsChange,
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

    const alert = useAlert();

    const [geoFilesPending, setGeoFilesPending] = useState(false);
    const [geoData, setGeoData] = useState<Record<string, unknown>>({});
    const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});

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
                imageReportUploads,
                onImageReportUploadsChange,
                quantitativeReportUploads,
                onQuantitativeReportUploadsChange,
                geoDataUploads,
                onGeoDataUploadsChange,
                downloadedGeoData: geoData,
                downloadsPending: geoFilesPending,
                leftContentRef,
                style: item.style,
                reportId,
                error: itemError,
                setFieldValue,
                readOnly,
                disabled,
            });
        },
        [
            geoFilesPending,
            geoData,
            reportId,
            containerToEdit,
            imageReportUploads,
            onImageReportUploadsChange,
            quantitativeReportUploads,
            onQuantitativeReportUploadsChange,
            geoDataUploads,
            onGeoDataUploadsChange,
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

    const geoFilesToDownload = useMemo(() => {
        const contentData = value?.containers
            ?.filter((item) => item.contentType === 'MAP')
            ?.map((item) => item.contentData).filter(isDefined).flat();
        const validFiles = geoDataUploads?.map((item) => {
            if (!item.file.file?.url) {
                return undefined;
            }
            return {
                url: item.file.file.url,
                uploadId: item.id,
            };
        }).filter(isDefined);

        const uploadIdToLinkMap = listToMap(
            validFiles,
            (item) => item.uploadId,
            (item) => item.url,
        );
        const usedFiles = contentData?.filter(
            (item) => (item.upload ? isDefined(uploadIdToLinkMap?.[item.upload]) : false),
        ).map((item) => ((item.upload && uploadIdToLinkMap?.[item.upload]) ? {
            upload: item.upload,
            url: uploadIdToLinkMap?.[item.upload],
        } : undefined)).filter(isDefined);
        return unique(usedFiles ?? [], (item) => item.upload)
            .filter((item) => !downloadedIds[item.upload]);
    }, [
        downloadedIds,
        value?.containers,
        geoDataUploads,
    ]);

    const {
        trigger: fetchFile,
    } = useLazyRequest<ArrayBuffer, { upload: string; url: string; }>({
        url: (context) => context.url,
        isFile: true,
        method: 'GET',
        onSuccess: (file, context) => {
            try {
                const parsedJson = JSON.parse(new TextDecoder().decode(file));

                setGeoData((oldData) => ({
                    ...oldData,
                    [context.upload]: parsedJson,
                }));
            } catch {
                alert.show(
                    'There was an error parsing the geojson file.',
                    { variant: 'error' },
                );
            }
            const currReportIndex = geoFilesToDownload.findIndex(
                (item) => item.upload === context.upload,
            );
            const nextFile = geoFilesToDownload[currReportIndex + 1];
            if (nextFile) {
                fetchFile(geoFilesToDownload[currReportIndex + 1]);
            } else {
                setDownloadedIds((oldIds) => ({
                    ...oldIds,
                    ...mapToMap(geoData, (item) => item, () => true),
                    [context.upload]: true,
                }));
                setGeoFilesPending(false);
            }
        },
        onFailure: (_, context) => {
            const currReportIndex = geoFilesToDownload.findIndex(
                (item) => item.upload === context.upload,
            );
            const nextFile = geoFilesToDownload[currReportIndex + 1];
            if (nextFile) {
                fetchFile(geoFilesToDownload[currReportIndex + 1]);
            } else {
                setGeoFilesPending(false);
            }
        },
    });

    useEffect(() => {
        if (geoFilesToDownload.length > 0) {
            setGeoFilesPending(true);
            setTimeout(() => {
                fetchFile(geoFilesToDownload[0]);
            }, 500);
        }
    }, [
        fetchFile,
        geoFilesToDownload,
    ]);

    const errorInMetadata = useMemo(() => (
        metadataFields.some((field) => analyzeErrors(
            getErrorObject(getErrorObject(error)?.[field]),
        ))
    ), [error]);

    const gap = value?.configuration?.bodyStyle?.gap;

    const handleNewContentAdd = useCallback(() => {
        const newItem = {
            row: 1,
            column: 1,
            clientId: randomString(),
            width: 12,
        };
        setFieldValue((oldVal: ReportContainerType[] | undefined = []) => {
            const newItems = [
                ...oldVal,
                newItem,
            ];
            return newItems;
        }, 'containers');
    }, [
        setFieldValue,
    ]);

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
                        className={styles.header}
                        headingContainerClassName={styles.heading}
                        heading={value?.title ?? 'Title goes here'}
                        headingSize="extraLarge"
                        description={value?.subTitle}
                        actionsContainerClassName={styles.organizations}
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
                    className={_cs(
                        styles.containers,
                        (value?.containers?.length ?? 0) === 0 && styles.empty,
                    )}
                    data={value?.containers}
                    style={isDefined(gap) ? { gridGap: gap } : undefined}
                    keySelector={reportContainerKeySelector}
                    renderer={ReportContainer}
                    rendererParams={reportContainerRendererParams}
                    errored={false}
                    filtered={false}
                    pending={pending}
                    messageShown
                    messageIconShown
                    emptyMessage="Looks like there aren't any containers."
                    messageActions={(
                        <Button
                            name="undefined"
                            onClick={handleNewContentAdd}
                            variant="tertiary"
                        >
                            Add a content
                        </Button>
                    )}
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
