import React, { useCallback } from 'react';
import { FileInput, useAlert } from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import { gql, useMutation } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';

import {
    FileUploadMutation,
    FileUploadMutationVariables,
    GalleryFileType,
} from '#generated/types';

const UPLOAD_FILE = gql`
    mutation FileUpload(
        $data: FileUploadInputType!,
    ) {
        fileUpload(data: $data) {
            errors
            ok
            result {
                file {
                    name
                    url
                }
                id
                metadata
                mimeType
                title
            }
        }
    }
`;
interface Props {
    onSuccess: (file: NonNullable<GalleryFileType>) => void;
    acceptFileType?: '.pdf' | 'image/*';
    disabled?: boolean;
    projectIds?: string[];
}

function FileUpload(props: Props) {
    const {
        onSuccess,
        acceptFileType,
        disabled,
        projectIds,
    } = props;
    const alert = useAlert();

    const [
        uploadFile,
        {
            loading,
        },
    ] = useMutation<FileUploadMutation, FileUploadMutationVariables>(
        UPLOAD_FILE,
        {
            onCompleted: (response) => {
                if (!response || !response.fileUpload?.result) {
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

            uploadFile({
                variables: {
                    data: {
                        file: value,
                        projects: projectIds,
                        isPublic: false,
                        title: value.name,
                    },
                },
                context: {
                    hasUpload: true,
                },
            });
        }, [
            projectIds,
            uploadFile,
        ],
    );

    return (
        <FileInput
            name={undefined}
            value={null}
            onChange={handleFileInputChange}
            status={undefined}
            overrideStatus
            maxFileSize={100}
            accept={acceptFileType}
            disabled={loading || disabled}
        >
            <IoCloudUpload />
        </FileInput>
    );
}

export default FileUpload;
