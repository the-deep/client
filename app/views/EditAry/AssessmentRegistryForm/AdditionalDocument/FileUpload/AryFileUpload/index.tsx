import React, { useCallback } from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    FileInput,
} from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import { AssessmentRegistryDocumentTypeEnum } from '#generated/types';
import { PartialAdditonalDocument } from '#views/EditAry/AssessmentRegistryForm/formSchema';
import { useLazyRequest } from '#base/utils/restRequest';

import { FileUploadResponse } from '../../types';
import styles from './styles.css';

interface Props {
    onSuccess: (v: PartialAdditonalDocument) => void;
    name?: AssessmentRegistryDocumentTypeEnum;
    acceptFileType?: string;
}

interface UploadType {
    title: string;
    file: File;
    isPublic: boolean;
}

function AryFileUpload(props: Props) {
    const {
        onSuccess,
        name,
        acceptFileType,
    } = props;

    const {
        pending,
        trigger,
    } = useLazyRequest<FileUploadResponse, UploadType | undefined | null>({
        url: 'server://files/',
        method: 'POST',
        formData: true,
        body: (ctx) => ctx,
        onSuccess: (response) => {
            const fileResponse = {
                clientId: randomString(),
                file: response.id,
                documentType: name,
            };
            onSuccess(fileResponse);
        },
        onFailure: (err) => {
            console.log(err);
        },
        failureMessage: 'Upload failed.',
    });

    const handleFileInputChange = useCallback(
        (value: File | null | undefined) => {
            const basicFile = value ? {
                title: value.name,
                file: value,
                isPublic: true,
            } : undefined;

            trigger(basicFile);
        }, [trigger],
    );

    return (
        <FileInput
            className={styles.fileInput}
            name={name}
            value={null}
            onChange={handleFileInputChange}
            status={undefined}
            overrideStatus
            maxFileSize={100}
            accept={acceptFileType}
            disabled={pending}
        >
            <IoCloudUpload />
        </FileInput>
    );
}

export default AryFileUpload;
