import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    caseInsensitiveSubmatch,
    isFalsyString,
} from '@togglecorp/fujs';
import {
    TextInput,
    Container,
    ListView,
} from '@the-deep/deep-ui';
import { IoSearch } from 'react-icons/io5';

import _ts from '#ts';

import { FileUploadResponse } from '../types';

import SourceItem from './SourceItem';
import SourceEditForm from './SourceEditForm';
import styles from './styles.css';

const keySelector = (d: FileUploadResponse): number => d.id;

interface Props {
    className?: string;
    onDeleteSource: (id: number) => void;
    sources: FileUploadResponse[] | undefined;
}

function Sources(props: Props) {
    const {
        className,
        onDeleteSource,
        sources,
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const [selectedSourceId, setSelectedSourceId] = useState<number | undefined>();

    const sourceItemRendererParams = useCallback((
        _: number,
        data: FileUploadResponse,
    ) => ({
        data,
        isSelected: data.id === selectedSourceId,
        onSelect: setSelectedSourceId,
        onDelete: onDeleteSource,
    }), [onDeleteSource, setSelectedSourceId, selectedSourceId]);

    const filteredSources = useMemo(
        () => {
            if (isFalsyString(searchText)) {
                return sources;
            }
            return sources?.filter((source) => (
                caseInsensitiveSubmatch(source.title, searchText)
            ));
        },
        [sources, searchText],
    );

    const selectedSource = useMemo(
        () => (
            sources?.find((f) => f.id === selectedSourceId)
        ),
        [sources, selectedSourceId],
    );

    return (
        <div className={_cs(className, styles.sourcesUploadedDetails)}>
            <Container
                className={styles.sourcesContainer}
                heading={_ts('bulkUpload', 'sourcesUploadedTitle')}
                headerDescription={(
                    <TextInput
                        className={styles.search}
                        icons={<IoSearch className={styles.icon} />}
                        name="Search"
                        onChange={setSearchText}
                        value={searchText}
                        placeholder="Search title"
                    />
                )}
                contentClassName={styles.sources}
                horizontallyCompactContent
                sub
            >
                <ListView
                    className={styles.list}
                    data={filteredSources}
                    renderer={SourceItem}
                    keySelector={keySelector}
                    rendererParams={sourceItemRendererParams}
                />
            </Container>
            {selectedSource && (
                <SourceEditForm
                    className={styles.sourceEditForm}
                    file={selectedSource}
                />
            )}
        </div>
    );
}

export default Sources;
