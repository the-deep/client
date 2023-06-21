import React, { useContext, useMemo, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    _cs,
    listToMap,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';
import LeftPaneEntries from '#components/LeftPaneEntries';
import { Entry, EntryInput as EntryInputType } from '#components/entry/types';

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
                assessmentId
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

function transformEntry(entry: Entry): EntryInputType {
    // FIXME: make this re-usable
    return removeNull({
        ...entry,
        lead: entry.lead.id,
        image: entry.image?.id,
        attributes: entry.attributes?.map((attribute) => ({
            ...attribute,
            // NOTE: we don't need this on form
            geoSelectedOptions: undefined,
        })),
    });
}

interface Props {
    className?: string;
}

function EditAry(props: Props) {
    const { className } = props;

    const leadId = new URL(window.location.href).searchParams.get('source') ?? undefined;
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

    const entries = entriesForLead?.project?.lead?.entries;

    const transformedEntries = entries?.map((entry) => transformEntry(entry as Entry));

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
                {isDefined(leadId) && (
                    <LeftPaneEntries
                        className={styles.leftPane}
                        entries={transformedEntries}
                        projectId={projectId}
                        leadId={leadId}
                        lead={entriesForLead?.project?.lead}
                        entryImagesMap={entryImagesMap}
                    />
                )}
                <div className={styles.form}>
                    Assessment form goes here
                </div>
            </div>
        </div>
    );
}

export default EditAry;
