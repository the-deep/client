import React, { useCallback } from 'react';
import { FileInput, useAlert } from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import { gql, useMutation } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';

import {
    CreateAttachmentMutation,
    CreateAttachmentMutationVariables,
    FileUploadInputType,
    GalleryFileType,
} from '#generated/types';

import styles from './styles.css';

const CREATE_ATTACHMENT = gql`
    mutation CreateAttachment($data: FileUploadInputType!) {
        fileUpload(data: $data) {
            ok
            errors result {
                id
                title
                mimeType
                metadata
                file {
                    url
                    name
                }
            }
        }
    }
`;
interface Props {
    onSuccess: (file: GalleryFileType) => void;
    acceptFileType?: '.pdf' | 'image/*';
}

function AryFileUpload(props: Props) {
    const {
        onSuccess,
        acceptFileType,
    } = props;
    const alert = useAlert();

    const [
        uploadAttachment,
        {
            loading,
        },
    ] = useMutation<CreateAttachmentMutation, CreateAttachmentMutationVariables>(
        CREATE_ATTACHMENT,
        {
            onCompleted: (response) => {
                if (!response || !response.fileUpload) {
                    return;
                }

                const {
                    ok,
                    result,
                    errors,
                } = response.fileUpload;

                if (errors) {
                    alert.show(
                        'Failed to upload file.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    const resultRemoveNull = removeNull(result);
                    onSuccess(
                        resultRemoveNull,
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to upload file.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleFileInputChange = useCallback(
        (value: File | null | undefined) => {
            if (!value) {
                return;
            }

            uploadAttachment({
                variables: {
                    data: {
                        title: value.name,
                        file: value,
                    } as FileUploadInputType,
                },
                context: {
                    hasUpload: true,
                },
            });
        }, [uploadAttachment],
    );

    return (
        <FileInput
            className={styles.fileInput}
            name={undefined}
            value={null}
            onChange={handleFileInputChange}
            inputSectionClassName={styles.inputSection}
            status={undefined}
            overrideStatus
            maxFileSize={100}
            accept={acceptFileType}
            disabled={loading}
        >
            <IoCloudUpload />
        </FileInput>
    );
}

export default AryFileUpload;
