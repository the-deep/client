import React, { useMemo, useCallback, useState } from 'react';
import {
    ListView,
    MultiSelectInput,
} from '@the-deep/deep-ui';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import {
    SetValueArg,
    ArrayError,
    // analyzeErrors,
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

import BooleanInput, { Option } from '#components/selections/BooleanInput';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import LeadPreview from '#components/lead/LeadPreview';
import LeadInput from '#components/lead/LeadInput';
import { PartialFormType } from '#components/lead/LeadInput/schema';

import ConnectorSourceItem, { ConnectorSourceLead } from './ConnectorSourceItem';

import styles from './styles.css';

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

    selectedConnectorSource: string | undefined;
    selectedConnectorSourceLead: ConnectorSourceLead | undefined;
    onSelectedConnectorSourceChange: React.Dispatch<React.SetStateAction<string | undefined>>;
    onSelectedConnectorSourceLeadChange: React.Dispatch<React.SetStateAction<
        ConnectorSourceLead | undefined
    >>;

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

    leads: PartialFormType[] | undefined;
    leadsError: ArrayError<PartialFormType[]> | undefined;
    onLeadChange: (val: SetValueArg<PartialFormType>, name: number | undefined) => void;

    selections: {
        [key: string]: {
            connectorId: string,
            connectorSourceId: string,
            connectorSourceLeadId: string,
            connectorLeadId: string,
        } | undefined,
    }
    onSelectionChange: (
        connectorSourceId: string,
        connectorSourceLead: ConnectorSourceLead,
    ) => void;
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

        selectedConnectorSource,
        selectedConnectorSourceLead,

        onSelectedConnectorSourceChange,
        onSelectedConnectorSourceLeadChange,

        leads,
        leadsError,
        onLeadChange,

        selections,
        onSelectionChange,
    } = props;

    const [extractionStatus, setExtractionStatus] = useState<string[] | undefined>();
    const [blocked, setBlocked] = useState<boolean | undefined>(false);

    // NOTE: needed to get lead information from connectorLead
    const leadsMapping = listToMap(
        leads,
        // FIXME: filter out leads without connectorLead (which should not happen)
        (lead) => lead.connectorLead ?? 'x',
        (lead) => lead,
    );

    const currentLeadIndex = (
        selectedConnectorSourceLead
            ? leads?.findIndex((lead) => (
                lead.connectorLead === selectedConnectorSourceLead.connectorLead.id
            ))
            : undefined
    ) ?? -1;

    const currentLead = leads?.[currentLeadIndex];

    const currentLeadError = currentLead
        ? leadsError?.[currentLead.clientId]
        : undefined;

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
                    onSelectedConnectorSourceChange((oldSelection) => {
                        const source = sources.find((item) => item.id === oldSelection);
                        return source ? oldSelection : sources[0].id;
                    });
                } else {
                    onSelectedConnectorSourceChange(undefined);
                }
            },
        },
    );

    const connectorSourceRendererParams = useCallback((key: string, data: ConnectorSourceMini) => ({
        connectorSourceId: key,
        title: data.title,
        onClick: onSelectedConnectorSourceChange,
        selected: key === selectedConnectorSource,
        projectId,
        connectorSourceLead: selectedConnectorSourceLead,
        onConnectorSourceLeadChange: onSelectedConnectorSourceLeadChange,

        leadsMapping,
        leadsError,

        selections,
        onSelectionChange,

        extractionStatus: extractionStatus as (ConnectorLeadExtractionStatusEnum[] | undefined),
        blocked,
    }), [
        leadsMapping,
        leadsError,

        onSelectedConnectorSourceLeadChange,
        onSelectedConnectorSourceChange,
        projectId,
        selectedConnectorSource,
        selectedConnectorSourceLead,

        selections,
        onSelectionChange,

        extractionStatus,
        blocked,
    ]);

    const connector = connectorDetailsData?.project?.unifiedConnector?.unifiedConnector;

    const loading = pendingConnectorDetails;

    return (
        <div className={_cs(className, styles.leadsPane)}>
            <div className={styles.leadsListingPane}>
                <h3>
                    Sources found
                </h3>
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
            </div>
            <div className={styles.leadDetailPane}>
                {currentLead ? (
                    <>
                        <LeadInput
                            name={currentLeadIndex}
                            value={currentLead}
                            onChange={onLeadChange}
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
                        />
                        <LeadPreview
                            className={styles.preview}
                            key={currentLead.clientId}
                            url={currentLead.url ?? undefined}
                        />
                    </>
                ) : (
                    <div>
                        Please select a source
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeadsPane;
