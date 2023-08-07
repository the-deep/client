import React, { useCallback, useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { Modal } from '@the-deep/deep-ui';

import LeadPreview from '#components/lead/LeadPreview';
import { GalleryFileType } from '#generated/types';

interface Props {
    attachmentId?: string;
    onChangeSelectedAttachment: React.Dispatch<React.SetStateAction<string | undefined>>;
    link?: string;
    uploadItems?: GalleryFileType[];
}

function Preview(props: Props) {
    const {
        attachmentId,
        onChangeSelectedAttachment,
        link,
        uploadItems,
    } = props;

    const handleModalClose = useCallback(() => {
        onChangeSelectedAttachment(undefined);
    }, [onChangeSelectedAttachment]);

    const attachmentData = useMemo(
        () => {
            const previewItem = uploadItems?.find((item) => item.id === attachmentId);
            return {
                id: previewItem?.id,
                title: previewItem?.title,
                mimeType: previewItem?.mimeType,
                file: previewItem ? { url: previewItem?.file?.url } : undefined,
            };
        }, [uploadItems, attachmentId],
    );

    const linkData = useMemo(
        () => {
            if (isNotDefined(link)) return undefined;
            return {
                title: link,
                file: link ? { url: link } : undefined,
            };
        }, [link],
    );

    return (
        <Modal onCloseButtonClick={handleModalClose}>
            <LeadPreview attachment={attachmentData} />
        </Modal>
    );
}
export default Preview;
