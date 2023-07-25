import React, { useCallback } from 'react';
import { FileInput } from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';

import { AdditionalDocumentType, AssessmentRegistryDocumentTypeEnum } from '#generated/types';
import { useLazyRequest } from '#base/utils/restRequest';

import styles from './styles.css';

interface Props {
    onSuccess: (
        v: AdditionalDocumentType,
        documentType: AssessmentRegistryDocumentTypeEnum,
    ) => void;
    name: AssessmentRegistryDocumentTypeEnum;
    acceptFileType?: string;
}

interface UploadType {
    title: string;
    file: File;
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
    } = useLazyRequest<AdditionalDocumentType, UploadType | undefined | null>({
        url: 'server://files/',
        method: 'POST',
        formData: true,
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onSuccess(response, name);
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
