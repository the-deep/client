import React, { memo, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ButtonProps,
    Modal,
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import LeadPreview from '#components/lead/LeadPreview';
import { useModalState } from '#hooks/stateManagement';
import {
    ProjectLeadPreviewQuery,
    ProjectLeadPreviewQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const PROJECT_LEAD_PREVIEW = gql`
    query ProjectLeadPreview($projectId: ID!, $leadId: ID!) {
        project(id: $projectId) {
            id
            lead (id: $leadId) {
                id
                title
                url
                attachment {
                    id
                    title
                    mimeType
                    file {
                        url
                    }
                }
            }
        }
    }
`;

export type Props = {
    label?: React.ReactNode;
    title?: string;
    className?: string;
    variant?: ButtonProps<string>['variant'];
    projectId?: string;
    leadId?: string;
}

function LeadPreviewButton(props: Props) {
    const {
        className,
        label,
        variant,
        title,
        projectId,
        leadId,
    } = props;

    const variables = useMemo(
        () => ((leadId && projectId) ? ({
            leadId,
            projectId,
        }) : undefined),
        [leadId, projectId],
    );

    const {
        loading: leadLoading,
        data: lead,
    } = useQuery<ProjectLeadPreviewQuery, ProjectLeadPreviewQueryVariables>(
        PROJECT_LEAD_PREVIEW,
        {
            skip: !variables,
            variables,
        },
    );

    const leadData = lead?.project?.lead;

    const [
        isModalVisible,
        showModal,
        hideModal,
    ] = useModalState(false);

    return (
        <>
            {(!projectId && !leadId) ? (
                label
            ) : (
                <Button
                    name={undefined}
                    className={_cs(
                        !variant && styles.leadPreviewButton,
                        className,
                    )}
                    onClick={showModal}
                    title="Show lead preview"
                    variant={variant ?? 'transparent'}
                >
                    {label}
                </Button>
            )}
            {isModalVisible && (
                <Modal
                    className={styles.modal}
                    heading={title}
                    size="cover"
                    onCloseButtonClick={hideModal}
                    headerClassName={styles.header}
                    bodyClassName={styles.content}
                    spacing="none"
                >
                    {(!leadLoading && (leadData?.url || leadData?.attachment)) ? (
                        <LeadPreview
                            className={styles.preview}
                            url={leadData?.url ?? undefined}
                            attachment={leadData?.attachment ?? undefined}
                        />
                    ) : (
                        <Message
                            icon={<Kraken variant="sleep" />}
                            pending={leadLoading}
                            message="No preview available"
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default memo(LeadPreviewButton);
