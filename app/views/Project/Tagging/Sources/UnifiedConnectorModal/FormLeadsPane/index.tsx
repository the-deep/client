import React, { useMemo, useCallback, useState } from 'react';
import {
    ListView,
    Kraken,
} from '@the-deep/deep-ui';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    SetValueArg,
    ArrayError,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import {
    gql,
    useQuery,
} from '@apollo/client';

import {
    UnifiedConnectorLeadOptionsQuery,
    UnifiedConnectorLeadOptionsQueryVariables,
} from '#generated/types';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import LeadPreview from '#components/lead/LeadPreview';
import LeadInput from '#components/lead/LeadInput';
import { PartialLeadType } from '#views/Project/Tagging/Sources/BulkUploadModal/schema';

import ConnectorSourceLeadItem from '../LeadsPane/ConnectorSourceItem/ConnectorSourceLeadItem';

import styles from './styles.css';

const LEAD_OPTIONS = gql`
    query UnifiedConnectorLeadOptions(
        $projectId: ID!,
    ) {
        leadPriorityOptions: __type(name: "LeadPriorityEnum") {
            enumValues {
                name
                description
            }
        }
        project(id: $projectId) {
            id
            hasAssessmentTemplate
        }
    }
`;

interface Selections {
    [key: string]: {
        connectorId: string,
        connectorSourceId: string,
        connectorSourceLeadId: string,
        connectorLeadId: string,
    } | undefined,
}

function isSubmittableLead(lead: PartialLeadType, selections: Selections) {
    return !!lead.connectorLead && !!selections[lead.connectorLead];
}

interface Props {
    className?: string;
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

    selections: Selections;
    setSelections: React.Dispatch<React.SetStateAction<Selections>>;

    disabled: boolean;
}

function FormLeadsPane(props: Props) {
    const {
        className,
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

        disabled,
    } = props;

    // Temporary selections
    const [
        selectedLead,
        setSelectedLead,
    ] = useState<string | undefined>(() => (
        leads?.find((lead) => isSubmittableLead(lead, selections))?.clientId
    ));

    const currentLeadIndex = useMemo(
        () => {
            const index = selectedLead
                ? leads?.findIndex((lead) => (lead.clientId === selectedLead))
                : undefined;
            return index ?? -1;
        },
        [leads, selectedLead],
    );

    const currentLead = leads?.[currentLeadIndex];

    const currentLeadError = currentLead
        ? leadsError?.[currentLead.clientId]
        : undefined;

    const variables = useMemo(
        (): UnifiedConnectorLeadOptionsQueryVariables => ({
            projectId,
        }),
        [projectId],
    );

    const {
        loading,
        data: leadOptionsData,
    } = useQuery<UnifiedConnectorLeadOptionsQuery, UnifiedConnectorLeadOptionsQueryVariables>(
        LEAD_OPTIONS,
        {
            variables,
        },
    );

    const handleSelectedLeadChange = useCallback(
        (lead: PartialLeadType) => {
            setSelectedLead(lead.clientId);
        },
        [],
    );

    const handleSelectionsChange = useCallback(
        (lead: PartialLeadType) => {
            const { connectorLead } = lead;
            if (connectorLead) {
                setSelections((oldValue) => ({
                    ...oldValue,
                    [connectorLead]: undefined,
                }));
            }
        },
        [setSelections],
    );

    const connectorLeadRendererParams = useCallback((_: string, datum: PartialLeadType) => {
        const leadError = leadsError?.[datum.clientId];
        const { connectorLead } = datum;

        return {
            onClick: handleSelectedLeadChange,
            name: datum,
            selected: datum.clientId === selectedLead,

            checked: !!connectorLead && !!selections[connectorLead],
            onCheckClicked: handleSelectionsChange,

            title: datum.title,
            publishedOn: datum.publishedOn,

            faded: false,

            // NOTE: only showing errored for leads that are checked
            errored: analyzeErrors(leadError),
            disabled,
        };
    }, [
        selections,
        leadsError,
        selectedLead,
        handleSelectedLeadChange,
        handleSelectionsChange,
        disabled,
    ]);

    const submittableLeads = useMemo(
        () => {
            const filteredLeads = leads?.filter((lead) => isSubmittableLead(lead, selections));
            return filteredLeads;
        },
        [leads, selections],
    );

    return (
        <div className={_cs(className, styles.leadsPane)}>
            <div className={styles.leadsListingPane}>
                <h3>
                    Sources added
                </h3>
                <ListView
                    keySelector={(item) => item.clientId}
                    data={submittableLeads}
                    renderer={ConnectorSourceLeadItem}
                    rendererParams={connectorLeadRendererParams}
                    filtered={false}
                    pending={false}
                    errored={false}
                    emptyIcon={(
                        <Kraken
                            size="large"
                            variant="experiment"
                        />
                    )}
                    emptyMessage="No sources found."
                    messageIconShown
                    messageShown
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
                            priorityOptions={leadOptionsData?.leadPriorityOptions?.enumValues}
                            sourceOrganizationOptions={sourceOrganizationOptions}
                            onSourceOrganizationOptionsChange={onSourceOrganizationOptionsChange}
                            authorOrganizationOptions={authorOrganizationOptions}
                            onAuthorOrganizationOptionsChange={onAuthorOrganizationOptionsChange}
                            leadGroupOptions={leadGroupOptions}
                            onLeadGroupOptionsChange={onLeadGroupOptionsChange}
                            assigneeOptions={assigneeOptions}
                            onAssigneeOptionChange={onAssigneeOptionChange}
                            hasAssessment={leadOptionsData?.project?.hasAssessmentTemplate}
                            disabled={disabled}
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

export default FormLeadsPane;
