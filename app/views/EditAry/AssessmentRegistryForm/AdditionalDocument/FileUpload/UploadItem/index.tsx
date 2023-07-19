import React, { useCallback, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ElementFragments,
    QuickActionButton,
    Spinner,
} from '@the-deep/deep-ui';
import { AiOutlineRedo } from 'react-icons/ai';
import {
    IoDocumentOutline,
    IoEyeOutline,
    IoLogoDropbox,
    IoTrashOutline,
} from 'react-icons/io5';

import { useLazyRequest } from '#base/utils/restRequest';
import { AssessmentRegistryDocumentTypeEnum } from '#generated/types';

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
    documentType: AssessmentRegistryDocumentTypeEnum;
    onRemoveFile?: (key: string) => void;
    onChangeSelectedDocument?: (key: string) => void;
}

const iconMap = {
    disk: <IoDocumentOutline className={styles.icon} />,
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
        documentType,
        onRemoveFile,
        onChangeSelectedDocument,
    } = props;

    const params = getRequestParams(data);
    const {
        pending,
        trigger,
    } = useLazyRequest<FileUploadResponse, FileLike>({
        url: params?.url,
        method: 'POST',
        formData: data.fileType === 'disk',
        body: params?.body,
        onSuccess: (response) => {
            onSuccess(data.key, {
                ...response,
                sourceType: data.fileType,
                documentType,
            });
        },
        onFailure: () => {
            if (onFailure) {
                onFailure(data.key);
            }
        },
        failureMessage: 'Upload failed.',
    });

    useEffect(() => {
        if (active) {
            trigger(data);
        }
    }, [trigger, active, data]);

    const handleRetriggerClick = useCallback(() => {
        if (onRetry) {
            onRetry(data.key);
        }
    }, [onRetry, data]);

    return (
        <div className={_cs(className, styles.uploadItem)}>
            <ElementFragments
                icons={pending ? <Spinner /> : iconMap[data.fileType]}
                iconsContainerClassName={styles.icons}
                actions={(
                    <>
                        {hasFailed && (
                            <QuickActionButton
                                name="retrigger"
                                onClick={handleRetriggerClick}
                                disabled={pending}
                                title="Retry failed upload"
                            >
                                <AiOutlineRedo />
                            </QuickActionButton>
                        )}
                        {!hasFailed && (
                            <QuickActionButton
                                name={data.key}
                                onClick={onRemoveFile}
                                disabled={pending}
                                title="delete"
                            >
                                <IoTrashOutline />
                            </QuickActionButton>
                        )}
                    </>
                )}
                actionsContainerClassName={styles.actions}
                childrenContainerClassName={styles.content}
            >
                {data.name}
                <QuickActionButton
                    name={data.key}
                    onClick={onChangeSelectedDocument}
                    disabled={pending}
                    title="preview"
                >
                    <IoEyeOutline />
                </QuickActionButton>

            </ElementFragments>
        </div>
    );
}

export default UploadItem;
