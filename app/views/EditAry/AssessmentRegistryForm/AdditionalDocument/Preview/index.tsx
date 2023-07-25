import React, { useCallback, useMemo } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import { Modal } from '@the-deep/deep-ui';

import LeadPreview from '#components/lead/LeadPreview';
import { useRequest } from '#base/utils/restRequest';

import { FileUploadResponse } from '../types';

interface Props {
    attachmentId?: string;
    onChangeSelectedAttachment: React.Dispatch<React.SetStateAction<string | undefined>>;
    link?: string;
}

function Preview(props: Props) {
    const {
        attachmentId,
        onChangeSelectedAttachment,
        link,
    } = props;

    const handleModalClose = useCallback(() => {
        onChangeSelectedAttachment(undefined);
    }, [onChangeSelectedAttachment]);

    const {
        response,
    } = useRequest<FileUploadResponse>({
        skip: isNotDefined(attachmentId) || isDefined(link),
        url: `server://files/${attachmentId}`,
    });

    const attachmentData = useMemo(
        () => ({
            id: response?.id,
            title: response?.title,
            mimeType: response?.mimeType,
            file: response?.file ? { url: response?.file } : undefined,
        }), [response],
    );

    const linkData = useMemo(
        () => {
            if (isNotDefined(link)) return null;
            const linkValue = {
                title: link,
                file: link ? { url: link } : undefined,
            };
            return linkValue;
        }, [link],
    );

    return (
        <Modal onCloseButtonClick={handleModalClose}>
            <LeadPreview attachment={linkData ?? attachmentData} />
        </Modal>
    );
}
export default Preview;
