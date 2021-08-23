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
    ButtonLikeLink,
    QuickActionDropdownMenu,
    DropdownMenuItem,
    useConfirmation,
    Button,
    RowExpansionContext,
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
    entriesCount: number;
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
        entriesCount,
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
    ] = useConfirmation({
        showConfirmationInitially: false,
        onConfirm: handleDeleteConfirm,
        message: 'Are you sure you want to delete this lead?',
    });

    const isExpanded = id === expandedRowKey;
    const isDisabled = entriesCount < 1;

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
                    onClick={handleClick}
                    className={styles.button}
                    variant="primary"
                    disabled={isDisabled}
                    actions={isExpanded ? (
                        <IoChevronUpOutline />
                    ) : (
                        <IoChevronDownOutline />
                    )}
                >
                    {`${entriesCount} ${entriesCount === 1 ? 'Entry' : 'Entries'}`}
                </Button>

            </div>
            {modal}
        </div>
    );
}

export default Actions;
