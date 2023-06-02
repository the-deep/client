import React, { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
    _cs,
    listToMap,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';
import LeftPaneEntries from '#components/LeftPaneEntries';
import { Entry } from '#components/entry/types';

import {
    LeadEntriesForAryQuery,
    LeadEntriesForAryQueryVariables,
} from '#generated/types';

import {
    ORGANIZATION_FRAGMENT,
    ENTRY_FRAGMENT,
} from '#gqlFragments';

import styles from './styles.css';

const LEAD_ENTRIES_FOR_ARY = gql`
    ${ORGANIZATION_FRAGMENT}
    ${ENTRY_FRAGMENT}
    query LeadEntriesForAry (
        $projectId: ID!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            id
            lead (id: $leadId){
                id
                title
                leadGroup {
                    id
                    title
                }
                title
                clientId
                assignee {
                    id
                    displayName
                    emailDisplay
                }
                publishedOn
                text
                url
                attachment {
                    id
                    title
                    mimeType
                    file {
                        url
                    }
                }
                isAssessmentLead
                sourceType
                priority
                confidentiality
                status
                source {
                    ...OrganizationGeneralResponse
                }
                authors {
                    ...OrganizationGeneralResponse
                }
                emmEntities {
                    id
                    name
                }
                emmTriggers {
                    id
                    emmKeyword
                    emmRiskFactor
                    count
                }
                entries {
                    ...EntryResponse
                }
            }
        }
    }
`;

export type EntryImagesMap = { [key: string]: Entry['image'] | undefined };

interface Props {
    className?: string;
}

function EditAry(props: Props) {
    const { className } = props;

    const { leadId = '32' } = useParams<{ leadId: string }>();
    const { project } = useContext(ProjectContext);

    const projectId = project ? project.id : undefined;

    const variables = useMemo(
        (): LeadEntriesForAryQueryVariables | undefined => (
            (leadId && projectId) ? { projectId, leadId } : undefined
        ), [
            leadId,
            projectId,
        ],
    );

    const [entryImagesMap, setEntryImagesMap] = useState<EntryImagesMap | undefined>();

    const {
        data: entriesForLead,
    } = useQuery<LeadEntriesForAryQuery, LeadEntriesForAryQueryVariables>(
        LEAD_ENTRIES_FOR_ARY,
        {
            skip: isNotDefined(variables),
            variables,
            onCompleted: (response) => {
                const leadFromResponse = response?.project?.lead;
                if (!leadFromResponse) {
                    return;
                }
                const imagesMap = listToMap(
                    leadFromResponse.entries
                        ?.map((entry) => entry.image)
                        .filter(isDefined),
                    (d) => d.id,
                    (d) => d,
                );
                setEntryImagesMap(imagesMap);
            },
        },
    );

    return (
        <div className={_cs(className, styles.editAssessment)}>
            <SubNavbar
                className={styles.header}
                heading="Assessment"
                homeLinkShown
                defaultActions={(
                    <BackLink defaultLink="/">
                        Close
                    </BackLink>
                )}
            />
            <div className={styles.container}>
                <LeftPaneEntries
                    className={styles.leftPane}
                    entries={entriesForLead?.project?.lead?.entries ?? undefined}
                    projectId={projectId}
                    leadId={leadId}
                    lead={entriesForLead?.project?.lead}
                    entryImagesMap={entryImagesMap}
                    Entry
                />
                <div className={styles.form}>
                    Assessment form goes here
                </div>
            </div>
        </div>
    );
}

export default EditAry;
