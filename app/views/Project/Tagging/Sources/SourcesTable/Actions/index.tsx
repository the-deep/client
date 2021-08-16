import React, { useCallback } from 'react';
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
    ButtonLikeLink,
    QuickActionDropdownMenu,
    DropdownMenuItem,
    useConfirmation,
    Button,
    useBooleanState,
} from '@the-deep/deep-ui';

import useRouteMatching from '#base/hooks/useRouteMatching';
import routes from '#base/configs/routes';

import styles from './styles.css';

export interface Props<T extends number> {
    className?: string;
    id: T;
    onEditClick: (key: T) => void;
    onDeleteClick: (key: T) => void;
    disabled?: boolean;
    isAssessmentLead?: boolean;
    projectId: number;
}

function Actions<T extends number>(props: Props<T>) {
    const {
        className,
        id,
        onEditClick,
        disabled,
        isAssessmentLead,
        onDeleteClick,
        projectId,
    } = props;

    const route = useRouteMatching(
        routes.taggingFlow,
        {
            projectId,
            leadId: id,
        },
    );
    const taggingFlowLink = route?.to ?? '';

    const handleDeleteConfirm = useCallback(() => {
        onDeleteClick(id);
    }, [onDeleteClick, id]);

    const [
        isExpanded,,,,
        toggleExpansion,
    ] = useBooleanState(false);

    const [
        modal,
        onDeleteLeadClick,
    ] = useConfirmation({
        showConfirmationInitially: false,
        onConfirm: handleDeleteConfirm,
        message: 'Are you sure you want to delete this lead?',
    });

    return (
        <div className={_cs(styles.actions, className)}>
            <div className={styles.row}>
                <QuickActionButton
                    className={styles.button}
                    name={id}
                    onClick={onEditClick}
                    disabled={disabled}
                    title="edit"
                >
                    <MdModeEdit />
                </QuickActionButton>
                <ButtonLikeLink
                    className={styles.button}
                    variant="primary"
                    title="tag"
                    disabled={disabled}
                    to={taggingFlowLink}
                    icons={<IoAdd />}
                >
                    Tag
                </ButtonLikeLink>
                <QuickActionDropdownMenu
                    label={(
                        <IoEllipsisVerticalSharp />
                    )}
                    variant="secondary"
                >
                    <DropdownMenuItem
                        name="delete"
                        onClick={onDeleteLeadClick}
                    >
                        Delete
                    </DropdownMenuItem>
                </QuickActionDropdownMenu>
                {isAssessmentLead && (
                    <ButtonLikeLink
                        className={styles.button}
                        variant="secondary"
                        title="assessment"
                        disabled={disabled}
                        to="#"
                        icons={<IoAdd />}
                    >
                        Assessment
                    </ButtonLikeLink>
                )}
            </div>
            <div className={styles.row}>
                <Button
                    name={undefined}
                    onClick={toggleExpansion}
                    className={styles.actionButton}
                    variant="primary"
                    actions={isExpanded ? (
                        <IoChevronUpOutline />
                    ) : (
                        <IoChevronDownOutline />
                    )}
                    autoFocus
                >
                    Entries
                </Button>

            </div>
            {modal}
        </div>
    );
}

export default Actions;
