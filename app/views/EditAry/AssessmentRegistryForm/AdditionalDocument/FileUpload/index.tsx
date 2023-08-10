import React, { useState, useCallback } from 'react';
import {
    Button,
    Header,
    ListView,
    TextInput,
} from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';
import { isValidUrl, randomString } from '@togglecorp/fujs';

import { AssessmentRegistryDocumentTypeEnum, GalleryFileType } from '#generated/types';

import { PartialAdditionalDocument } from '../../formSchema';
import AryFileUpload from './AryFileUpload';
import UploadItem from './UploadItem';

import styles from './styles.css';

const fileKeySelector = (d: PartialAdditionalDocument): string => d.clientId;

interface Props {
    name: AssessmentRegistryDocumentTypeEnum;
    title: string;
    acceptFileType?: '.pdf' | 'image/*';
    onSuccess: (
        v: PartialAdditionalDocument,
        uploadedFile?: GalleryFileType,
    ) => void;
    handleFileRemove: (key: string) => void;
    supportLinkAddition?: boolean;
    value?: PartialAdditionalDocument[];
    uploadedList?: GalleryFileType[];
}

function FileUpload(props: Props) {
    const {
        onSuccess,
        name,
        acceptFileType,
        title,
        handleFileRemove,
        supportLinkAddition,
        value,
        uploadedList,
    } = props;

    const [externalLink, setExternalLink] = useState<string>();
    const [urlError, setURLError] = useState<string>();

    const fileRendererParams = useCallback(
        (_: string, data: PartialAdditionalDocument) => ({
            data,
            onRemoveFile: handleFileRemove,
            uploadedList,
        }), [handleFileRemove, uploadedList],
    );

    const handleExternalLinkAdd = useCallback(() => {
        const isUrl = isValidUrl(externalLink ?? '');
        if (!isUrl) {
            setURLError('Invalid URL');
            return;
        }

        onSuccess({
            clientId: randomString(),
            file: undefined,
            documentType: name,
            externalLink,
        });
        setExternalLink(undefined);
    }, [
        name,
        externalLink,
        setExternalLink,
        onSuccess,
    ]);

    const handleUploadAttachment = useCallback(
        (file: GalleryFileType) => {
            onSuccess({
                clientId: randomString(),
                file: file.id,
                documentType: name,
                externalLink: '',
            }, file);
        }, [onSuccess, name],
    );

    return (
        <div className={styles.uploadPane}>
            <Header
                heading={title}
                headingSize="extraSmall"
                actions={(
                    <>
                        {supportLinkAddition && (
                            <div className={styles.linkInput}>
                                <TextInput
                                    placeholder="External Link"
                                    name="externalLink"
                                    value={externalLink}
                                    onChange={setExternalLink}
                                    error={urlError}
                                />
                                <Button
                                    variant="transparent"
                                    name={name}
                                    onClick={handleExternalLinkAdd}
                                >
                                    <IoAddCircleOutline />
                                </Button>
                            </div>
                        )}
                        <AryFileUpload
                            acceptFileType={acceptFileType}
                            onSuccess={handleUploadAttachment}
                        />
                    </>
                )}
                inlineHeadingDescription
            />
            <ListView
                className={styles.files}
                data={value}
                rendererClassName={styles.fileItem}
                renderer={UploadItem}
                keySelector={fileKeySelector}
                rendererParams={fileRendererParams}
                emptyMessage="You haven't uploaded anything yet."
                filtered={false}
                pending={false}
                errored={false}
                messageShown
                messageIconShown
            />
        </div>
    );
}

export default FileUpload;
