import React, { useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
    DateOutput,
    QuickActionConfirmButton,
    TextOutput,
    useAlert,
} from '@the-deep/deep-ui';
import { IoTrashBinOutline } from 'react-icons/io5';
import { useMutation } from '@apollo/client';

import ProjectContext from '#base/context/ProjectContext';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import {
    DeleteLeadMutation,
    DeleteLeadMutationVariables,
    LeadsQuery,
} from '#generated/types';
import { DELETE_LEAD } from '#views/Sources/queries';

import styles from './styles.css';

export type Lead = NonNullable<NonNullable<NonNullable<LeadsQuery['project']>['leads']>['results']>[number];

interface Props {
    className?: string;
    lead: Lead;
    projectId: string;
}

function LeadCard(props: Props) {
    const {
        className,
        lead,
        projectId,
    } = props;

    const alert = useAlert();
    const { project } = useContext(ProjectContext);
    const canDeleteLead = project?.allowedPermissions.includes('DELETE_LEAD');

    const [
        deleteLead,
        { loading: leadDeletePending },
    ] = useMutation<DeleteLeadMutation, DeleteLeadMutationVariables>(
        DELETE_LEAD,
        {
            onCompleted: (response) => {
                if (response?.project?.leadDelete?.ok) {
                    alert.show(
                        'Successfully deleted source.',
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to delete source.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete source.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleLeadDeleteConfirm = useCallback(() => {
        deleteLead({
            variables: {
                projectId,
                leadId: lead.id,
            },
        });
    }, [lead.id, projectId, deleteLead]);

    return (
        <div
            className={_cs(
                styles.leadCard,
                className,
            )}
        >
            <Container
                className={styles.sourceDetails}
                headingClassName={styles.heading}
                heading={lead.title}
                headingSize="small"
                headerDescription={(
                    <DateOutput
                        value={lead.publishedOn}
                    />
                )}
                footerQuickActions={canDeleteLead && (
                    <QuickActionConfirmButton
                        name={undefined}
                        onConfirm={handleLeadDeleteConfirm}
                        disabled={leadDeletePending}
                        message="Are you sure you want to delete the source?"
                    >
                        <IoTrashBinOutline />
                    </QuickActionConfirmButton>
                )}
                contentClassName={styles.content}
            >
                <div className={styles.metaSection}>
                    <TextOutput
                        label="Publisher"
                        value={lead.source ? organizationTitleSelector(lead.source) : undefined}
                    />
                    <TextOutput
                        label="Author"
                        value={lead.authors?.map(organizationTitleSelector).join(',')}
                    />
                    <TextOutput
                        label="Confidentiality"
                        value={lead.confidentialityDisplay}
                    />
                    <TextOutput
                        label="Priority"
                        value={lead.priorityDisplay}
                    />
                    <TextOutput
                        label="Status"
                        value={lead.statusDisplay}
                    />
                    <TextOutput
                        label="Total Entries"
                        value={lead.filteredEntriesCount ?? 0}
                    />
                </div>
            </Container>
        </div>
    );
}

export default LeadCard;
