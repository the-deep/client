import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ElementFragments,
    QuickActionButton,
    Modal,
    useModalState,
} from '@the-deep/deep-ui';
import {
    IoDocumentOutline,
    IoEyeOutline,
    IoTrashOutline,
} from 'react-icons/io5';

import LeadPreview from '#components/lead/LeadPreview';

import { PartialAdditionalDocument } from '#views/EditAry/AssessmentRegistryForm/formSchema';
import { GalleryFileType } from '#generated/types';

import styles from './styles.css';

interface Props {
    className?: string;
    data: PartialAdditionalDocument;
    onRemoveFile?: (key: string) => void;
    uploadedList?: GalleryFileType[];
}

function UploadItem(props: Props) {
    const {
        className,
        data,
        onRemoveFile,
        uploadedList,
    } = props;

    const [
        isPreviewShown,
        showPreview,
        closePreview,
    ] = useModalState(false);

    const listAttachment = useMemo(
        () => uploadedList?.find((item) => item.id === data.file),
        [uploadedList, data],
    );

    const attachmentTitle = listAttachment?.title ?? data.externalLink;

    return (
        <div className={_cs(className, styles.uploadItem)}>
            <ElementFragments
                icons={<IoDocumentOutline className={styles.icon} />}
                iconsContainerClassName={styles.icons}
                actions={(
                    <>
                        <QuickActionButton
                            name={undefined}
                            onClick={showPreview}
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
                childrenContainerClassName={styles.content}
            >
                {attachmentTitle}
            </ElementFragments>
            {isPreviewShown && (
                <Modal
                    heading={attachmentTitle}
                    size="cover"
                    className={styles.modal}
                    bodyClassName={styles.modalBody}
                    onCloseButtonClick={closePreview}
                >
                    <LeadPreview
                        className={styles.leadPreview}
                        url={data.externalLink}
                        attachment={listAttachment}
                    />
                </Modal>
            )}
        </div>
    );
}

export default UploadItem;
