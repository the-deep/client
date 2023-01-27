import React, { useCallback, useState, useMemo } from 'react';
import {
    Card,
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
} from '#generated/types';
import LeadPreview from '#components/lead/LeadPreview';

import LeadCard, { Lead } from './LeadCard';
import { LEAD_DUPLICATES } from './queries';
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
        refetch: getLeadDuplicates,
    } = useQuery<LeadDuplicatesQuery, LeadDuplicatesQueryVariables>(
        LEAD_DUPLICATES,
        {
            variables: {
                projectId,
                duplicatesOf: leadId,
            },
            onCompleted: (response) => {
                if ((response?.project?.leads?.results?.length ?? 0) > 0) {
                    setActiveDuplicateLeadId(response?.project?.leads?.results?.[0].id);
                } else {
                    onClose();
                }
            },
        },
    );

    const handlePreview = useCallback((id: string) => {
        setActiveDuplicateLeadId(id);
    }, []);

    const handleDeleteSuccess = useCallback((id: string) => {
        if (id === leadId) {
            onClose();
        } else {
            getLeadDuplicates();
        }
    }, [leadId, getLeadDuplicates, onClose]);

    const sourceRendererParams = useCallback((_: string, lead: Lead) => ({
        className: styles.lead,
        lead,
        projectId,
        onPreviewClick: handlePreview,
        onDeleteSuccess: handleDeleteSuccess,
        activeDuplicateLeadId,
    }), [projectId, handlePreview, activeDuplicateLeadId, handleDeleteSuccess]);

    const selectedDuplicateLead = useMemo(() => (
        leadDuplicatesResponse
            ?.project?.leads?.results?.find((lead) => lead.id === activeDuplicateLeadId)
    ), [leadDuplicatesResponse, activeDuplicateLeadId]);

    const originalLead = leadDuplicatesResponse?.project?.lead;

    return (
        <Modal
            className={styles.leadDuplicatesModal}
            onCloseButtonClick={onClose}
            heading="Duplicate Lead"
            bodyClassName={styles.modalBody}
            size="cover"
        >
            {leadDuplicatesPending && <PendingMessage />}
            <ContainerCard
                heading="Orginal Source"
                headingSize="small"
                className={styles.leadContainer}
                contentClassName={styles.lead}
            >
                {originalLead && (
                    <>
                        <LeadCard
                            lead={originalLead}
                            projectId={projectId}
                            onDeleteSuccess={handleDeleteSuccess}
                        />
                        <Card className={styles.previewContainer}>
                            <LeadPreview
                                className={styles.preview}
                                url={originalLead.url}
                                attachment={originalLead.attachment}
                            />
                        </Card>
                    </>
                )}
            </ContainerCard>
            <ContainerCard
                heading="Duplicate Source"
                headingSize="small"
                className={styles.leadContainer}
                contentClassName={styles.lead}
            >
                {selectedDuplicateLead && (
                    <>
                        <LeadCard
                            lead={selectedDuplicateLead}
                            projectId={projectId}
                            onDeleteSuccess={handleDeleteSuccess}
                        />
                        <Card className={styles.previewContainer}>
                            <LeadPreview
                                className={styles.preview}
                                url={selectedDuplicateLead.url}
                                attachment={selectedDuplicateLead.attachment}
                            />
                        </Card>
                    </>
                )}
            </ContainerCard>
            <ListView
                className={styles.duplicates}
                data={leadDuplicatesResponse?.project?.leads?.results}
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
