import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import {
    useParams,
    useHistory,
    generatePath,
} from 'react-router-dom';
import {
    _cs,
    listToMap,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { Button } from '@the-deep/deep-ui';
import { createSubmitHandler, removeNull, useForm } from '@togglecorp/toggle-form';

import routes from '#base/configs/routes';
import BackLink from '#components/BackLink';
import SubNavbar from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';
import LeftPaneEntries from '#components/LeftPaneEntries';
import { Entry, EntryInput as EntryInputType } from '#components/entry/types';
import { ORGANIZATION_FRAGMENT, ENTRY_FRAGMENT } from '#gqlFragments';
import {
    AssessmentRegistryCreateInputType,
    CreateAssessmentRegistryMutation,
    CreateAssessmentRegistryMutationVariables,
    LeadEntriesForAryQuery,
    LeadEntriesForAryQueryVariables,
    EntriesFromAssessmentQuery,
    EntriesFromAssessmentQueryVariables,
} from '#generated/types';

import AssessmentRegistryForm from './AssessmentRegistryForm';
import { initialValue, schema } from './AssessmentRegistryForm/formSchema';

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

const ENTRIES_FROM_ASSESSMENT = gql`
    ${ORGANIZATION_FRAGMENT}
    ${ENTRY_FRAGMENT}
    query EntriesFromAssessment (
        $projectId: ID!,
        $assessmentId: ID!,
    ) {
        project(id: $projectId) {
            id
            assessmentRegistry(id: $assessmentId) {
                id
                lead {
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
    }
`;

const CREATE_ASSESEMENT_REGISTRY = gql`
    mutation CreateAssessmentRegistry($projectId:ID!, $data: AssessmentRegistryCreateInputType!) {
        project(id: $projectId) {
            createAssessmentRegistry( data: $data) {
                ok
                errors
                result {
                    id
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
    const {
        value,
        setValue,
        setFieldValue,
        error,
        setError,
        validate,
    } = useForm(schema, initialValue);

    const { assessmentId } = useParams<{ assessmentId: string }>();
    const leadId = new URL(window.location.href).searchParams.get('source') ?? undefined;
    const { project } = useContext(ProjectContext);
    const [entryImagesMap, setEntryImagesMap] = useState<EntryImagesMap | undefined>();
    const history = useHistory();
    const isNewAssessment = isDefined(leadId);

    const projectId = project ? project.id : '';
    const variablesForLeadEntries = useMemo(
        (): LeadEntriesForAryQueryVariables | undefined => (
            (leadId && projectId) ? { projectId, leadId } : undefined
        ), [
            leadId,
            projectId,
        ],
    );

    const {
        data: entriesForLead,
    } = useQuery<LeadEntriesForAryQuery, LeadEntriesForAryQueryVariables>(
        LEAD_ENTRIES_FOR_ARY,
        {
            skip: isNotDefined(variablesForLeadEntries),
            variables: variablesForLeadEntries,
            onCompleted: (response) => {
                const leadFromResponse = response?.project?.lead;
                if (!leadFromResponse) {
                    return;
                }
                const assessmentIdFromLead = leadFromResponse.assessmentId;

                // NOTE: If there is already an assessment associated with the
                // lead, we redirect to its appropriate edit page
                if (isDefined(assessmentIdFromLead)) {
                    const path = generatePath(
                        routes.newAssessmentEdit.path,
                        {
                            assessmentId: assessmentIdFromLead,
                            projectId,
                        },
                    );
                    history.push(path);
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

    const variablesForAssessmentEntries = useMemo(
        (): EntriesFromAssessmentQueryVariables | undefined => (
            (assessmentId && projectId) ? { projectId, assessmentId } : undefined
        ), [
            projectId,
            assessmentId,
        ],
    );

    const {
        data: entriesFromAssessment,
    } = useQuery<EntriesFromAssessmentQuery, EntriesFromAssessmentQueryVariables>(
        ENTRIES_FROM_ASSESSMENT,
        {
            skip: isNotDefined(variablesForAssessmentEntries),
            variables: variablesForAssessmentEntries,
            onCompleted: (response) => {
                const leadFromResponse = response?.project?.assessmentRegistry?.lead;

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

    const leadIdFromAssessment = entriesFromAssessment?.project?.assessmentRegistry?.lead?.id;
    const leadIdSafe = leadIdFromAssessment ?? leadId;
    const entries = isNewAssessment
        ? entriesForLead?.project?.lead?.entries
        : entriesFromAssessment?.project?.assessmentRegistry?.lead?.entries;

    const [
        createAssessmentRegistry,
        {
            loading: createAssessmentRegistryPending,
        },
    ] = useMutation<CreateAssessmentRegistryMutation, CreateAssessmentRegistryMutationVariables>(
        CREATE_ASSESEMENT_REGISTRY,
    );

    const transformedEntries = entries?.map((entry) => transformEntry(entry as Entry));

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    createAssessmentRegistry({
                        variables: {
                            projectId,
                            data: {
                                ...val,
                                lead: leadId,
                            } as AssessmentRegistryCreateInputType,
                        },
                    });
                },
            );
            submit();
        },
        [
            createAssessmentRegistry,
            projectId,
            setError,
            validate,
            leadId,
        ],
    );

    return (
        <div className={_cs(className, styles.editAssessment)}>
            <SubNavbar
                className={styles.header}
                heading="Assessment"
                homeLinkShown
                defaultActions={(
                    <>
                        <BackLink defaultLink="/">
                            Close
                        </BackLink>
                        <Button
                            name="save"
                            type="submit"
                            onClick={handleSubmit}
                            disabled={createAssessmentRegistryPending}
                        >
                            Save
                        </Button>
                    </>
                )}
            />
            <div className={styles.container}>
                {isDefined(leadIdSafe) && (
                    <>
                        <LeftPaneEntries
                            className={styles.leftPane}
                            entries={transformedEntries}
                            projectId={projectId}
                            leadId={leadIdSafe}
                            lead={entriesForLead?.project?.lead}
                            entryImagesMap={entryImagesMap}
                        />
                        <div className={styles.form}>
                            <AssessmentRegistryForm
                                value={value}
                                setFieldValue={setFieldValue}
                                setValue={setValue}
                                error={error}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default EditAry;
