import React, { useCallback } from 'react';
import { FileInput, useAlert } from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import { gql, useMutation } from '@apollo/client';

import { AdditionalDocumentType, AssessmentRegistryDocumentTypeEnum, CreateAttachmentMutation, CreateAttachmentMutationVariables, FileUploadInputType } from '#generated/types';

import styles from './styles.css';

const CREATE_ATTACHMENT = gql`
    mutation CreateAttachment($data: FileUploadInputType!) {
        fileUpload(data: $data) {
            ok
            errors
            result {
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
        v: AdditionalDocumentType,
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
                console.log('rsponse upload', response);
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
                    console.log('upload success');
                    // onSuccess(response, name);
                }
            },
        },
    );

    const handleFileInputChange = useCallback(
        (value: File | null | undefined) => {
            if (!value) {
                return;
            }
            const formData = new FormData();
            formData.append('file', value);
            uploadAttachment({
                variables: {
                    data: {
                        title: value.name,
                        file: formData,
                    } as FileUploadInputType,
                },
                context: {
                    formData: true,
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
