import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Card,
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
        },
    );

    const sourceRendererParams = useCallback((_: string, lead: Lead) => ({
        className: styles.lead,
        lead,
        projectId,
    }), [projectId]);

    const pending = leadsPending || leadDuplicatesPending;
    const originalLead = leadsResponse?.project?.leads?.results?.find(
        (lead) => lead.id === leadId,
    );
    const duplicateLeads = leadsResponse?.project?.leads?.results?.filter(
        (lead) => lead.id !== leadId,
    );

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
                <Card className={styles.originalLead}>
                    <LeadCard
                        lead={originalLead}
                        projectId={projectId}
                    />
                </Card>

            )}
            <Card className={styles.duplicateLead}>
                Duplicate Lead
            </Card>
            <ListView
                className={_cs(
                    styles.leads,
                    (duplicateLeads?.length ?? 0) < 1 && styles.empty,
                )}
                data={duplicateLeads}
                renderer={LeadCard}
                rendererParams={sourceRendererParams}
                keySelector={sourceKeySelector}
                pending={leadDuplicatesPending}
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
