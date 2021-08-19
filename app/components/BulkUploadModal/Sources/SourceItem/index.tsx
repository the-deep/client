import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';
import { IoTrashOutline } from 'react-icons/io5';

import { FileUploadResponse } from '../../types';
import styles from './styles.css';

interface Props {
    className?: string;
    isSelected: boolean;
    data: FileUploadResponse;
    onSelect: (id: number) => void;
    onDelete: (id: number) => void;
}

function SourceItem(props: Props) {
    const {
        className,
        isSelected,
        data,
        onDelete,
        onSelect,
    } = props;

    const handleDeleteClick = useCallback(() => {
        onDelete(data.id);
    }, [onDelete, data.id]);

    const handleSelect = useCallback(() => {
        onSelect(data.id);
    }, [onSelect, data.id]);

    return (
        <div className={_cs(className, styles.itemContainer, isSelected && styles.selected)}>
            <ElementFragments
                actions={(
                    <QuickActionButton
                        name="remove"
                        title="Remove Source"
                        onClick={handleDeleteClick}
                    >
                        <IoTrashOutline />
                    </QuickActionButton>
                )}
                actionsContainerClassName={styles.actions}
                childrenContainerClassName={styles.content}
            >
                <div
                    className={_cs(styles.item)}
                    onClick={handleSelect}
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleSelect}
                >
                    {data.title ?? 'Unnamed'}
                </div>
            </ElementFragments>
        </div>
    );
}

export default SourceItem;
