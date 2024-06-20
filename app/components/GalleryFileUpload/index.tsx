import React, { useState, useCallback, useMemo } from 'react';
import { FileInput, useAlert } from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import { gql, useMutation } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';

import {
    FileUploadMutation,
    FileUploadMutationVariables,
    GalleryFileType,
} from '#generated/types';

import styles from './styles.css';

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
    onSuccess: (file: NonNullable<GalleryFileType>, uploadedFile: File | undefined) => void;
    acceptFileType?: '.pdf' | 'image/*' | '.xlsx' | '.csv' | '.geojson';
    title?: string;
    disabled?: boolean;
    projectIds?: string[];
    buttonOnly?: boolean;
    option?: GalleryFileType;
    setOption?: (value: GalleryFileType) => void;
    status?: boolean;
}

function FileUpload(props: Props) {
    const {
        onSuccess,
        title,
        acceptFileType,
        disabled,
        projectIds,
        buttonOnly,
        // value: valueFromProps,
        option,
        setOption,
        status = false,
    } = props;

    const alert = useAlert();
    const [uploadedFile, setUploadedFile] = useState<File>();

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
                        uploadedFile,
                    );
                    if (isDefined(setOption)) {
                        setOption(result);
                    }
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
            setUploadedFile(value);

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

    const currentStatus = useMemo(() => {
        if (isNotDefined(status)) {
            return '';
        }
        if (loading) {
            return 'Uploading file';
        }

        if (isDefined(option)) {
            return option.title;
        }

        return 'No file selected';
    }, [status, loading, option]);

    return (
        <FileInput
            className={_cs(
                styles.galleryFileUpload,
                buttonOnly && styles.buttonOnly,
            )}
            name={undefined}
            value={undefined}
            onChange={handleFileInputChange}
            status={status ? currentStatus : ''}
            overrideStatus
            title={buttonOnly ? undefined : title}
            label={buttonOnly ? undefined : title}
            maxFileSize={100}
            accept={acceptFileType}
            disabled={loading || disabled}
        >
            <div className={styles.children}>
                <IoCloudUpload />
                {buttonOnly ? title : undefined}
            </div>
        </FileInput>
    );
}

export default FileUpload;
