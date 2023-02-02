import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import {
    Tag,
    List,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    IoCloseOutline,
} from 'react-icons/io5';

import {
    PredictionTag,
    CategoricalMappingsItem,
} from '#types/newAnalyticalFramework';

import AddButton from './AddButton';

import styles from './styles.css';

const mappingKeySelector = (mapping: CategoricalMappingsItem) => mapping.tag;

interface Props<N extends CategoricalMappingsItem> {
    className?: string;
    title: string;
    itemKey: string;
    onMappingRemoveClick: (cellKey: string, tagKey: string) => void;
    onMappingAddClick: (cellKey: string, tagKey: string) => void;
    associationKeySelector: (item: N) => string;
    mappings: N[] | undefined;
    predictionTags: PredictionTag[] | undefined;
    disabled?: boolean;
}

function FrameworkTagRow<N extends CategoricalMappingsItem>(props: Props<N>) {
    const {
        className,
        title,
        itemKey,
        mappings,
        predictionTags,
        onMappingRemoveClick,
        onMappingAddClick,
        disabled,
        associationKeySelector,
    } = props;

    const predictionTagsById = useMemo(() => (
        listToMap(
            predictionTags,
            (tag) => tag.id,
            (tag) => tag,
        )
    ), [predictionTags]);

    const handleTagRemove = useCallback((tagKey: string) => {
        onMappingRemoveClick(itemKey, tagKey);
    }, [
        itemKey,
        onMappingRemoveClick,
    ]);

    const tagRendererParams = useCallback((tagKey: string) => ({
        className: styles.tag,
        children: predictionTagsById?.[tagKey]?.name,
        actions: (
            <QuickActionButton
                className={styles.removeButton}
                name={tagKey}
                onClick={handleTagRemove}
                variant="transparent"
            >
                <IoCloseOutline />
            </QuickActionButton>
        ),
        variant: 'accent' as const,
    }), [
        predictionTagsById,
        handleTagRemove,
    ]);

    const filteredMappings = useMemo(() => (
        mappings?.filter((mapping) => associationKeySelector(mapping) === itemKey)
    ), [
        mappings,
        itemKey,
        associationKeySelector,
    ]);

    const handleTagSelect = useCallback((newTag: string | undefined) => {
        if (newTag) {
            onMappingAddClick(itemKey, newTag);
        }
    }, [
        onMappingAddClick,
        itemKey,
    ]);

    return (
        <div className={_cs(styles.frameworkTagRow, className)}>
            <div className={styles.leftContainer}>
                <Tag>
                    {title}
                </Tag>
            </div>
            <div className={styles.rightContainer}>
                <List
                    data={filteredMappings}
                    renderer={Tag}
                    rendererParams={tagRendererParams}
                    keySelector={mappingKeySelector}
                />
                <AddButton
                    onTagSelect={handleTagSelect}
                    predictionTags={predictionTags}
                    existingMappings={filteredMappings}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default FrameworkTagRow;
