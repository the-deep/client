import React, { useCallback, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';
import { AiOutlineRedo } from 'react-icons/ai';
import { IoDocumentOutline, IoLogoDropbox } from 'react-icons/io5';
import { FaGoogleDrive } from 'react-icons/fa';
import { useLazyRequest } from '#base/utils/restRequest';

import { FileLike, FileUploadResponse } from '../../types';

import styles from './styles.css';

interface Props {
    className?: string;
    onSuccess: (key: string, v: FileUploadResponse) => void;
    onRetry?: (key: string) => void;
    onFailure?: (key: string) => void;
    active: boolean;
    hasFailed?: boolean;
    data: FileLike;
}

const iconMap = {
    disk: <IoDocumentOutline className={styles.icon} />,
    'google-drive': <FaGoogleDrive className={styles.icon} />,
    dropbox: <IoLogoDropbox className={styles.icon} />,
};

const getRequestParams = (data: FileLike) => {
    if (data.fileType === 'disk') {
        return {
            url: 'server://files/',
            body: {
                file: data.file,
                title: data.name,
                isPublic: true,
            },
        };
    }
    if (data.fileType === 'google-drive') {
        return {
            url: 'server://files-google-drive/',
            body: {
                fileId: data.id,
                title: data.name,
                mimeType: data.mimeType,
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
        onRetry,
        active,
        data,
        hasFailed = false,
    } = props;

    const params = getRequestParams(data);

    const {
        pending,
        trigger,
    } = useLazyRequest<FileUploadResponse, unknown>({
        url: params?.url,
        method: 'POST',
        formData: data.fileType === 'disk',
        body: params?.body,
        onSuccess: (response) => {
            onSuccess(data.key, { ...response, sourceType: data.fileType });
        },
        onFailure: () => {
            if (onFailure) {
                onFailure(data.key);
            }
        },
    });

    useEffect(() => {
        if (active) {
            trigger(null);
        }
    }, [trigger, active]);

    const handleRetriggerClick = useCallback(() => {
        if (onRetry) {
            onRetry(data.key);
        }
    }, [onRetry, data]);

    return (
        <div className={_cs(className, styles.uploadItem)}>
            <ElementFragments
                icons={iconMap[data.fileType]}
                iconsContainerClassName={styles.icons}
                actions={hasFailed && (
                    <QuickActionButton
                        name="retrigger"
                        onClick={handleRetriggerClick}
                        disabled={pending}
                    >
                        <AiOutlineRedo />
                    </QuickActionButton>
                )}
                actionsContainerClassName={styles.actions}
                childrenContainerClassName={styles.content}
            >
                {data.name}
            </ElementFragments>
        </div>
    );
}

export default UploadItem;
