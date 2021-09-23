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

import { PartialLeadType } from '../schema';
import FileItem from './FileItem';
import LeadEdit from './LeadEdit';
import styles from './styles.css';

const keySelector = (d: PartialLeadType): string => d.clientId;

interface Props {
    className?: string;
    onDeleteFile: (id: string) => void;
    leads: PartialLeadType[] | undefined;
    selectedLead: string | undefined;
    onSelectedLeadChange: (newLead: string) => void;
}

function FilesUploaded(props: Props) {
    const {
        className,
        onDeleteFile,
        leads,
        selectedLead,
        onSelectedLeadChange,
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();

    const fileRendererParams = useCallback((
        _: string,
        data: PartialLeadType,
    ) => ({
        data,
        isSelected: data.clientId === selectedLead,
        onSelect: onSelectedLeadChange,
        onDeleteFile,
    }), [onDeleteFile, onSelectedLeadChange, selectedLead]);

    const searchedFiles = useMemo(() => {
        if (isTruthyString(searchText)) {
            return leads?.filter((file) => (
                caseInsensitiveSubmatch(file.title, searchText)
            ));
        }
        return leads;
    }, [leads, searchText]);

    const selectedFile = useMemo(() => (
        leads?.find((f) => f.id === selectedLead)
    ), [leads, selectedLead]);

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
                />
            )}
        </div>
    );
}

export default FilesUploaded;
