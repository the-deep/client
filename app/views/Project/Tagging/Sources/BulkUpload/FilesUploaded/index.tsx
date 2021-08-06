import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    caseInsensitiveSubmatch,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    TextInput,
    Container,
    ListView,
} from '@the-deep/deep-ui';
import { IoSearch } from 'react-icons/io5';

import _ts from '#ts';

import { FileUploadResponse } from '../types';
import FileItem from './FileItem';
import LeadEdit from './LeadEdit';
import styles from './styles.css';

const keySelector = (d: FileUploadResponse): number => d.id;

interface Props {
    className?: string;
    onDeleteFile: (id: number) => void;
    files: FileUploadResponse[];
}

function FilesUploaded(props: Props) {
    const {
        className,
        onDeleteFile,
        files = [],
    } = props;

    const [selectedFileId, setSelectedFileId] = useState<number | undefined>();
    const [searchText, setSearchText] = useState<string | undefined>();

    const fileRendererParams = useCallback((
        _: number,
        data: FileUploadResponse,
    ) => ({
        data,
        isSelected: data.id === selectedFileId,
        onSelect: setSelectedFileId,
        onDeleteFile,
    }), [onDeleteFile, setSelectedFileId, selectedFileId]);

    const searchedFiles = useMemo(() => {
        if (isTruthyString(searchText)) {
            return files.filter((file) => (
                caseInsensitiveSubmatch(file.title, searchText)
            ));
        }
        return files;
    }, [files, searchText]);

    const selectedFile = useMemo(() => (
        files.find((f) => f.id === selectedFileId)
    ), [files, selectedFileId]);

    return (
        <div className={_cs(className, styles.filesUploadedDetails)}>
            <Container
                className={styles.filesContainer}
                heading={_ts('bulkUpload', 'sourcesUploadedTitle')}
                headerDescription={(
                    <TextInput
                        className={styles.search}
                        icons={<IoSearch className={styles.icon} />}
                        name="Search"
                        onChange={setSearchText}
                        value={searchText}
                        placeholder="Search"
                        autoFocus
                    />
                )}
                contentClassName={styles.files}
                horizontallyCompactContent
                sub
            >
                <ListView
                    className={styles.list}
                    data={searchedFiles}
                    renderer={FileItem}
                    keySelector={keySelector}
                    rendererParams={fileRendererParams}
                />
            </Container>
            {selectedFile && (
                <LeadEdit
                    className={styles.editLead}
                    file={selectedFile}
                />
            )}
        </div>
    );
}

export default FilesUploaded;
