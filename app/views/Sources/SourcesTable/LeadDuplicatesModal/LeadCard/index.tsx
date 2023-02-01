import React, { useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    Container,
    DateOutput,
    QuickActionButton,
    QuickActionConfirmButton,
    TextOutput,
    useAlert,
} from '@the-deep/deep-ui';
import {
    IoTrashBinOutline,
    IoChevronDown,
    IoChevronUp,
} from 'react-icons/io5';
import { useMutation } from '@apollo/client';

import ProjectContext from '#base/context/ProjectContext';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import { useModalState } from '#hooks/stateManagement';
import {
    DeleteLeadMutation,
    DeleteLeadMutationVariables,
    LeadDuplicatesQuery,
} from '#generated/types';
import { DELETE_LEAD } from '#views/Sources/queries';

import styles from './styles.css';

export type Lead = NonNullable<NonNullable<LeadDuplicatesQuery['project']>['lead']>;

interface Props {
    className?: string;
    lead: Lead;
    projectId: string;
    activeDuplicateLeadId?: string;
    onPreviewClick?: (id: string) => void;
    onDeleteSuccess: (id: string) => void;
    defaultHidden?: boolean;
}

function LeadCard(props: Props) {
    const {
        className,
        lead,
        projectId,
        onPreviewClick,
        activeDuplicateLeadId,
        onDeleteSuccess,
        defaultHidden = false,
    } = props;

    const alert = useAlert();
    const { project } = useContext(ProjectContext);
    const canDeleteLead = project?.allowedPermissions.includes('DELETE_LEAD');
    const [
        isDetailsShown,,,,
        toggleDetailsVisibility,
    ] = useModalState(!defaultHidden);

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
                    onDeleteSuccess(lead.id);
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

    const isActive = activeDuplicateLeadId === lead.id;
    return (
        <div
            className={_cs(
                styles.leadCard,
                className,
                isActive && styles.active,
            )}
        >
            <Container
                className={styles.sourceDetails}
                headingClassName={styles.heading}
                heading={lead.title}
                headingSize="extraSmall"
                headerActions={(
                    <QuickActionButton
                        name={undefined}
                        title={isDetailsShown ? 'Hide Details' : 'Show Details'}
                        onClick={toggleDetailsVisibility}
                    >
                        {isDetailsShown ? <IoChevronUp /> : <IoChevronDown />}
                    </QuickActionButton>
                )}
                headerDescription={isDetailsShown && (
                    <DateOutput
                        value={lead.publishedOn}
                    />
                )}
                footerActions={(
                    <>
                        {onPreviewClick && (
                            <Button
                                name={lead.id}
                                title="View"
                                variant="secondary"
                                onClick={onPreviewClick}
                                disabled={isActive}
                            >
                                Preview
                            </Button>
                        )}
                        {canDeleteLead && (
                            <QuickActionConfirmButton
                                name={undefined}
                                onConfirm={handleLeadDeleteConfirm}
                                disabled={leadDeletePending}
                                message="Are you sure you want to delete the source?"
                            >
                                <IoTrashBinOutline />
                            </QuickActionConfirmButton>
                        )}
                    </>
                )}
                contentClassName={isDetailsShown ? styles.content : styles.hidden}
            >
                {isDetailsShown && (
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
                )}
            </Container>
        </div>
    );
}

export default LeadCard;
