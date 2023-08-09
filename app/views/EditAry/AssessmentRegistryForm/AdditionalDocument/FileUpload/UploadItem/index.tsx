import React, { useMemo } from 'react';
import { isDefined, _cs } from '@togglecorp/fujs';
import {
    ElementFragments,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    IoDocumentOutline,
    IoEyeOutline,
    IoTrashOutline,
} from 'react-icons/io5';

import { PartialAdditionalDocument } from '#views/EditAry/AssessmentRegistryForm/formSchema';
import { GalleryFileType } from '#generated/types';

import styles from './styles.css';

interface Props {
    className?: string;
    data?: PartialAdditionalDocument;
    onRemoveFile?: (key: string) => void;
    onChangeSelectedDocument?: (key: string) => void;
    uploadedList?: GalleryFileType[];
}

function UploadItem(props: Props) {
    const {
        className,
        data,
        onRemoveFile,
        onChangeSelectedDocument,
        uploadedList,
    } = props;

    const listAttachment = useMemo(
        () => uploadedList?.find((item) => item.id === data?.file),
        [data?.file, uploadedList],
    );
    const attachmentTitle = useMemo(
        () => listAttachment?.title ?? data?.externalLink,
        [listAttachment, data?.externalLink],
    );

    return (
        <div className={_cs(className, styles.uploadItem)}>
            {isDefined(data) ? (
                <ElementFragments
                    icons={<IoDocumentOutline className={styles.icon} />}
                    iconsContainerClassName={styles.icons}
                    actions={(
                        <>
                            <QuickActionButton
                                name={data.clientId}
                                onClick={onChangeSelectedDocument}
                                title="preview"
                            >
                                <IoEyeOutline />
                            </QuickActionButton>
                            <QuickActionButton
                                name={data.clientId}
                                onClick={onRemoveFile}
                                title="delete"
                            >
                                <IoTrashOutline />
                            </QuickActionButton>
                        </>
                    )}
                    actionsContainerClassName={styles.actions}
                    childrenContainerClassName={styles.content}
                >
                    {attachmentTitle}
                </ElementFragments>
            ) : null}
        </div>
    );
}

export default UploadItem;
