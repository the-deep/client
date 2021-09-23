import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';
import { IoTrashOutline } from 'react-icons/io5';

import {
    PartialLeadType,
} from '../../schema';
import styles from './styles.css';

interface Props {
    className?: string;
    isSelected: boolean;
    data: PartialLeadType;
    onSelect: (id: string) => void;
    onDeleteFile: (id: string) => void;
}

function FileItem(props: Props) {
    const {
        className,
        isSelected,
        data,
        onDeleteFile,
        onSelect,
    } = props;

    const handleDeleteClick = useCallback(() => {
        if (data.attachment) {
            onDeleteFile(data.attachment);
        }
    }, [onDeleteFile, data.attachment]);

    const handleSelect = useCallback(() => {
        onSelect(data.clientId);
    }, [onSelect, data.clientId]);

    return (
        <div className={_cs(className, styles.itemContainer, isSelected && styles.selected)}>
            <ElementFragments
                actions={(
                    <QuickActionButton
                        name="remove"
                        title="Remove File"
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
                    {data.title}
                </div>
            </ElementFragments>
        </div>
    );
}

export default FileItem;
