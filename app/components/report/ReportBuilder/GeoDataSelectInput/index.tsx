import React, { useState, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    AnalysisReportUploadTypeEnum,
    AnalysisReportGeoUploadsQuery,
    AnalysisReportGeoUploadsQueryVariables,
} from '#generated/types';

import useDebouncedValue from '#hooks/useDebouncedValue';

import GeoDataUploadButton from '../GeoDataUploadButton';

import styles from './styles.css';

const ANALYSIS_REPORT_GEO_UPLOADS = gql`
    query AnalysisReportGeoUploads(
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
                        geojson {
                            variables {
                                clientId
                                completeness
                                name
                                type
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

export type ReportGeoUploadType = NonNullable<NonNullable<NonNullable<NonNullable<AnalysisReportGeoUploadsQuery['project']>['analysisReportUploads']>['results']>[number]>;

type Def = { containerClassName?: string };
type AnalysisReportUploadSelectInputProps<
    GT extends string,
    NAME extends string
> = SearchSelectInputProps<
    string,
    GT,
    NAME,
    ReportGeoUploadType,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    projectId: string;
    reportId: string;
    types?: AnalysisReportUploadTypeEnum[];
    onChange: (newVal: string | undefined, name: NAME) => void;
};
const keySelector = (d: ReportGeoUploadType) => d.id;
const labelSelector = (d: ReportGeoUploadType) => d.file.title;

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
        onChange,
        name,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const uploadsListQueryVariable = useMemo(
        (): AnalysisReportGeoUploadsQueryVariables => ({
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
    } = useQuery<
        AnalysisReportGeoUploadsQuery,
        AnalysisReportGeoUploadsQueryVariables
    >(
        ANALYSIS_REPORT_GEO_UPLOADS,
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

    return (
        <div className={_cs(styles.geoDataSelectInput, className)}>
            <SearchSelectInput
                {...otherProps}
                options={options}
                value={value}
                className={styles.selectInput}
                keySelector={keySelector}
                labelSelector={labelSelector}
                name={name}
                onChange={onChange}
                onSearchValueChange={setSearchText}
                searchOptions={data?.project?.analysisReportUploads?.results}
                optionsPending={loading}
                totalOptionsCount={(
                    data?.project?.analysisReportUploads?.totalCount ?? undefined
                )}
                onShowDropdownChange={setOpened}
                handleShowMoreClick={handleShowMoreClick}
            />
            <GeoDataUploadButton
                className={styles.button}
            />
        </div>
    );
}

export default AnalysisReportUploadSelectInput;
