import React, { useMemo, useCallback, useState, useContext } from 'react';
import {
    ListView,
    MultiSelectInput,
    Container,
    Message,
    Kraken,
    Button,
} from '@the-deep/deep-ui';
import {
    _cs,
    listToMap,
    randomString,
    unique,
} from '@togglecorp/fujs';
import {
    SetValueArg,
    ArrayError,
    // analyzeErrors,
    EntriesAsList,
} from '@togglecorp/toggle-form';
import {
    gql,
    useQuery,
} from '@apollo/client';

import {
    ProjectConnectorQuery,
    ProjectConnectorQueryVariables,
    ConnectorLeadExtractionStatusEnum,
} from '#generated/types';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';

import { UserContext } from '#base/context/UserContext';
import BooleanInput, { Option } from '#components/selections/BooleanInput';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import LeadPreview from '#components/lead/LeadPreview';
import LeadInput from '#components/lead/LeadInput';
import { PartialFormType, PartialLeadType } from '#views/Project/Tagging/Sources/BulkUploadModal/schema';

import ConnectorSourceItem, { ConnectorSourceLead } from './ConnectorSourceItem';

import styles from './styles.css';

interface Selection {
    [key: string]: {
        connectorId: string,
        connectorSourceId: string,
        connectorSourceLeadId: string,
        connectorLeadId: string,
    } | undefined,
}

const blockedOptions: Option[] = [
    {
        key: 'true',
        value: 'Yes',
    },
    {
        key: 'false',
        value: 'No',
    },
];

type ConnectorSourceMini = NonNullable<NonNullable<NonNullable<NonNullable<NonNullable<ProjectConnectorQuery>['project']>['unifiedConnector']>['unifiedConnector']>['sources']>[number];

const connectorSourceKeySelector = (d: ConnectorSourceMini) => d.id;

const PROJECT_CONNECTOR_DETAILS = gql`
    query ProjectConnector(
        $projectId: ID!,
        $connectorId: ID!,
    ) {
        connectorLeadExtractionStatusOptions: __type(name: "ConnectorLeadExtractionStatusEnum") {
            enumValues {
                name
                description
            }
        }
        leadPriorityOptions: __type(name: "LeadPriorityEnum") {
            enumValues {
                name
                description
            }
        }
        project(id: $projectId) {
            id
            hasAssessmentTemplate
            unifiedConnector {
                unifiedConnector(id: $connectorId) {
                    id
                    title
                    createdAt
                    isActive
                    sources {
                        id
                        createdAt
                        title
                    }
                }
            }
        }
    }
`;

interface Props {
    className?: string;
    connectorId: string;
    projectId: string;

    sourceOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len
    onSourceOrganizationOptionsChange: React.Dispatch<React.SetStateAction<BasicOrganization[] | undefined | null>>;
    authorOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len
    onAuthorOrganizationOptionsChange: React.Dispatch<React.SetStateAction<BasicOrganization[] | undefined | null>>;
    leadGroupOptions: BasicLeadGroup[] | undefined | null;
    // eslint-disable-next-line max-len
    onLeadGroupOptionsChange: React.Dispatch<React.SetStateAction<BasicLeadGroup[] | undefined | null>>;
    assigneeOptions: BasicProjectUser[] | undefined | null;
    // eslint-disable-next-line max-len
    onAssigneeOptionChange: React.Dispatch<React.SetStateAction<BasicProjectUser[] | undefined | null>>;

    leads: PartialLeadType[] | undefined;
    leadsError: ArrayError<PartialLeadType[]> | undefined;
    onLeadChange: (val: SetValueArg<PartialLeadType>, name: number | undefined) => void;

    selections: Selection;
    setSelections: React.Dispatch<React.SetStateAction<Selection>>;

    setFormFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    disabled: boolean;
}

function LeadsPane(props: Props) {
    const {
        className,
        connectorId,
        projectId,

        sourceOrganizationOptions,
        onSourceOrganizationOptionsChange,
        authorOrganizationOptions,
        onAuthorOrganizationOptionsChange,
        leadGroupOptions,
        onLeadGroupOptionsChange,
        assigneeOptions,
        onAssigneeOptionChange,

        leads,
        leadsError,
        onLeadChange,

        selections,
        setSelections,
        setFormFieldValue,
        disabled,
    } = props;

    const { user } = useContext(UserContext);

    // Filters
    const [extractionStatus, setExtractionStatus] = useState<string[] | undefined>();
    const [blocked, setBlocked] = useState<boolean | undefined>(false);

    // Temporary selections
    const [
        selectedConnectorSource,
        setSelectedConnectorSource,
    ] = useState<string | undefined>();
    const [
        selectedConnectorSourceLead,
        setSelectedConnectorLead,
    ] = useState<ConnectorSourceLead | undefined>();

    const handleAddLeadToForm = useCallback(
        (connectorSourceLead: ConnectorSourceLead | undefined) => {
            if (!connectorSourceLead?.connectorLead) {
                return;
            }

            const suggestedLead = connectorSourceLead.connectorLead;

            const newLead = {
                clientId: randomString(),
                sourceType: 'WEBSITE' as const,
                priority: 'LOW' as const,
                confidentiality: 'UNPROTECTED' as const,
                isAssessmentLead: false,
                assignee: user?.id,

                url: suggestedLead.url,
                // FIXME: website is missing
                // website: suggestedLead.website,
                title: suggestedLead.title,
                publishedOn: suggestedLead.publishedOn,
                authors: suggestedLead.authors.map((item) => item.id),
                source: suggestedLead.source?.id,

                // NOTE: we should absolutely not miss this parameter
                connectorLead: suggestedLead.id,
            };
            const newAuthors = suggestedLead.authors;
            const newSources = suggestedLead.source ? [suggestedLead.source] : [];

            setFormFieldValue(
                (oldLeads) => {
                    if (!oldLeads || oldLeads.length <= 0) {
                        return [newLead];
                    }
                    const index = oldLeads.findIndex((oldValue) => (
                        !!oldValue.connectorLead
                        && oldValue.connectorLead === newLead.connectorLead
                    ));
                    return index === -1 ? [...oldLeads, newLead] : oldLeads;
                },
                'leads',
            );

            onSourceOrganizationOptionsChange((oldValues) => unique(
                [
                    ...(oldValues ?? []),
                    ...newSources,
                ],
                (item) => item.id,
            ));

            onAuthorOrganizationOptionsChange((oldValues) => unique(
                [
                    ...(oldValues ?? []),
                    ...newAuthors,
                ],
                (item) => item.id,
            ));

            if (user) {
                onAssigneeOptionChange((oldValues) => unique(
                    [
                        ...(oldValues ?? []),
                        user,
                    ],
                    (item) => item.id,
                ));
            }
        },
        [
            user,
            setFormFieldValue,
            onAssigneeOptionChange,
            onAuthorOrganizationOptionsChange,
            onSourceOrganizationOptionsChange,
        ],
    );

    const handleSelectedConnectorSourceLeadChange = useCallback<typeof setSelectedConnectorLead>(
        (connectorSourceLead) => {
            setSelectedConnectorLead((oldValue) => {
                if (typeof connectorSourceLead === 'function') {
                    const newConnectorSourceLead = connectorSourceLead(oldValue);
                    handleAddLeadToForm(newConnectorSourceLead);
                    return newConnectorSourceLead;
                }

                const newConnectorSourceLead = connectorSourceLead;
                handleAddLeadToForm(newConnectorSourceLead);
                return newConnectorSourceLead;
            });
        },
        [handleAddLeadToForm],
    );

    const handleSelectedConnectorSourceChange = useCallback<typeof setSelectedConnectorSource>(
        (value) => {
            setSelectedConnectorSource(value);
            setSelectedConnectorLead(undefined);
        },
        [],
    );

    const handleSelectionsForSelectedConnector = useCallback(
        (connectorSourceId: string, connectorSourceLead: ConnectorSourceLead) => {
            setSelections((oldValue) => {
                const connectorLeadId = connectorSourceLead.connectorLead.id;
                if (!oldValue[connectorLeadId]) {
                    // NOTE: only add to form if ticked
                    handleAddLeadToForm(connectorSourceLead);
                }
                const newValue = {
                    ...oldValue,
                    // NOTE: toggle between values
                    [connectorLeadId]: oldValue[connectorLeadId]
                        ? undefined
                        : {
                            connectorId,
                            connectorSourceId,
                            connectorSourceLeadId: connectorSourceLead.id,
                            connectorLeadId,
                        },
                };
                return newValue;
            });
        },
        [connectorId, handleAddLeadToForm, setSelections],
    );

    const handleAddLeadButtonClick = useCallback(() => {
        console.warn('add');
    }, []);

    const handleIgnoreLeadButtonClick = useCallback(() => {
        console.warn('ignore');
    }, []);

    const variables = useMemo(
        (): ProjectConnectorQueryVariables => ({
            projectId,
            connectorId,
        }),
        [
            projectId,
            connectorId,
        ],
    );

    const {
        loading: pendingConnectorDetails,
        data: connectorDetailsData,
        error,
    } = useQuery<ProjectConnectorQuery, ProjectConnectorQueryVariables>(
        PROJECT_CONNECTOR_DETAILS,
        {
            variables,
            onCompleted: (response) => {
                const sources = response?.project?.unifiedConnector?.unifiedConnector?.sources;
                if (sources && sources.length > 0) {
                    handleSelectedConnectorSourceChange((oldSelection) => {
                        const source = sources.find((item) => item.id === oldSelection);
                        return source ? oldSelection : sources[0].id;
                    });
                } else {
                    handleSelectedConnectorSourceChange(undefined);
                }
            },
        },
    );

    // NOTE: needed to get lead information from connectorLead
    const leadsByConnectorLeadMapping = useMemo(
        () => listToMap(
            leads,
            // FIXME: filter out leads without connectorLead (which should not happen)
            (lead) => lead.connectorLead ?? 'x',
            (lead) => lead,
        ),
        [leads],
    );

    const currentLeadIndex = useMemo(
        () => {
            const index = selectedConnectorSourceLead
                ? leads?.findIndex((lead) => (
                    lead.connectorLead === selectedConnectorSourceLead.connectorLead.id
                ))
                : undefined;
            return index ?? -1;
        },
        [leads, selectedConnectorSourceLead],
    );

    const currentLead = leads?.[currentLeadIndex];

    const currentLeadError = currentLead
        ? leadsError?.[currentLead.clientId]
        : undefined;

    const connectorSourceRendererParams = useCallback((key: string, data: ConnectorSourceMini) => ({
        connectorSourceId: key,
        title: data.title,
        onClick: handleSelectedConnectorSourceChange,
        selected: key === selectedConnectorSource,
        projectId,
        connectorSourceLead: selectedConnectorSourceLead,
        onConnectorSourceLeadChange: handleSelectedConnectorSourceLeadChange,

        leadsByConnectorLeadMapping,
        leadsError,

        selections,
        onSelectionChange: handleSelectionsForSelectedConnector,

        extractionStatus: extractionStatus as (ConnectorLeadExtractionStatusEnum[] | undefined),
        blocked,
        disabled,
    }), [
        leadsByConnectorLeadMapping,
        leadsError,

        handleSelectedConnectorSourceLeadChange,
        handleSelectedConnectorSourceChange,
        projectId,
        selectedConnectorSource,
        selectedConnectorSourceLead,

        selections,
        handleSelectionsForSelectedConnector,

        extractionStatus,
        blocked,
        disabled,
    ]);

    const connector = connectorDetailsData?.project?.unifiedConnector?.unifiedConnector;

    const loading = pendingConnectorDetails;

    return (
        <div className={_cs(className, styles.leadsPane)}>
            <Container
                className={styles.leadsListingPane}
                heading="Sources found"
                headingSize="small"
                headerDescription={(
                    <div className={styles.filters}>
                        <MultiSelectInput
                            name={undefined}
                            onChange={setExtractionStatus}
                            options={
                                connectorDetailsData
                                    ?.connectorLeadExtractionStatusOptions
                                    ?.enumValues
                            }
                            disabled={loading}
                            keySelector={enumKeySelector}
                            labelSelector={enumLabelSelector}
                            value={extractionStatus}
                            label="Status"
                        />
                        <BooleanInput
                            options={blockedOptions}
                            name={undefined}
                            value={blocked}
                            onChange={setBlocked}
                            label="Blocked"
                        />
                    </div>
                )}
            >
                {/* FIXME: add pagination; filter out certain variables */}
                <ListView
                    pending={loading}
                    errored={!!error}
                    filtered={false}
                    data={connector?.sources}
                    keySelector={connectorSourceKeySelector}
                    rendererParams={connectorSourceRendererParams}
                    renderer={ConnectorSourceItem}
                    messageShown
                    messageIconShown
                />
            </Container>
            <div className={styles.leadDetailPane}>
                {currentLead ? (
                    <Container
                        className={styles.leadContainer}
                        heading={currentLead.title || 'Unnamed'}
                        headingSize="extraSmall"
                        headerActions={(
                            <>
                                <Button
                                    name={undefined}
                                    onClick={handleIgnoreLeadButtonClick}
                                    variant="secondary"
                                    disabled
                                >
                                    Ignore
                                </Button>
                                <Button
                                    name={undefined}
                                    onClick={handleAddLeadButtonClick}
                                    variant="secondary"
                                    disabled
                                >
                                    Add
                                </Button>
                            </>
                        )}
                    >
                        <LeadInput
                            name={currentLeadIndex}
                            value={currentLead}
                            onChange={onLeadChange}
                            className={styles.leadInput}
                            pending={loading}
                            projectId={projectId}
                            error={currentLeadError}
                            attachment={undefined}
                            priorityOptions={connectorDetailsData?.leadPriorityOptions?.enumValues}
                            sourceOrganizationOptions={sourceOrganizationOptions}
                            onSourceOrganizationOptionsChange={onSourceOrganizationOptionsChange}
                            authorOrganizationOptions={authorOrganizationOptions}
                            onAuthorOrganizationOptionsChange={onAuthorOrganizationOptionsChange}
                            leadGroupOptions={leadGroupOptions}
                            onLeadGroupOptionsChange={onLeadGroupOptionsChange}
                            assigneeOptions={assigneeOptions}
                            onAssigneeOptionChange={onAssigneeOptionChange}
                            hasAssessment={connectorDetailsData?.project?.hasAssessmentTemplate}
                            disabled={disabled}
                        />
                        <LeadPreview
                            className={styles.preview}
                            key={currentLead.clientId}
                            url={currentLead.url ?? undefined}
                        />
                    </Container>
                ) : (
                    <Message
                        message="Please select a source"
                        icon={<Kraken variant="coffee" />}
                    />
                )}
            </div>
        </div>
    );
}

export default LeadsPane;
