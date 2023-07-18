import React, { useCallback } from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    FileInput,
} from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import { AssessmentRegistryDocumentTypeEnum } from '#generated/types';

import { FileLike } from '../../types';
import styles from './styles.css';

interface Props {
    onAdd: (v: FileLike[]) => void;
    name: AssessmentRegistryDocumentTypeEnum;
    acceptFileType?: string;
}

function AryFileUpload(props: Props) {
    const {
        onAdd,
        name,
        acceptFileType,
    } = props;

    const handleFileInputChange = useCallback(
        (values: File[] | null | undefined, e: AssessmentRegistryDocumentTypeEnum) => {
            const basicFiles = values
                ? values.map((file) => ({
                    key: randomString(),
                    id: file.name,
                    name: file.name,
                    fileType: 'disk' as const,
                    documentType: e,
                    file,
                }))
                : [];
            onAdd(basicFiles);
        }, [onAdd],
    );

    return (
        <FileInput
            className={styles.fileInput}
            inputSectionClassName={styles.inputSection}
            inputContainerClassName={styles.inputContainer}
            name={name}
            value={null}
            onChange={handleFileInputChange}
            status={undefined}
            overrideStatus
            maxFileSize={100}
            multiple
            accept={acceptFileType}
        >
            <IoCloudUpload />
        </FileInput>
    );
}

export default AryFileUpload;
