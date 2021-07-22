import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useRequest } from '#utils/request';
import {
    QuickActionButton,
    ElementFragments,
} from '@the-deep/deep-ui';
import { AiOutlineRedo } from 'react-icons/ai';
import { IoDocumentOutline, IoLogoDropbox } from 'react-icons/io5';
import { FaGoogleDrive } from 'react-icons/fa';

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

const iconMap = {
    file: <IoDocumentOutline className={styles.icon} />,
    google: <FaGoogleDrive className={styles.icon} />,
    dropbox: <IoLogoDropbox className={styles.icon} />,
};

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
        active,
        data,
        hasFailed = false,
    } = props;

    const [isRetriggerEnabled, setIsTriggeredEnable] = useState(false);

    const params = getRequestParams(data);

    const {
        pending,
        retrigger,
    } = useRequest<FileUploadResponse>({
        url: params?.url,
        skip: !active || (hasFailed && !isRetriggerEnabled),
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

    const handleRetriggerClick = useCallback(() => {
        setIsTriggeredEnable(true);
        retrigger();
    }, [retrigger]);

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
