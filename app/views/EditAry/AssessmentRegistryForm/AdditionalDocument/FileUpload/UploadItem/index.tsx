import React from 'react';
import { isDefined, isNotDefined, _cs } from '@togglecorp/fujs';
import {
    ElementFragments,
    QuickActionButton,
    Spinner,
} from '@the-deep/deep-ui';
import {
    IoDocumentOutline,
    IoEyeOutline,
    IoTrashOutline,
} from 'react-icons/io5';

import { useRequest } from '#base/utils/restRequest';

import styles from './styles.css';
import { FileUploadResponse } from '../../types';

interface Props {
    className?: string;
    data?: string;
    onRemoveFile?: (key: string) => void;
    onChangeSelectedDocument?: (key: string) => void;
}

function UploadItem(props: Props) {
    const {
        className,
        data,
        onRemoveFile,
        onChangeSelectedDocument,
    } = props;

    const {
        pending,
        response,
    } = useRequest<FileUploadResponse>({
        skip: isNotDefined(data),
        url: `server://files/${data}`,
    });

    const attachmentTitle = response?.title;

    return (isDefined(response) ? (
        <div className={_cs(className, styles.uploadItem)}>
            <ElementFragments
                icons={pending
                    ? <Spinner />
                    : <IoDocumentOutline className={styles.icon} />}
                iconsContainerClassName={styles.icons}
                actions={(
                    <QuickActionButton
                        name={response?.id}
                        onClick={onRemoveFile}
                        title="delete"
                    >
                        <IoTrashOutline />
                    </QuickActionButton>
                )}
                actionsContainerClassName={styles.actions}
                childrenContainerClassName={styles.content}
            >
                {attachmentTitle}
                <QuickActionButton
                    name={response.id}
                    onClick={onChangeSelectedDocument}
                    title="preview"
                >
                    <IoEyeOutline />
                </QuickActionButton>

            </ElementFragments>
        </div>
    ) : null);
}

export default UploadItem;
