import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
    RawButton,
    PendingMessage,
    Kraken,
    Message,
} from '@the-deep/deep-ui';
import {
    getErrorObject,
    ArrayError,
} from '@togglecorp/toggle-form';
import { getOperationName } from 'apollo-link';

import { apolloClient } from '#base/configs/apollo';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
// import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';

import { PartialLeadType } from '#components/general/BulkUploadModal/schema';
import { PROJECT_SOURCES } from '#views/Sources/queries';
import { useBulkLeads, Req, Res, Err } from '#components/general/BulkUploadModal/hook';
import { RequestItem } from '#hooks/useBatchManager';

import { CONNECTOR_SOURCE_LEADS } from './LeadsPane/ConnectorSourceItem';
import ProjectConnectorsPane from './ProjectConnectorsPane';
import { CONNECTOR_SOURCES_COUNT } from '../queries';
import LeadsPane from './LeadsPane';
import FormLeadsPane from './FormLeadsPane';
import styles from './styles.css';

interface Selections {
    [connectorLeadId: string]: {
        connectorId: string,
        connectorSourceId: string,
        connectorSourceLeadId: string,
        connectorLeadId: string,
    } | undefined,
}

function isSubmitableLead(lead: PartialLeadType, selections: Selections) {
    return !!lead.connectorLead && !!selections[lead.connectorLead];
}

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

    // temporary selections
    const [selectedConnector, setSelectedConnector] = useState<string | undefined>();

    // temporary selection
    const [formLeadsShown, setFormLeadsShown] = useState<boolean>(false);

    const handleSelectedConnectorChange = useCallback<typeof setSelectedConnector>(
        (value) => {
            setFormLeadsShown(false);
            setSelectedConnector(value);
        },
        [],
    );

    // form related states
    const [
        selections,
        setSelections,
    ] = useState<Selections>({});

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

    /*
    const [
        leadGroupOptions,
        setLeadGroupOptions,
    ] = useState<BasicLeadGroup[] | undefined | null>();
     */

    const handleBulkRequestComplete = useCallback(
        (requests: RequestItem<string, Req, Res, Err>[]) => {
            const failedRequests = requests.filter(
                (request) => request.status !== 'completed',
            );
            if (failedRequests.length <= 0) {
                setFormLeadsShown(false);
            }

            apolloClient.refetchQueries({
                include: [
                    getOperationName(PROJECT_SOURCES),
                    getOperationName(CONNECTOR_SOURCE_LEADS),
                    getOperationName(CONNECTOR_SOURCES_COUNT),
                ].filter(isDefined),
            });
        },
        [],
    );

    const getSubmitableLeads = useCallback(
        (leadItem: PartialLeadType) => {
            const selected = isSubmitableLead(leadItem, selections);
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
        handleSubmit,
        setFormFieldValue,
    } = useBulkLeads(
        projectId,
        handleBulkRequestComplete,
        getSubmitableLeads,
    );

    const handleSubmission = useCallback<typeof handleSubmit>(
        (...args) => {
            setFormLeadsShown(true);
            handleSubmit(...args);
        },
        [setFormLeadsShown, handleSubmit],
    );

    const leadsError: ArrayError<PartialLeadType[]> | undefined = getErrorObject(
        getErrorObject(formError)?.leads,
    );

    const leads = formValue?.leads;

    const submitableLeadsCount = useMemo(
        () => leads?.filter((lead) => isSubmitableLead(lead, selections))?.length ?? 0,
        [leads, selections],
    );

    const handleSourcesToBeAddedButtonClick = useCallback(() => {
        setFormLeadsShown(true);
    }, []);

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
                        || submitableLeadsCount <= 0
                    }
                    onClick={handleSubmission}
                >
                    Save
                </Button>
            )}
        >
            {bulkUpdateLeadsPending && <PendingMessage />}
            <div className={styles.leftPane}>
                {submitableLeadsCount > 0 && (
                    <RawButton
                        name={undefined}
                        className={_cs(
                            styles.item,
                            formLeadsShown && styles.selected,
                        )}
                        onClick={handleSourcesToBeAddedButtonClick}
                    >
                        <div className={styles.title}>
                            Added Sources
                        </div>
                        <div className={styles.createdOn}>
                            {`${submitableLeadsCount} source(s) will be added`}
                        </div>
                    </RawButton>
                )}
                <ProjectConnectorsPane
                    className={styles.projectConnectorPane}
                    projectId={projectId}
                    selectedConnector={formLeadsShown ? undefined : selectedConnector}
                    setSelectedConnector={handleSelectedConnectorChange}
                />
            </div>
            {formLeadsShown && (
                <FormLeadsPane
                    className={styles.leadsPane}
                    projectId={projectId}
                    sourceOrganizationOptions={sourceOrganizationOptions}
                    onSourceOrganizationOptionsChange={setSourceOrganizationOptions}
                    authorOrganizationOptions={authorOrganizationOptions}
                    onAuthorOrganizationOptionsChange={setAuthorOrganizationOptions}
                    // leadGroupOptions={leadGroupOptions}
                    // onLeadGroupOptionsChange={setLeadGroupOptions}
                    assigneeOptions={projectUserOptions}
                    onAssigneeOptionChange={setProjectUserOptions}
                    selections={selections}
                    setSelections={setSelections}
                    leads={formValue.leads}
                    leadsError={leadsError}
                    onLeadChange={handleLeadChange}
                    disabled={bulkUpdateLeadsPending}
                />
            )}
            {!formLeadsShown && selectedConnector && (
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
                    // leadGroupOptions={leadGroupOptions}
                    // onLeadGroupOptionsChange={setLeadGroupOptions}
                    assigneeOptions={projectUserOptions}
                    onAssigneeOptionChange={setProjectUserOptions}
                    selections={selections}
                    setSelections={setSelections}
                    setFormFieldValue={setFormFieldValue}
                    leads={formValue.leads}
                    leadsError={leadsError}
                    onLeadChange={handleLeadChange}
                    disabled={bulkUpdateLeadsPending}
                />
            )}
            {!formLeadsShown && !selectedConnector && (
                <Message
                    className={styles.leadsPane}
                    icon={<Kraken variant="coffee" />}
                    message="Please select a connector"
                />
            )}
        </Modal>
    );
}

export default UnifiedConnectorModal;
