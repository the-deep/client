import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import { MdModeEdit } from 'react-icons/md';
import {
    QuickActionButton,
    ButtonLikeLink,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export interface Props<T> {
    className?: string;
    id: T;
    onEditClick: (key: T) => void;
    disabled?: boolean;
}

function Actions<T>(props: Props<T>) {
    const {
        className,
        id,
        onEditClick,
        disabled,
    } = props;

    const handleEditButtonClick = useCallback(() => {
        onEditClick(id);
    }, [id, onEditClick]);

    return (
        <div className={_cs(styles.actions, className)}>
            <QuickActionButton
                className={styles.button}
                name="edit"
                onClick={handleEditButtonClick}
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
                to="#"
                icons={<IoAdd />}
            >
                Tag
            </ButtonLikeLink>
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
        </div>
    );
}


export default Actions;
