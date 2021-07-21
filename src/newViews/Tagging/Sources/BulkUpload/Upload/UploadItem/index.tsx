import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { useRequest } from '#utils/request';
import { QuickActionButton } from '@the-deep/deep-ui';
import { AiOutlineRedo } from 'react-icons/ai';

import { FileLike, FileUploadResponse } from '../../types';

import styles from './styles.scss';

interface Props {
    className?: string;
    onSuccess: (key: string, v: FileUploadResponse) => void;
    onFailure?: (key: string) => void;
    active: boolean;
    hasFailed?: boolean;
    data: FileLike;
}

const getRequestParams = (data: FileLike) => {
    if (data.fileType === 'file') {
        return {
            url: 'server://files/',
            body: {
                file: data.file,
                title: data.name,
                isPublic: true,
            },
        };
    }
    if (data.fileType === 'google') {
        return {
            url: 'server://files-google-drive/',
            body: {
                fileId: data.id,
                title: data.name,
                mimetype: data.mimeType,
                accessToken: data.accessToken,
            },
        };
    }
    if (data.fileType === 'dropbox') {
        return {
            url: 'server://files-dropbox/',
            body: {
                title: data.name,
                fileUrl: data.link,
            },
        };
    }
    return null;
};

function UploadItem(props: Props) {
    const {
        className,
        onSuccess,
        onFailure,
        active,
        data,
        hasFailed = false,
    } = props;

    const params = getRequestParams(data);

    const {
        pending,
        retrigger,
    } = useRequest<FileUploadResponse>({
        url: params?.url,
        skip: !active,
        method: 'POST',
        formData: data.fileType === 'file',
        body: params?.body,
        onSuccess: (response) => {
            onSuccess(data.key, response);
        },
        onFailure: () => {
            if (onFailure) {
                onFailure(data.key);
            }
        },
    });

    return (
        <div className={_cs(className, styles.uploadItem)}>
            {hasFailed && (
                <QuickActionButton
                    className={styles.button}
                    name="retrigger"
                    onClick={retrigger}
                    disabled={pending}
                >
                    <AiOutlineRedo />
                </QuickActionButton>
            )}
            <div className={styles.item}>{data.name}</div>
        </div>
    );
}

export default UploadItem;
