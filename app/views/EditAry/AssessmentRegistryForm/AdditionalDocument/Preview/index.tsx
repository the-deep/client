import React, { useCallback, useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { Modal } from '@the-deep/deep-ui';

import LeadPreview from '#components/lead/LeadPreview';
import { useRequest } from '#base/utils/restRequest';

import { FileUploadResponse } from '../types';

interface Props {
    attachmentId?: string;
    onChangeSelectedAttachment: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function Preview(props: Props) {
    const {
        attachmentId,
        onChangeSelectedAttachment,
    } = props;

    const handleModalClose = useCallback(() => {
        onChangeSelectedAttachment(undefined);
    }, [onChangeSelectedAttachment]);

    const {
        response,
    } = useRequest<FileUploadResponse>({
        skip: isNotDefined(attachmentId),
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
    return (
        <Modal onCloseButtonClick={handleModalClose}>
            <LeadPreview attachment={attachmentData} />
        </Modal>
    );
}
export default Preview;
