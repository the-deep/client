import React, { useCallback } from 'react';
import { FileInput, useAlert } from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import { gql, useMutation } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';

import {
    AssessmentRegistryDocumentTypeEnum,
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
    onSuccess: (
        v: GalleryFileType,
        documentType: AssessmentRegistryDocumentTypeEnum,
    ) => void;
    name: AssessmentRegistryDocumentTypeEnum;
    acceptFileType?: string;
}

function AryFileUpload(props: Props) {
    const {
        onSuccess,
        name,
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
                        name,
                    );
                }
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
        <form encType="multipart/form-data">
            <FileInput
                className={styles.fileInput}
                name={name}
                value={null}
                onChange={handleFileInputChange}
                status={undefined}
                overrideStatus
                maxFileSize={100}
                accept={acceptFileType}
                disabled={loading}
            >
                <IoCloudUpload />
            </FileInput>
        </form>
    );
}

export default AryFileUpload;
