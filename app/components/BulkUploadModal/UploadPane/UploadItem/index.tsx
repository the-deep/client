import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';
import { IoRefresh, IoTrashOutline } from 'react-icons/io5';
import { IoDocumentOutline, IoLogoDropbox } from 'react-icons/io5';
import { FaGoogleDrive } from 'react-icons/fa';
import { useRequest } from '#base/utils/restRequest';

import { RawSource, FileUploadResponse } from '../../types';

import styles from './styles.css';

const iconMap = {
    disk: <IoDocumentOutline className={styles.icon} />,
    'google-drive': <FaGoogleDrive className={styles.icon} />,
    dropbox: <IoLogoDropbox className={styles.icon} />,
};

interface Props {
    className?: string;
    onSuccess: (key: string, v: FileUploadResponse) => void;
    onRetry?: (key: string) => void;
    onClear?: (key: string) => void;
    onFailure?: (key: string) => void;
    active: boolean;
    hasFailed?: boolean;
    data: RawSource;
}

function UploadItem(props: Props) {
    const {
        className,
        onSuccess,
        onFailure,
        onRetry,
        onClear,
        active,
        data,
        hasFailed = false,
    } = props;

    const params = useMemo(
        () => {
            switch (data.fileType) {
                case 'disk':
                    return {
                    url: 'server://files/',
                    body: {
                        file: data.file,
                        title: data.name,
                        isPublic: true,
                    },
                };
                case 'google-drive':
                    return {
                    url: 'server://files-google-drive/',
                    body: {
                        fileId: data.id,
                        title: data.name,
                        mimeType: data.mimeType,
                        accessToken: data.accessToken,
                    },
                };
                case 'dropbox':
                    return {
                    url: 'server://files-dropbox/',
                    body: {
                        title: data.name,
                        fileUrl: data.link,
                    },
                };
                default:
                    return undefined;
            }
        },
        [data],
    );

    const {
        pending,
    } = useRequest<FileUploadResponse>({
        url: params?.url,
        skip: !active,
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

    const handleRetriggerClick = useCallback(
        () => {
            if (onRetry) {
                onRetry(data.key);
            }
        },
        [onRetry, data],
    );

    const handleClearClick = useCallback(
        () => {
            if (onClear) {
                onClear(data.key);
            }
        },
        [onClear, data],
    );

    return (
        <div className={_cs(className, styles.uploadItem)}>
            <ElementFragments
                icons={iconMap[data.fileType]}
                iconsContainerClassName={styles.icons}
                actions={hasFailed && (
                    <>
                        <QuickActionButton
                            name={undefined}
                            onClick={handleRetriggerClick}
                            disabled={pending}
                        >
                            <IoRefresh />
                        </QuickActionButton>
                        <QuickActionButton
                            name={undefined}
                            onClick={handleClearClick}
                            disabled={pending}
                        >
                            <IoTrashOutline />
                        </QuickActionButton>
                    </>
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
