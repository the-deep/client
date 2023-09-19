import React, { useCallback, useMemo } from 'react';
import { removeNull } from '@togglecorp/toggle-form';
import { useParams } from 'react-router-dom';
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
        data: yearlyDataNode,
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
        contentDataToFileMap,
    } = useMemo(() => {
        if (!yearlyDataNode?.publicReportDetails) {
            return {
                finalData: undefined,
                organizationOptions: undefined,
                contentDataToFileMap: undefined,
            };
        }
        const fileToFileDetailsMap = listToMap(
            removeNull(completeData?.publicAnalysisReportSnapshot?.files),
            (item) => item.id,
            (item) => item.file,
        );

        const data = removeNull(yearlyDataNode.publicReportDetails);
        const uploadItems = data.containers
            ?.map((item) => item.contentData)
            .flat()
            .filter(isDefined);

        const contentDataToFile = listToMap(
            uploadItems,
            (item) => item.clientId,
            (item) => ({
                url: item.upload?.file?.id
                    ? fileToFileDetailsMap?.[item.upload.file.id]?.url : undefined,
                name: item.upload?.file?.id
                    ? fileToFileDetailsMap?.[item.upload.file.id]?.name : undefined,
            }),
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
            contentDataToFileMap: contentDataToFile,
        };
    }, [
        yearlyDataNode,
        completeData,
    ]);

    const handleUpdate = useCallback(() => {
        // eslint-disable-next-line no-console
        console.error('Value that cannot be updated was updated');
    }, []);

    const tableOfContents = useMemo(() => (
        finalData?.containers?.filter((item) => item.contentType === 'HEADING')
    ), [finalData?.containers]);

    return (
        <div className={_cs(className, styles.publicReportView)}>
            <Toc
                className={styles.leftContent}
                title={finalData?.title}
                data={tableOfContents}
            />
            {finalData && (
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
                    contentDataToFileMap={contentDataToFileMap}
                    setContentDataToFileMap={handleUpdate}
                    leftContentRef={undefined}
                    onContentEditChange={handleUpdate}
                />
            )}
        </div>
    );
}

export default PublicReportView;
