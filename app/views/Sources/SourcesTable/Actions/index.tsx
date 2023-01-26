import React, { useCallback, useContext, useMemo } from 'react';
import {
    IoAdd,
    IoEllipsisVerticalSharp,
    IoChevronUpOutline,
    IoChevronDownOutline,
    IoWarningOutline,
} from 'react-icons/io5';
import { _cs, isDefined } from '@togglecorp/fujs';
import { MdModeEdit } from 'react-icons/md';
import {
    QuickActionButton,
    QuickActionDropdownMenu,
    DropdownMenuItem,
    useConfirmation,
    Button,
    RowExpansionContext,
    useModalState,
    useAlert,
} from '@the-deep/deep-ui';
import {
    useMutation,
    gql,
} from '@apollo/client';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import { ProjectContext } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';
import {
    LeadStatusUpdateMutation,
    LeadStatusUpdateMutationVariables,
    LeadStatusEnum,
} from '#generated/types';

import LeadCopyModal from '../LeadCopyModal';

import styles from './styles.css';

const MAX_DUPLICATES = 10;

const LEAD_STATUS_UPDATE = gql`
    mutation LeadStatusUpdate(
        $projectId: ID!,
        $leadId: ID!,
        $status: LeadStatusEnum,
        $title: String!,
    ) {
        project(id: $projectId) {
            leadUpdate(
                data: {
                    title: $title,
                    status: $status,
                },
                id: $leadId
            ) {
                ok
                errors
                result {
                    id
                    status
                    statusDisplay
                }
            }
        }
    }
`;

export interface Props<T extends string> {
    className?: string;
    id: T;
    title: string;
    onEditClick: (key: T) => void;
    onDeleteClick: (key: T) => void;
    onShowDuplicatesClick: (key: T) => void;
    disabled?: boolean;
    isAssessmentLead?: boolean;
    entriesCount: number;
    filteredEntriesCount: number | null | undefined;
    hasAssessment: boolean;
    sourceStatus: LeadStatusEnum;
    projectId: string;
    duplicateLeadsCount: number | null | undefined;
}

function Actions<T extends string>(props: Props<T>) {
    const {
        className,
        id,
        title,
        disabled,
        isAssessmentLead,
        onEditClick,
        onDeleteClick,
        entriesCount,
        filteredEntriesCount,
        hasAssessment,
        sourceStatus,
        projectId,
        duplicateLeadsCount,
        onShowDuplicatesClick,
    } = props;

    const hasDuplicates = (duplicateLeadsCount ?? 0) > 0;
    const alert = useAlert();
    const { project } = useContext(ProjectContext);

    const canEditSource = project?.allowedPermissions.includes('UPDATE_LEAD');

    const [
        leadCopyModalShown,
        showLeadCopyModal,
        hideLeadCopyModal,
    ] = useModalState(false);

    const handleDeleteConfirm = useCallback(() => {
        onDeleteClick(id);
    }, [id, onDeleteClick]);

    const handleShowDuplicatesClick = useCallback(() => {
        onShowDuplicatesClick(id);
    }, [id, onShowDuplicatesClick]);

    const {
        expandedRowKey,
        setExpandedRowKey,
    } = useContext(RowExpansionContext);

    const variables = useMemo(
        (): LeadStatusUpdateMutationVariables => ({
            projectId,
            title,
            leadId: id,
            status: sourceStatus,
        }),
        [title, projectId, id, sourceStatus],
    );

    const [
        leadStatusUpdate,
        {
            loading: statusUpdatePending,
        },
    ] = useMutation<LeadStatusUpdateMutation, LeadStatusUpdateMutationVariables>(
        LEAD_STATUS_UPDATE,
        {
            variables,
            onCompleted: (response) => {
                if (response?.project?.leadUpdate?.ok) {
                    const newStatus = response?.project?.leadUpdate?.result?.status;
                    alert.show(
                        `Successfully marked source as ${newStatus === 'TAGGED' ? 'tagged' : 'in progress'}.`,
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to update source status.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to update source status.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleClick = useCallback(
        () => {
            const rowKey = id as string | number | undefined;
            setExpandedRowKey(
                (oldValue) => (oldValue === rowKey ? undefined : rowKey),
            );
        },
        [setExpandedRowKey, id],
    );

    const handleSourceStatusChange = useCallback(() => {
        leadStatusUpdate({
            variables: {
                projectId,
                title,
                leadId: id,
                status: (sourceStatus === 'IN_PROGRESS' ? 'TAGGED' : 'IN_PROGRESS'),
            },
        });
    }, [sourceStatus, projectId, title, id, leadStatusUpdate]);

    const [
        modal,
        onDeleteLeadClick,
    ] = useConfirmation<undefined>({
        showConfirmationInitially: false,
        onConfirm: handleDeleteConfirm,
        message: `Are you sure you want to delete this source? ${entriesCount} entry(s) ${hasAssessment ? 'and associated assessment' : ''} will be removed as well.`,
    });

    const isExpanded = id === expandedRowKey;
    const isDisabled = isDefined(filteredEntriesCount)
        ? filteredEntriesCount < 1
        : entriesCount < 1;
    const noOfEntries = filteredEntriesCount ?? entriesCount;

    return (
        <div className={_cs(styles.actions, className)}>
            <div className={styles.row}>
                {canEditSource && (
                    <QuickActionButton
                        className={styles.button}
                        name={id}
                        onClick={onEditClick}
                        disabled={disabled}
                        title="edit"
                    >
                        <MdModeEdit />
                    </QuickActionButton>
                )}
                <SmartButtonLikeLink
                    className={styles.button}
                    variant="primary"
                    title="tag"
                    disabled={disabled}
                    route={routes.entryEdit}
                    attrs={{
                        leadId: id,
                    }}
                    hash="#/primary-tagging"
                    icons={<IoAdd />}
                >
                    Tag
                </SmartButtonLikeLink>
                {hasDuplicates && (
                    <QuickActionButton
                        className={styles.showDuplicatesButton}
                        name={id}
                        onClick={handleShowDuplicatesClick}
                        disabled={disabled}
                        title={`${duplicateLeadsCount} duplicate leads`}
                    >
                        {(duplicateLeadsCount ?? 0) < MAX_DUPLICATES
                            ? duplicateLeadsCount : <IoWarningOutline />}
                    </QuickActionButton>
                )}
                {canEditSource && (
                    <QuickActionDropdownMenu
                        title="More options"
                        label={(
                            <IoEllipsisVerticalSharp />
                        )}
                        variant="secondary"
                        disabled={!!statusUpdatePending}
                    >
                        <DropdownMenuItem
                            onClick={showLeadCopyModal}
                            name={undefined}
                        >
                            Move to Other Projects
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDeleteLeadClick}
                            name={undefined}
                        >
                            Delete Source
                        </DropdownMenuItem>
                        {(sourceStatus === 'TAGGED' || sourceStatus === 'IN_PROGRESS') && (
                            <DropdownMenuItem
                                onClick={handleSourceStatusChange}
                                name={undefined}
                            >
                                {
                                    sourceStatus === 'IN_PROGRESS'
                                        ? 'Mark as Tagged'
                                        : 'Mark as In Progress'
                                }
                            </DropdownMenuItem>
                        )}
                    </QuickActionDropdownMenu>
                )}
                {isAssessmentLead && (
                    <SmartButtonLikeLink
                        className={styles.button}
                        variant="secondary"
                        title={hasAssessment ? 'Edit assessment' : 'Add assessment'}
                        disabled={disabled}
                        route={routes.assessmentEdit}
                        attrs={{
                            leadId: id,
                        }}
                        icons={hasAssessment ? <MdModeEdit /> : <IoAdd />}
                    >
                        Assessment
                    </SmartButtonLikeLink>
                )}
            </div>
            <div className={styles.row}>
                <Button
                    name={undefined}
                    onClick={handleClick}
                    className={styles.button}
                    variant="secondary"
                    disabled={isDisabled}
                    actions={isExpanded ? (
                        <IoChevronUpOutline />
                    ) : (
                        <IoChevronDownOutline />
                    )}
                >
                    {`${isDefined(filteredEntriesCount) ? `${noOfEntries}/${entriesCount}` : entriesCount} ${noOfEntries === 1 ? 'Entry' : 'Entries'}`}
                </Button>
            </div>
            {modal}
            {leadCopyModalShown && project?.id && (
                <LeadCopyModal
                    projectId={project.id}
                    onClose={hideLeadCopyModal}
                    leadIds={[id]}
                />
            )}
        </div>
    );
}

export default Actions;
