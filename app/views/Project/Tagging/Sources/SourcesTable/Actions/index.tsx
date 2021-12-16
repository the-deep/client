import React, { useCallback, useContext } from 'react';
import {
    IoAdd,
    IoEllipsisVerticalSharp,
    IoChevronUpOutline,
    IoChevronDownOutline,
} from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';
import { MdModeEdit } from 'react-icons/md';
import {
    QuickActionButton,
    QuickActionDropdownMenu,
    DropdownMenuItem,
    useConfirmation,
    Button,
    RowExpansionContext,
    useModalState,
} from '@the-deep/deep-ui';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import { ProjectContext } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';
import LeadCopyModal from '../LeadCopyModal';

import styles from './styles.css';

export interface Props<T extends string> {
    className?: string;
    id: T;
    onEditClick: (key: T) => void;
    onDeleteClick: (key: T) => void;
    disabled?: boolean;
    isAssessmentLead?: boolean;
    entriesCount: number;
    hasAssessment: boolean;
}

function Actions<T extends string>(props: Props<T>) {
    const {
        className,
        id,
        onEditClick,
        disabled,
        isAssessmentLead,
        onDeleteClick,
        entriesCount,
        hasAssessment,
    } = props;

    const { project } = useContext(ProjectContext);

    const canEditSource = project?.allowedPermissions.includes('UPDATE_LEAD');
    const canDeleteSource = project?.allowedPermissions.includes('DELETE_LEAD');

    const [
        leadCopyModalShown,
        showLeadCopyModal,
        hideLeadCopyModal,
    ] = useModalState(false);

    const handleDeleteConfirm = useCallback(() => {
        onDeleteClick(id);
    }, [onDeleteClick, id]);

    const {
        expandedRowKey,
        setExpandedRowKey,
    } = useContext(RowExpansionContext);

    const handleClick = useCallback(
        () => {
            const rowKey = id as string | number | undefined;
            setExpandedRowKey(
                (oldValue) => (oldValue === rowKey ? undefined : rowKey),
            );
        },
        [setExpandedRowKey, id],
    );

    const [
        modal,
        onDeleteLeadClick,
    ] = useConfirmation<undefined>({
        showConfirmationInitially: false,
        onConfirm: handleDeleteConfirm,
        message: `Are you sure you want to delete this source? ${entriesCount} entry(s) ${hasAssessment ? 'and associated assessment' : ''} will be removed as well.`,
    });

    const isExpanded = id === expandedRowKey;
    const isDisabled = entriesCount < 1;

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
                {canDeleteSource && (
                    <QuickActionDropdownMenu
                        label={(
                            <IoEllipsisVerticalSharp />
                        )}
                        variant="secondary"
                    >
                        <DropdownMenuItem
                            onClick={showLeadCopyModal}
                            name={undefined}
                        >
                            Move to other project
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDeleteLeadClick}
                            name={undefined}
                        >
                            Delete Source
                        </DropdownMenuItem>
                    </QuickActionDropdownMenu>
                )}
                {isAssessmentLead && (
                    <SmartButtonLikeLink
                        className={styles.button}
                        variant="secondary"
                        title="assessment"
                        disabled={disabled}
                        route={routes.assessmentEdit}
                        attrs={{
                            leadId: id,
                        }}
                        icons={<IoAdd />}
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
                    {`${entriesCount} ${entriesCount === 1 ? 'Entry' : 'Entries'}`}
                </Button>
                {/* TODO: Update entriesCount when parent has graphql */}
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
