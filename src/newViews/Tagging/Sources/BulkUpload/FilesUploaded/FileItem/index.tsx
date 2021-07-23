import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';
import { IoTrashOutline } from 'react-icons/io5';

import { FileUploadResponse } from '../../types';
import styles from './styles.scss';


interface Props {
    className?: string;
    data: FileUploadResponse;
    onDeleteFile: (id: number) => void;
}

function FileItem(props: Props) {
    const {
        className,
        data,
        onDeleteFile,
    } = props;

    const handleDeleteClick = useCallback(() => {
        onDeleteFile(data.id);
    }, [onDeleteFile, data.id]);

    return (
        <div className={_cs(className, styles.item)}>
            <ElementFragments
                actions={
                    <QuickActionButton
                        name="remove"
                        title="Remove File"
                        onClick={handleDeleteClick}
                    >
                        <IoTrashOutline />
                    </QuickActionButton>
                }
                actionsContainerClassName={styles.actions}
                childrenContainerClassName={styles.content}
            >
                {data.title}
            </ElementFragments>
        </div>
    );
}


export default FileItem;
