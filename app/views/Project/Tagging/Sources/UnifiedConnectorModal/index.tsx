import React, { useState, useCallback, useContext, useMemo } from 'react';
import {
    _cs,
    isDefined,
    unique,
    randomString,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    getErrorObject,
    ArrayError,
} from '@togglecorp/toggle-form';
import { getOperationName } from 'apollo-link';

import { apolloClient } from '#base/configs/apollo';
import { UserContext } from '#base/context/UserContext';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';

import { PartialFormType } from '#components/lead/LeadInput/schema';
import { PROJECT_SOURCES } from '#views/Project/Tagging/Sources/SourcesTable/queries';
import { useBulkLeads, Req, Res, Err } from '#views/Project/Tagging/Sources/BulkUploadModal/hook';
import { RequestItem } from '#hooks/useBatchManager';

import { ConnectorSourceLead, CONNECTOR_SOURCE_LEADS } from './LeadsPane/ConnectorSourceItem';
import ProjectConnectorsPane from './ProjectConnectorsPane';
import LeadsPane from './LeadsPane';
import styles from './styles.css';

interface Props {
    className?: string;
    onClose: () => void;
    projectId: string;
}

function UnifiedConnectorModal(props: Props) {
    const {
        className,
        onClose,
        projectId,
    } = props;

    const { user } = useContext(UserContext);

    const [
        selections,
        setSelections,
    ] = useState<
        {
            [connectorLeadId: string]: {
                connectorId: string,
                connectorSourceId: string,
                connectorSourceLeadId: string,
                connectorLeadId: string,
            } | undefined,
        }
    >({});

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<BasicProjectUser[] | undefined | null>();

    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        leadGroupOptions,
        setLeadGroupOptions,
    ] = useState<BasicLeadGroup[] | undefined | null>();

    const handleBulkRequestComplete = useCallback(
        (requests: RequestItem<string, Req, Res, Err>[]) => {
            // TODO: clear out selections that are already saved on server
            // eslint-disable-next-line no-console
            console.warn('Final requests after network call', requests);

            apolloClient.refetchQueries({
                include: [
                    getOperationName(PROJECT_SOURCES),
                    getOperationName(CONNECTOR_SOURCE_LEADS),
                ].filter(isDefined),
            });
        },
        [],
    );

    const filterFormLeads = useCallback(
        (leadItem: PartialFormType) => {
            const { connectorLead } = leadItem;
            const selected = !!connectorLead && !!selections[connectorLead];
            return selected;
        },
        [selections],
    );

    const {
        formValue,
        formPristine,
        formError,
        bulkUpdateLeadsPending,
        handleLeadChange,
        // handleLeadRemove,
        // FIXME: filter out leads without checks
        handleSubmit,
        setFormFieldValue,
    } = useBulkLeads(
        projectId,
        handleBulkRequestComplete,
        filterFormLeads,
    );

    const [selectedConnector, setSelectedConnector] = useState<string | undefined>();

    const [
        selectedConnectorSource,
        setSelectedConnectorSource,
    ] = useState<string | undefined>();

    const [
        selectedConnectorLead,
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

            setSourceOrganizationOptions((oldValues) => unique(
                [
                    ...(oldValues ?? []),
                    ...newSources,
                ],
                (item) => item.id,
            ));

            setAuthorOrganizationOptions((oldValues) => unique(
                [
                    ...(oldValues ?? []),
                    ...newAuthors,
                ],
                (item) => item.id,
            ));

            if (user) {
                setProjectUserOptions((oldValues) => unique(
                    [
                        ...(oldValues ?? []),
                        user,
                    ],
                    (item) => item.id,
                ));
            }
        },
        [user, setFormFieldValue],
    );

    const handleSelectedConnectorLeadChange = useCallback<typeof setSelectedConnectorLead>(
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

    const handleSelectedConnectorChange = useCallback<typeof setSelectedConnector>(
        (value) => {
            setSelectedConnectorSource(undefined);
            setSelectedConnectorLead(undefined);
            setSelectedConnector(value);
        },
        [],
    );

    const handleSelectionsForSelectedConnector = useCallback(
        (connectorSourceId: string, connectorSourceLead: ConnectorSourceLead) => {
            if (!selectedConnector) {
                return;
            }

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
                            connectorId: selectedConnector,
                            connectorSourceId,
                            connectorSourceLeadId: connectorSourceLead.id,
                            connectorLeadId,
                        },
                };
                return newValue;
            });

            // also add connector
        },
        [selectedConnector, handleAddLeadToForm],
    );

    const leadsError: ArrayError<PartialFormType[]> | undefined = getErrorObject(
        getErrorObject(formError)?.leads,
    );

    const leads = formValue?.leads;
    const validLeadsCount = useMemo(
        () => leads?.filter(
            (lead) => lead.connectorLead && !!selections[lead.connectorLead],
        ),
        [leads, selections],
    );

    return (
        <Modal
            className={_cs(className, styles.unifiedConnectorModal)}
            heading="Add sources from connectors"
            size="cover"
            onCloseButtonClick={onClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name={undefined}
                    disabled={
                        formPristine
                        || bulkUpdateLeadsPending
                        || (validLeadsCount?.length ?? 0) < 1
                    }
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {bulkUpdateLeadsPending && <PendingMessage />}
            <ProjectConnectorsPane
                className={styles.projectConnectorPane}
                projectId={projectId}
                selectedConnector={selectedConnector}
                setSelectedConnector={handleSelectedConnectorChange}
            />
            {selectedConnector ? (
                <LeadsPane
                    // NOTE: let's destroy everything
                    key={selectedConnector}
                    className={styles.leadsPane}
                    projectId={projectId}
                    connectorId={selectedConnector}
                    sourceOrganizationOptions={sourceOrganizationOptions}
                    onSourceOrganizationOptionsChange={setSourceOrganizationOptions}
                    authorOrganizationOptions={authorOrganizationOptions}
                    onAuthorOrganizationOptionsChange={setAuthorOrganizationOptions}
                    leadGroupOptions={leadGroupOptions}
                    onLeadGroupOptionsChange={setLeadGroupOptions}
                    assigneeOptions={projectUserOptions}
                    onAssigneeOptionChange={setProjectUserOptions}
                    selectedConnectorSource={selectedConnectorSource}
                    onSelectedConnectorSourceChange={handleSelectedConnectorSourceChange}
                    selectedConnectorSourceLead={selectedConnectorLead}
                    onSelectedConnectorSourceLeadChange={handleSelectedConnectorLeadChange}
                    // selection related props
                    selections={selections}
                    onSelectionChange={handleSelectionsForSelectedConnector}
                    // form related props
                    leads={formValue.leads}
                    leadsError={leadsError}
                    onLeadChange={handleLeadChange}
                />
            ) : (
                <div
                    className={styles.leadsPane}
                >
                    Please select a connector
                </div>
            )}
        </Modal>
    );
}

export default UnifiedConnectorModal;
