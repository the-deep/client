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
import { Button, useAlert } from '@the-deep/deep-ui';
import {
    createSubmitHandler,
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';

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
    AssessmentDetailQuery,
    AssessmentDetailQueryVariables,
} from '#generated/types';
import {
    BasicRegion,
} from '#components/selections/RegionMultiSelectInput';

import AssessmentRegistryForm from './AssessmentRegistryForm';
import { initialValue, schema } from './AssessmentRegistryForm/formSchema';

import styles from './styles.css';
import { ObjectError, transformToFormError } from '#base/utils/errorTransform';
import { BasicOrganization } from '#types';

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

const ASSESSMENT_REGISTRY_DETAIL = gql`
    query AssessmentDetail (
        $projectId: ID!,
        $assessmentId: ID!,
    ) {
        project(id: $projectId) {
            assessmentRegistry(id: $assessmentId) {
                bgCountries {
                    id
                    title
                }
                bgCrisisStartDate
                bgCrisisType
                bgCrisisTypeDisplay
                bgPreparedness
                clientId
                confidentiality
                coordinatedJoint
                dataCollectionEndDate
                dataCollectionStartDate
                detailsType
                family
                externalSupport
                frequency
                id
                leadOrganizations {
                    id
                    title
                    verified
                    mergedAs {
                        title
                    }
                }
                internationalPartners {
                    id
                    title
                    verified
                    mergedAs {
                        title
                    }
                }
                nationalPartners {
                    id
                    title
                    verified
                    mergedAs {
                        title
                    }
                }
                donors {
                    id
                    title
                    verified
                    mergedAs {
                        title
                    }
                }
                governments {
                    id
                    title
                    verified
                    mergedAs {
                        title
                    }
                }
                noOfPages
                publicationDate
                language
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
        setPristine,
    } = useForm(schema, initialValue);

    const { assessmentId } = useParams<{ assessmentId: string }>();
    const leadId = new URL(window.location.href).searchParams.get('source') ?? undefined;
    const { project } = useContext(ProjectContext);
    const [entryImagesMap, setEntryImagesMap] = useState<EntryImagesMap | undefined>();
    const history = useHistory();
    const isNewAssessment = isDefined(leadId);
    const alert = useAlert();
    const [regionOptions, setRegionOptions] = useState<BasicRegion[] | undefined | null>();
    const [stakeholderOptions, setStakeholderOptions] = useState<BasicOrganization[]>([]);

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

    const variablesForAssessmentDetails = useMemo(
        (): AssessmentDetailQueryVariables | undefined => (
            (assessmentId && projectId) ? { projectId, assessmentId } : undefined
        ), [
            projectId,
            assessmentId,
        ],
    );

    const {
        loading: assessmentRegistryDetailLoading,
    } = useQuery<AssessmentDetailQuery, AssessmentDetailQueryVariables>(
        ASSESSMENT_REGISTRY_DETAIL,
        {
            skip: isNotDefined(variablesForAssessmentDetails),
            variables: variablesForAssessmentDetails,
            onCompleted: (response) => {
                if (response?.project?.assessmentRegistry) {
                    const result = (response?.project?.assessmentRegistry);

                    setValue({
                        ...result,
                        bgCountries: result?.bgCountries?.map((country) => country.id),
                        leadOrganizations: result?.leadOrganizations.map((leadOrg) => leadOrg.id),
                        internationalPartners: result.internationalPartners?.map(
                            (intPartner) => intPartner.id,
                        ),
                        nationalPartners: result.nationalPartners?.map((nPartner) => nPartner.id),
                        donors: result.donors?.map((donor) => donor.id),
                        governments: result.governments?.map((gov) => gov.id),
                    });
                    setRegionOptions(result.bgCountries);
                    setStakeholderOptions([
                        ...result.leadOrganizations,
                        ...result.internationalPartners,
                        ...result.nationalPartners,
                        ...result.donors,
                        ...result.governments,
                    ]);
                }
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
        {
            onCompleted: (response) => {
                if (!response || !response.project?.createAssessmentRegistry) {
                    return;
                }

                const {
                    ok,
                    result,
                    errors,
                } = response.project.createAssessmentRegistry;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        'Failed to create assessment registry.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    if (result?.id) {
                        setPristine(true);
                        const editPath = generatePath(
                            routes.newAssessmentEdit.path,
                            {
                                projectId,
                                assessmentId: result.id,
                            },
                        );
                        history.replace(editPath);
                    }

                    alert.show(
                        'Successfully created assessment registry!',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create assessment registry.',
                    { variant: 'error' },
                );
            },
        },
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
                            disabled={createAssessmentRegistryPending
                                || assessmentRegistryDetailLoading}
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
                                regionOptions={regionOptions}
                                setRegionOptions={setRegionOptions}
                                stakeholderOptions={stakeholderOptions}
                                setStakeholderOptions={setStakeholderOptions}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default EditAry;
