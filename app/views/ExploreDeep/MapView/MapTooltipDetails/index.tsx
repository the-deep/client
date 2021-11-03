import React, { useMemo, useCallback } from 'react';

import { useQuery, gql } from '@apollo/client';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    ProjectDetailsQuery,
    ProjectDetailsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const PROJECT_DETAILS = gql`
    query ProjectDetails(
        $projectIdList: [ID!]
    ) {
        projects(ids: $projectIdList) {
            results {
                id
                title
                description
                analysisFramework {
                    title
                }
            }
        }
    }
`;

interface Props {
    projectIds: string[];
}

function MapTooltipDetails(props: Props) {
    const {
        projectIds,
    } = props;

    console.warn(projectIds);

    const variables = useMemo(() => ({
        projectIds,
    }), [projectIds],
    );

    const {
        data: projectDetails,
        loading: projectDetailsPending,
    } = useQuery<ProjectDetailsQuery, ProjectDetailsQueryVariables>(
        PROJECT_DETAILS,
        {
            variables,
        },
    );

    const keySelector = (d: ProjectDetailsQuery) => d.id;
    const labelSelector = (d: ProjectDetailsQuery) => d.title;

    const rendererParams = useCallback((_, val) => ({
        title: val.title,
        description: val.description,
        id: val.id,
    }), []);

    const renderer = useCallback(() => {
        const {
            projectTitle,
        } = props;
        return (
            <div className={styles.listItem}>
                {projectTitle}
            </div>
        );
    }, []);

    console.warn('project details', projectDetails, projectDetailsPending);
    return (
        <div className={styles.mapTooltip}>
            <ListView
                keySelector={keySelector}
                labelSelector={labelSelector}
                renderer={renderer}
                rendererParams={rendererParams}
            />
            {projectIds.join(', ')}
        </div>
    );
}

export default MapTooltipDetails;
