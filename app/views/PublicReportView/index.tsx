import React, { useCallback, useMemo } from 'react';
import { removeNull } from '@togglecorp/toggle-form';
import { useParams } from 'react-router-dom';
import { Message } from '@the-deep/deep-ui';
import {
    _cs,
    isDefined,
    listToMap,
    compareNumber,
} from '@togglecorp/fujs';

import {
    useQuery,
    gql,
} from '@apollo/client';

import {
    PublicReportDetailsQuery,
    PublicReportDetailsQueryVariables,
    PublicReportSnapshotQuery,
    PublicReportSnapshotQueryVariables,
} from '#generated/types';
import Toc from '#components/report/Toc';
import ReportBuilder from '#components/report/ReportBuilder';
import {
    removeDomain,
} from '#utils/common';

import styles from './styles.css';

const PUBLIC_REPORT_SNAPSHOT = gql`
    query PublicReportSnapshot(
        $slug: String!,
    ) {
        publicAnalysisReportSnapshot(slug: $slug) {
            id
            files {
                id
                title
                file {
                    name
                    url
                }
            }
            reportDataFile {
                name
                url
            }
        }
    }
`;

const PUBLIC_REPORT_DETAILS = gql`
    query PublicReportDetails($pathName: String!) {
        publicReportDetails(pathName: $pathName) @rest(
            type: "PublicReportDetails!",
            method: "GET",
            endpoint: "static",
            path: ":pathName",
        ) {
            id
            analysis
            title
            subTitle
            slug
            organizations {
                id
                title
                verified
                shortName
                mergedAs {
                    id
                    title
                    verified
                    shortName
                }
            }
            configuration {
                containerStyle {
                    border {
                        width
                        color
                        opacity
                        style
                    }
                    padding {
                        top
                        bottom
                        left
                        right
                    }
                    background {
                        color
                        opacity
                    }
                }
                textContentStyle {
                    content {
                        align
                        color
                        family
                        size
                        weight
                    }
                }
                imageContentStyle {
                    caption {
                        align
                        color
                        family
                        size
                        weight
                    }
                }
                headingContentStyle {
                    h1 {
                        align
                        color
                        family
                        size
                        weight
                    }
                    h2 {
                        align
                        color
                        family
                        size
                        weight
                    }
                    h3 {
                        align
                        color
                        family
                        size
                        weight
                    }
                    h4 {
                        align
                        color
                        family
                        size
                        weight
                    }
                }
                bodyStyle {
                    gap
                }
            }
            containers {
                id
                clientId
                row
                column
                width
                height
                contentType
                style {
                    border {
                        width
                        color
                        opacity
                        style
                    }
                    padding {
                        top
                        bottom
                        left
                        right
                    }
                    background {
                        color
                        opacity
                    }
                }
                contentData {
                    clientId
                    data
                    id
                    upload {
                        id
                        file {
                            id
                        }
                        type
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
                    }
                }
                contentConfiguration {
                    heading {
                        content
                        variant
                        style {
                            content {
                                align
                                color
                                family
                                size
                                weight
                            }
                        }
                    }
                    image {
                        altText
                        caption
                        style {
                            caption {
                                align
                                color
                                family
                                size
                                weight
                            }
                            fit
                        }
                    }
                    kpi {
                        items {
                            abbreviateValue
                            clientId
                            color
                            date
                            source
                            sourceUrl
                            subtitle
                            title
                            value
                            style {
                                sourceContentStyle {
                                    align
                                    color
                                    family
                                    size
                                    weight
                                }
                                subtitleContentStyle {
                                    align
                                    color
                                    family
                                    size
                                    weight
                                }
                                titleContentStyle {
                                    align
                                    color
                                    family
                                    size
                                    weight
                                }
                                valueContentStyle {
                                    align
                                    color
                                    family
                                    size
                                    weight
                                }
                            }
                        }
                        sourceContentStyle {
                            align
                            color
                            family
                            size
                            weight
                        }
                        subtitleContentStyle {
                            align
                            color
                            family
                            size
                            weight
                        }
                        titleContentStyle {
                            align
                            color
                            family
                            size
                            weight
                        }
                        valueContentStyle {
                            align
                            color
                            family
                            size
                            weight
                        }
                    }
                    text {
                        content
                        style {
                            content {
                                align
                                color
                                family
                                size
                                weight
                            }
                        }
                    }
                    url {
                        url
                    }
                    barChart {
                        direction
                        horizontalAxis {
                            field
                            type
                        }
                        horizontalAxisLineVisible
                        horizontalAxisTitle
                        horizontalGridLineVisible
                        horizontalTickVisible
                        legendHeading
                        sheet
                        subTitle
                        title
                        type
                        verticalAxis {
                            label
                            aggregationType
                            clientId
                            color
                            field
                        }
                        verticalAxisExtendMinimumValue
                        verticalAxisExtendMaximumValue
                        verticalAxisLineVisible
                        verticalAxisTitle
                        verticalGridLineVisible
                        verticalTickVisible
                        horizontalTickLabelRotation
                    }
                    timelineChart {
                        category
                        date
                        detail
                        sheet
                        source
                        sourceUrl
                        title
                    }
                }
            }
            isPublic
            modifiedAt
        }
    }
`;

interface Props {
    className?: string;
}

function PublicReportView(props: Props) {
    const {
        className,
    } = props;

    const { reportSlug } = useParams<{ reportSlug: string | undefined }>();

    const variables = useMemo(() => (
        reportSlug ? { slug: reportSlug } : undefined
    ), [reportSlug]);

    const {
        loading: completeDataPending,
        data: completeData,
    } = useQuery<PublicReportSnapshotQuery, PublicReportSnapshotQueryVariables>(
        PUBLIC_REPORT_SNAPSHOT,
        {
            skip: !variables,
            variables,
        },
    );

    const snapshotVariables = useMemo(() => {
        const reportUrl = completeData?.publicAnalysisReportSnapshot?.reportDataFile?.url;
        if (!reportUrl) {
            return undefined;
        }
        return {
            pathName: removeDomain(reportUrl),
        };
    }, [completeData]);

    const {
        loading: snapshotDataPending,
        data: snapshotData,
    } = useQuery<PublicReportDetailsQuery, PublicReportDetailsQueryVariables>(
        PUBLIC_REPORT_DETAILS,
        {
            skip: !snapshotVariables,
            variables: snapshotVariables,
        },
    );

    const {
        finalData,
        organizationOptions,
        quantitativeReportUploads,
        imageReportUploads,
    } = useMemo(() => {
        if (!snapshotData?.publicReportDetails) {
            return {
                finalData: undefined,
                organizationOptions: undefined,
                quantitativeReportUploads: undefined,
                imageReportUploads: undefined,
            };
        }
        const fileToFileDetailsMap = listToMap(
            removeNull(completeData?.publicAnalysisReportSnapshot?.files),
            (item) => item.id,
            (item) => item,
        );

        const data = removeNull(snapshotData.publicReportDetails);
        const uploadItems = data.containers
            ?.map((item) => item.contentData)
            .flat()
            .filter(isDefined);

        const imageFiles = (
            uploadItems
                ?.filter((item) => (item.upload?.type === 'IMAGE'))
                .map((item) => {
                    const fileId = item.upload?.file?.id;
                    if (!item.upload || !fileId) {
                        return undefined;
                    }

                    return ({
                        ...item.upload,
                        file: {
                            id: fileId,
                            title: fileToFileDetailsMap[fileId].title,
                            file: {
                                name: fileToFileDetailsMap[fileId]?.file?.name,
                                url: fileToFileDetailsMap[fileId]?.file?.url,
                            },
                        },
                    });
                })
                .filter(isDefined)
        );
        const quantitativeFiles = (
            uploadItems
                ?.filter((item) => (item.upload?.type === 'CSV') || item.upload?.type === 'XLSX')
                .map((item) => {
                    const fileId = item.upload?.file?.id;
                    if (!item.upload || !fileId) {
                        return undefined;
                    }

                    return ({
                        ...item.upload,
                        file: {
                            id: fileId,
                            title: fileToFileDetailsMap[fileId].title,
                            file: {
                                name: fileToFileDetailsMap[fileId]?.file?.name,
                                url: fileToFileDetailsMap[fileId]?.file?.url,
                            },
                        },
                    });
                })
                .filter(isDefined)
        );

        const newContainers = [...(data.containers ?? [])];
        newContainers.sort((a, b) => (
            compareNumber(a.row, b.row) || compareNumber(a.column, b.column)
        ));

        const final = {
            ...data,
            organizations: data.organizations?.map((org) => org.id),
            containers: newContainers?.map((item) => ({
                ...item,
                contentData: item.contentData?.map((contentDataItem) => ({
                    ...contentDataItem,
                    upload: contentDataItem.upload?.id,
                })),
            })),
        };

        return {
            finalData: final,
            organizationOptions: data.organizations,
            quantitativeReportUploads: quantitativeFiles,
            imageReportUploads: imageFiles,
        };
    }, [
        snapshotData,
        completeData,
    ]);

    const handleUpdate = useCallback(() => {
        // eslint-disable-next-line no-console
        console.error('Value that cannot be updated was updated');
    }, []);

    const tableOfContents = useMemo(() => (
        finalData?.containers?.filter((item) => item.contentType === 'HEADING')
    ), [finalData?.containers]);

    const pending = snapshotDataPending || completeDataPending;

    return (
        <div className={_cs(className, styles.publicReportView)}>
            {(!pending && finalData) ? (
                <>
                    <Toc
                        className={styles.leftContent}
                        title={finalData?.title}
                        data={tableOfContents}
                    />
                    <ReportBuilder
                        className={styles.reportBuilder}
                        value={finalData}
                        error={undefined}
                        reportId={undefined}
                        setFieldValue={handleUpdate}
                        disabled
                        readOnly
                        organizationOptions={organizationOptions}
                        onOrganizationOptionsChange={handleUpdate}
                        leftContentRef={undefined}
                        onContentEditChange={handleUpdate}
                        quantitativeReportUploads={quantitativeReportUploads}
                        imageReportUploads={imageReportUploads}
                        onImageReportUploadsChange={handleUpdate}
                        onQuantitativeReportUploadsChange={handleUpdate}
                        // FIXME: Handle stuff
                        geoDataUploads={[]}
                        onGeoDataUploadsChange={handleUpdate}
                    />
                </>
            ) : (
                <div className={styles.errorMessageContainer}>
                    <Message
                        pending={pending}
                        erroredEmptyMessage="The requested report was not found."
                        errored
                    />
                </div>
            )}
        </div>
    );
}

export default PublicReportView;
