import React, { useMemo, useCallback, useState, useContext } from 'react';
import {
    ListView,
    Container,
    Message,
    Kraken,
    Button,
    useAlert,
    DateDualRangeInput,
    TextInput,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    IoSearch,
    IoRefreshOutline,
} from 'react-icons/io5';
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
    useMutation,
} from '@apollo/client';

import {
    ProjectConnectorQuery,
    ProjectConnectorQueryVariables,
    UpdateConnectorLeadBlockStatusMutation,
    UpdateConnectorLeadBlockStatusMutationVariables,
    ProjectConnectorTriggerMutation,
    ProjectConnectorTriggerMutationVariables,
} from '#generated/types';

import { UserContext } from '#base/context/UserContext';
import BooleanInput, { Option } from '#components/selections/BooleanInput';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
// import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import LeadPreview from '#components/lead/LeadPreview';
import LeadInput from '#components/lead/LeadInput';
import { PartialFormType, PartialLeadType } from '#components/general/BulkUploadModal/schema';

import ConnectorSourceItem, { ConnectorSourceLead } from './ConnectorSourceItem';

import styles from './styles.css';

function useStateWithCallback<S, T>(
    defaultValue: S | (() => S),
    callback: (value: T) => void,
    callbackValue: T,
): [S, React.Dispatch<React.SetStateAction<S>>] {
    const [state, setState] = useState(defaultValue);

    const handler: typeof setState = (value) => {
        setState(value);
        callback(callbackValue);
    };

    const handleChange = useCallback(
        handler,
        [callback, callbackValue],
    );

    return [state, handleChange];
}

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
        leadPriorityOptions: __type(name: "LeadPriorityEnum") {
            enumValues {
                name
                description
            }
        }
        leadConfidentialityOptions: __type(name: "LeadConfidentialityEnum") {
            enumValues {
                name
                description
            }
        }
        project(id: $projectId) {
            id
            isAssessmentEnabled
            unifiedConnector {
                unifiedConnector(id: $connectorId) {
                    id
                    title
                    createdAt
                    isActive
                    sources {
                        id
                        createdAt
                        lastFetchedAt
                        title
                    }
                }
            }
        }
    }
`;

const UPDATE_CONNECTOR_LEAD_BLOCK_STATUS = gql`
    mutation UpdateConnectorLeadBlockStatus(
        $projectId: ID!,
        $data: ConnectorSourceLeadInputType!,
        $connectorSourceLeadId: ID!,
    ) {
        project(id: $projectId) {
            unifiedConnector {
                connectorSourceLeadUpdate(data: $data, id: $connectorSourceLeadId) {
                    errors
                    result {
                        id
                        source
                        blocked
                        alreadyAdded
                        connectorLead {
                            id
                            url
                            title
                            sourceRaw
                            publishedOn
                            authorRaw
                            authors {
                                id
                                mergedAs {
                                    id
                                    title
                                }
                                title
                            }
                            source {
                                id
                                title
                                mergedAs {
                                    id
                                    title
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const PROJECT_CONNECTOR_TRIGGER = gql`
    mutation ProjectConnectorTrigger(
        $projectId: ID!,
        $connectorId: ID!,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                unifiedConnectorTrigger(id: $connectorId) {
                    ok
                    errors
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
    // leadGroupOptions: BasicLeadGroup[] | undefined | null;
    // eslint-disable-next-line max-len
    // onLeadGroupOptionsChange: React.Dispatch<React.SetStateAction<BasicLeadGroup[] | undefined | null>>;
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
let csvUrlDerived: string | undefined;

function LeadsPane(props: Props) {
    const {
        className,
        connectorId,
        projectId,

        sourceOrganizationOptions,
        onSourceOrganizationOptionsChange,
        authorOrganizationOptions,
        onAuthorOrganizationOptionsChange,
        // leadGroupOptions,
        // onLeadGroupOptionsChange,
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
    const alert = useAlert();

    const [activePage, setActivePage] = useState(1);

    // Filters
    const [blocked, setBlocked] = useStateWithCallback<
        boolean | undefined,
        number
    >(false, setActivePage, 1);

    const [search, setSearch] = useStateWithCallback<
        string | undefined,
        number
    >(undefined, setActivePage, 1);

    const [dateFrom, setDateFrom] = useStateWithCallback<
        string | undefined,
        number
    >(undefined, setActivePage, 1);
    const [dateTo, setDateTo] = useStateWithCallback<
        string | undefined,
        number
    >(undefined, setActivePage, 1);

    // Temporary selections
    const [
        selectedConnectorSource,
        setSelectedConnectorSource,
    ] = useStateWithCallback<
        string | undefined,
        number
    >(undefined, setActivePage, 1);

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
            let urlDerived;

            try {
                const urlObject = JSON.parse(suggestedLead.url.replace(/'/g, '"'));
                urlDerived = urlObject.pdf;
                csvUrlDerived = urlObject.csv;
            } catch (error) {
                urlDerived = suggestedLead.url;
                csvUrlDerived = undefined;
            }
            const newLead = {
                clientId: randomString(),
                sourceType: 'WEBSITE' as const,
                priority: 'LOW' as const,
                confidentiality: 'UNPROTECTED' as const,
                isAssessmentLead: false,
                assignee: user?.id,

                url: urlDerived,
                csvUrl: csvUrlDerived,
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
                        {
                            ...user,
                            emailDisplay: user.email ?? '',
                        },
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
        [setSelectedConnectorSource],
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

    const [
        updateConnectorLeadBlockStatus,
        { loading: updateConnectorLeadBlockStatusLoading },
    ] = useMutation<
        UpdateConnectorLeadBlockStatusMutation,
        UpdateConnectorLeadBlockStatusMutationVariables
    >(
        UPDATE_CONNECTOR_LEAD_BLOCK_STATUS,
        {
            onCompleted: (response) => {
                if (!response?.project?.unifiedConnector?.connectorSourceLeadUpdate) {
                    return;
                }
                const {
                    errors,
                    result,
                } = response.project.unifiedConnector.connectorSourceLeadUpdate;

                if (errors) {
                    alert.show(
                        'There was an issue changing source ignore status!',
                        { variant: 'error' },
                    );
                }
                if (result) {
                    setSelectedConnectorLead((item) => (
                        !item || item.id === result.id ? result : item
                    ));
                    alert.show(
                        'Successfully changed source ignore status',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'There was an issue changing source ignore status!',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        triggerConnector,
        {
            loading: pendingConnectorTrigger,
        },
    ] = useMutation<ProjectConnectorTriggerMutation, ProjectConnectorTriggerMutationVariables>(
        PROJECT_CONNECTOR_TRIGGER,
        {
            onCompleted: (response) => {
                if (response?.project?.unifiedConnector?.unifiedConnectorTrigger?.ok) {
                    alert.show(
                        'Successfully triggered connector.',
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to trigger connector.',
                        {
                            variant: 'error',
                        },
                    );
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

    const handleAddRemoveLeadButtonClick = useCallback(
        (connectorSourceLead: ConnectorSourceLead) => {
            if (!selectedConnectorSource) {
                // eslint-disable-next-line no-console
                console.error('ConnectorSource or ConnectorSourceLead is not selected');
                return;
            }
            handleSelectionsForSelectedConnector(
                selectedConnectorSource,
                connectorSourceLead,
            );
        },
        [
            handleSelectionsForSelectedConnector,
            selectedConnectorSource,
        ],
    );

    const handleIgnoreLeadButtonClick = useCallback(
        (connectorSourceLead: ConnectorSourceLead) => {
            updateConnectorLeadBlockStatus({
                variables: {
                    projectId,
                    connectorSourceLeadId: connectorSourceLead.id,
                    data: {
                        blocked: !connectorSourceLead.blocked,
                    },
                },
            });
        },
        [
            updateConnectorLeadBlockStatus,
            projectId,
        ],
    );

    const handleRetriggerButtonClick = useCallback(() => {
        triggerConnector({
            variables: {
                projectId,
                connectorId,
            },
        });
    }, [
        triggerConnector,
        projectId,
        connectorId,
    ]);

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
        lastFetchedAt: data.lastFetchedAt ?? undefined,
        onClick: handleSelectedConnectorSourceChange,
        selected: key === selectedConnectorSource,
        projectId,
        connectorSourceLead: selectedConnectorSourceLead,
        onConnectorSourceLeadChange: handleSelectedConnectorSourceLeadChange,

        leadsByConnectorLeadMapping,
        leadsError,

        selections,
        onSelectionChange: handleSelectionsForSelectedConnector,

        activePage,
        setActivePage,

        blocked,
        disabled,
        search,
        dateFrom,
        dateTo,
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

        blocked,
        disabled,
        search,
        dateFrom,
        dateTo,

        activePage,
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
                        <TextInput
                            label="Search"
                            icons={<IoSearch />}
                            name={undefined}
                            onChange={setSearch}
                            value={search}
                        />
                        <DateDualRangeInput
                            label="Published At"
                            fromName={undefined}
                            toName={undefined}
                            fromOnChange={setDateFrom}
                            toOnChange={setDateTo}
                            fromValue={dateFrom}
                            toValue={dateTo}
                        />
                        <BooleanInput
                            options={blockedOptions}
                            name={undefined}
                            value={blocked}
                            onChange={setBlocked}
                            label="Ignored"
                        />
                    </div>
                )}
                headerActions={(
                    <QuickActionButton
                        name={undefined}
                        className={styles.retriggerButton}
                        onClick={handleRetriggerButtonClick}
                        disabled={pendingConnectorTrigger}
                        title="Retrigger connector"
                        variant="secondary"
                    >
                        <IoRefreshOutline />
                    </QuickActionButton>
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
                {(selectedConnectorSourceLead && currentLead) ? (
                    <Container
                        className={styles.leadContainer}
                        heading={currentLead.title || 'Unnamed'}
                        ellipsizeHeading
                        headingSize="extraSmall"
                        contentClassName={styles.content}
                        headerActions={(
                            <>
                                {getCsvUrlDerived() && (
                                    <Button
                                        name={undefined}
                                        onClick={() => {
                                            const csvUrl = getCsvUrlDerived();
                                            if (csvUrl) {
                                                const link = document.createElement('a');
                                                link.href = csvUrl;
                                                link.download = 'leads.csv';
                                                link.click();
                                            } else {
                                                console.error('CSV URL is not available');
                                            }
                                        }}
                                        csv
                                    >
                                        CSV
                                    </Button>
                                )}
                                <Button
                                    name={selectedConnectorSourceLead}
                                    onClick={handleIgnoreLeadButtonClick}
                                    variant="secondary"
                                    disabled={
                                        updateConnectorLeadBlockStatusLoading
                                        || disabled
                                    }
                                >
                                    {selectedConnectorSourceLead.blocked
                                        ? 'Un-ignore'
                                        : 'Ignore'}
                                </Button>
                                <Button
                                    name={selectedConnectorSourceLead}
                                    onClick={handleAddRemoveLeadButtonClick}
                                    variant="secondary"
                                >
                                    {(currentLead.connectorLead
                                      && !!selections[currentLead.connectorLead])
                                        ? 'Remove'
                                        : 'Add'}
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
                            confidentialityOptions={
                                connectorDetailsData?.leadConfidentialityOptions?.enumValues
                            }
                            sourceOrganizationOptions={sourceOrganizationOptions}
                            onSourceOrganizationOptionsChange={onSourceOrganizationOptionsChange}
                            authorOrganizationOptions={authorOrganizationOptions}
                            onAuthorOrganizationOptionsChange={onAuthorOrganizationOptionsChange}
                            // leadGroupOptions={leadGroupOptions}
                            // onLeadGroupOptionsChange={onLeadGroupOptionsChange}
                            assigneeOptions={assigneeOptions}
                            onAssigneeOptionChange={onAssigneeOptionChange}
                            hasAssessment={connectorDetailsData?.project?.isAssessmentEnabled}
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

export function getCsvUrlDerived() {
    return csvUrlDerived;
}

export default LeadsPane;
