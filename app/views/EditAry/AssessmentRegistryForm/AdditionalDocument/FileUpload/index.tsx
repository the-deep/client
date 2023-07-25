import React, { useState, useCallback } from 'react';
import { Button, List, TextInput } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';
import { randomString } from '@togglecorp/fujs';

import { AdditionalDocumentType, AssessmentRegistryDocumentTypeEnum } from '#generated/types';

import AryFileUpload from './AryFileUpload';
import UploadItem from './UploadItem';
import styles from './styles.css';
import { PartialAdditonalDocument } from '../../formSchema';
import LinkUploadItem from './LinkUploadItem';

const fileKeySelector = (d: string): string => d;
const linkKeySelector = (d: PartialAdditonalDocument): string => d.clientId as string;

interface Props {
    name: AssessmentRegistryDocumentTypeEnum;
    title: string;
    acceptFileType?: string;
    onSuccess: (
        v: AdditionalDocumentType,
        documentType: AssessmentRegistryDocumentTypeEnum,
    ) => void;
    handleFileRemove: (key: string) => void;
    onChangeSelectedDocument: (key: string) => void;
    showLink?: boolean;
    files?: string[];
    links?: PartialAdditonalDocument[];
}

function FileUpload(props: Props) {
    const {
        onSuccess,
        name,
        acceptFileType,
        title,
        handleFileRemove,
        onChangeSelectedDocument,
        showLink,
        files,
        links,
    } = props;

    const [externalLink, setExternalLink] = useState<string>();

    const handleExternalLinkAdd = useCallback(() => {
        const obj = {
            clientId: randomString(),
            documentType: name as AssessmentRegistryDocumentTypeEnum,
            file: undefined,
            externalLink,
        } as AdditionalDocumentType;
        onSuccess(obj, name);
        setExternalLink(undefined);
    }, [
        name,
        externalLink,
        setExternalLink,
        onSuccess,
    ]);

    const fileRendererParams = useCallback(
        (_: string, data: string) => ({
            data,
            onRemoveFile: handleFileRemove,
            onChangeSelectedDocument,
        }), [handleFileRemove, onChangeSelectedDocument],
    );
    const linkRendererParams = useCallback(
        (_: string, data: PartialAdditonalDocument) => ({
            data,
            onRemoveFile: handleFileRemove,
            onChangeSelectedDocument,
        }), [handleFileRemove, onChangeSelectedDocument],
    );

    return (
        <div className={styles.uploadPane}>
            <div className={styles.uploadHeader}>
                <div className={styles.linkContent}>
                    {title}
                    {showLink && (
                        <div className={styles.linkInput}>
                            <TextInput
                                placeholder="External Link"
                                name="externalLink"
                                value={externalLink}
                                onChange={setExternalLink}
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
                </div>
                <AryFileUpload
                    acceptFileType={acceptFileType}
                    name={name}
                    onSuccess={onSuccess}
                />
            </div>
            <div className={styles.files}>
                {(files?.length === 0) && (
                    <div className={styles.emptyMessage}>Upload files here</div>
                )}
                <List
                    data={files}
                    rendererClassName={styles.fileItem}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={fileRendererParams}
                />
                <List
                    data={links}
                    rendererClassName={styles.fileItem}
                    renderer={LinkUploadItem}
                    keySelector={linkKeySelector}
                    rendererParams={linkRendererParams}
                />
            </div>
        </div>
    );
}

export default FileUpload;
