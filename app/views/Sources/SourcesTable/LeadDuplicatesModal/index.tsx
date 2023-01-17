import React, { useCallback, useState } from 'react';
import {
    ContainerCard,
    Modal,
    PendingMessage,
    ListView,
    Kraken,
} from '@the-deep/deep-ui';

import { useQuery } from '@apollo/client';

import {
    LeadDuplicatesQuery,
    LeadDuplicatesQueryVariables,
    LeadsQuery,
    LeadsQueryVariables,
} from '#generated/types';
import LeadPreview from '#components/lead/LeadPreview';

import LeadCard, { Lead } from './LeadCard';
import { LEAD_DUPLICATES, LEADS } from './queries';
import styles from './styles.css';

const sourceKeySelector = (source: Lead) => source.id;

interface Props {
    projectId: string;
    leadId: string;
    onClose: () => void;
}

function LeadDuplicatesModal(props: Props) {
    const {
        projectId,
        leadId,
        onClose,
    } = props;

    const [activeDuplicateLeadId, setActiveDuplicateLeadId] = useState<string>();

    const {
        data: leadDuplicatesResponse,
        loading: leadDuplicatesPending,
    } = useQuery<LeadDuplicatesQuery, LeadDuplicatesQueryVariables>(
        LEAD_DUPLICATES,
        {
            variables: {
                projectId,
                duplicatesOf: leadId,
            },
        },
    );

    const {
        data: leadsResponse,
        loading: leadsPending,
    } = useQuery<LeadsQuery, LeadsQueryVariables>(
        LEADS,
        {
            variables: {
                projectId,
                ids: ['32', '31', '30', '28'],
            },
            onCompleted: (response) => {
                const duplicateLeads = response?.project?.leads?.results?.filter(
                    (lead) => lead.id !== leadId,
                );
                setActiveDuplicateLeadId(duplicateLeads?.[0].id);
            },
        },
    );

    const handlePreview = useCallback((id: string) => {
        setActiveDuplicateLeadId(id);
    }, []);

    const sourceRendererParams = useCallback((_: string, lead: Lead) => ({
        className: styles.lead,
        lead,
        projectId,
        onPreviewClick: handlePreview,
        activeDuplicateLeadId,
    }), [projectId, handlePreview, activeDuplicateLeadId]);

    const pending = leadsPending || leadDuplicatesPending;
    const originalLead = leadsResponse?.project?.leads?.results?.find(
        (lead) => lead.id === leadId,
    );
    const duplicateLeads = leadsResponse?.project?.leads?.results?.filter(
        (lead) => lead.id !== leadId,
    );

    const selectedDuplicateLead = duplicateLeads?.find((lead) => lead.id === activeDuplicateLeadId);

    return (
        <Modal
            className={styles.leadDuplicatesModal}
            onCloseButtonClick={onClose}
            heading="Duplicate Leads"
            bodyClassName={styles.modalBody}
            size="cover"
        >
            {pending && <PendingMessage />}
            {originalLead && (
                <ContainerCard
                    heading="Orginal Source"
                    headingSize="small"
                    className={styles.originalLeadContainer}
                    contentClassName={styles.orginalLead}
                >
                    <LeadCard
                        lead={originalLead}
                        projectId={projectId}
                    />
                    <LeadPreview
                        className={styles.preview}
                        url={originalLead.url}
                        attachment={originalLead.attachment}
                    />
                </ContainerCard>
            )}
            {selectedDuplicateLead && (
                <ContainerCard
                    heading="Duplicate Source"
                    headingSize="small"
                    className={styles.duplicateLeadContainer}
                    contentClassName={styles.duplicateLead}
                >
                    <LeadCard
                        lead={selectedDuplicateLead}
                        projectId={projectId}
                    />
                    <LeadPreview
                        className={styles.preview}
                        url={selectedDuplicateLead.url}
                        attachment={selectedDuplicateLead.attachment}
                    />
                </ContainerCard>
            )}
            <ListView
                className={styles.duplicates}
                data={duplicateLeads}
                renderer={LeadCard}
                rendererParams={sourceRendererParams}
                keySelector={sourceKeySelector}
                pending={false}
                filtered={false}
                errored={false}
                emptyIcon={(
                    <Kraken
                        size="large"
                        variant="work"
                    />
                )}
                emptyMessage="No sources found."
                messageIconShown
                messageShown
            />
        </Modal>
    );
}

export default LeadDuplicatesModal;
