import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    unique,
    listToMap,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    List,
    ListView,
    Tag,
    QuickActionButton,
    useBooleanState,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    IoCloseOutline,
    IoAdd,
} from 'react-icons/io5';

import {
    Matrix1dWidget,
    Matrix1dMappingsItem,
    PredictionTag,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import CellGroup from '../../CellGroup';
import FrameworkTagRow from '../../FrameworkTagRow';

import styles from './styles.css';

const mappingKeySelector = (mapping: Matrix1dMappingsItem) => mapping.tag;
const predictionKeySelector = (prediction: PredictionTag) => prediction.id;
const predictionLabelSelector = (prediction: PredictionTag) => prediction.name;
const predictionGroupKeySelector = (prediction: PredictionTag) => prediction.group ?? 'Misc';

interface TagRowProps {
    title: string;
    cellKey: string;
    onMappingRemoveClick: (cellKey: string, tagKey: string) => void;
    onMappingAddClick: (cellKey: string, tagKey: string) => void;
    mappings: Matrix1dMappingsItem[] | undefined;
    predictionTagsById: Record<string, PredictionTag> | undefined;
    disabled?: boolean;
}

function TagRow(props: TagRowProps) {
    const {
        title,
        cellKey,
        mappings,
        predictionTagsById,
        onMappingRemoveClick,
        onMappingAddClick,
        disabled,
    } = props;

    const [addInputShown, showAddInput, hideAddInput] = useBooleanState(false);
    const handleTagRemove = useCallback((tagKey: string) => {
        onMappingRemoveClick(cellKey, tagKey);
    }, [
        cellKey,
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
        mappings?.filter((mapping) => mapping.association.subRowKey === cellKey)
    ), [mappings, cellKey]);

    const handleTagSelect = useCallback((newTag: string | undefined) => {
        hideAddInput();
        if (newTag) {
            onMappingAddClick(cellKey, newTag);
        }
    }, [
        hideAddInput,
        onMappingAddClick,
        cellKey,
    ]);

    const existingMappings = useMemo(() => (
        listToMap(
            filteredMappings,
            (d) => d.tag,
            () => true,
        )
    ), [filteredMappings]);

    const filteredOptions = useMemo(() => (
        Object.values(predictionTagsById ?? {}).filter(
            (tag) => !existingMappings?.[tag.id],
        )
    ), [
        predictionTagsById,
        existingMappings,
    ]);

    return (
        <FrameworkTagRow
            title={title}
            rightContent={(
                <>
                    <List
                        data={filteredMappings}
                        renderer={Tag}
                        rendererParams={tagRendererParams}
                        keySelector={mappingKeySelector}
                    />
                    {addInputShown && (
                        <>
                            <SelectInput
                                value={undefined}
                                variant="general"
                                name={undefined}
                                options={filteredOptions}
                                onChange={handleTagSelect}
                                keySelector={predictionKeySelector}
                                labelSelector={predictionLabelSelector}
                                groupKeySelector={predictionGroupKeySelector}
                                groupLabelSelector={predictionGroupKeySelector}
                                grouped
                            />
                            <QuickActionButton
                                name={undefined}
                                onClick={hideAddInput}
                            >
                                <IoCloseOutline />
                            </QuickActionButton>
                        </>
                    )}
                    {!disabled && !addInputShown && (
                        <QuickActionButton
                            name={undefined}
                            onClick={showAddInput}
                        >
                            <IoAdd />
                        </QuickActionButton>
                    )}
                </>
            )}
        />
    );
}

interface CellItem {
    subRowKey: string;
    subRowLabel: string;
    rowOrder: number;
    subRowOrder: number;
    rowKey: string;
    rowLabel: string;
}

const cellKeySelector = (cell: CellItem) => cell.subRowKey;
const groupKeySelector = (n: CellItem) => n.rowKey;

interface Props {
    className?: string;
    widget: Matrix1dWidget;
    mappings: Matrix1dMappingsItem[] | undefined;
    onMappingsChange: (newMappings: Matrix1dMappingsItem[], widgetPk: string) => void;
    disabled?: boolean;
    predictionTagsById: Record<string, PredictionTag> | undefined;
}

function Matrix1dTagInput(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        disabled,
        predictionTagsById,
    } = props;

    const sortedCells = useMemo(() => (
        sortByOrder(widget?.properties?.rows)
            ?.map((row) => (
                row.cells.map((cell) => ({
                    rowKey: row.key,
                    rowOrder: row.order,
                    rowLabel: row.label,
                    subRowKey: cell.key,
                    subRowOrder: cell.order,
                    subRowLabel: cell.label,
                }))
            ))
            .flat()
    ), [widget?.properties?.rows]);

    const groupLabelMap = useMemo(() => (
        listToMap(
            unique(sortedCells ?? [], (cell) => cell.rowKey),
            (cell) => cell.rowKey,
            (cell) => cell.rowLabel,
        )
    ), [sortedCells]);

    const handleCellRemove = useCallback((cellKey: string, tagKey: string) => {
        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            tagKey === mapping.tag && mapping.association.subRowKey === cellKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            const newMappings = [...(mappings ?? [])];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.id);
        }
    }, [
        onMappingsChange,
        widget.id,
        mappings,
    ]);

    const handleCellAdd = useCallback((cellKey: string, tagKey: string) => {
        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            tagKey === mapping.tag && mapping.association.subRowKey === cellKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            return;
        }

        const rowKey = sortedCells
            ?.find((cell) => cell.subRowKey === cellKey)?.rowKey;

        if (!rowKey) {
            // eslint-disable-next-line no-console
            console.error('Sub-row without row is found');
            return;
        }

        onMappingsChange([
            ...(mappings ?? []),
            {
                tag: tagKey,
                widget: widget.id,
                widgetType: 'MATRIX1D',
                association: {
                    subRowKey: cellKey,
                    rowKey,
                },
                clientId: randomString(),
            // FIXME: need to cast here because we cannot set id
            // and a proper fix would require more time
            } as Matrix1dMappingsItem,
        ], widget.id);
    }, [
        sortedCells,
        onMappingsChange,
        mappings,
        widget,
    ]);

    const tagRowRendererParams = useCallback((_: string, cell: CellItem) => ({
        title: cell.subRowLabel,
        cellKey: cell.subRowKey,
        onMappingRemoveClick: handleCellRemove,
        onMappingAddClick: handleCellAdd,
        mappings,
        predictionTagsById,
        disabled,
    }), [
        disabled,
        handleCellRemove,
        handleCellAdd,
        mappings,
        predictionTagsById,
    ]);

    const subRowGroupRendererParams = useCallback((groupKey: string) => ({
        title: groupLabelMap[groupKey] ?? groupKey,
        direction: 'vertical' as const,
    }), [groupLabelMap]);

    return (
        <ListView
            className={_cs(className, styles.matrixTagInput)}
            data={sortedCells}
            keySelector={cellKeySelector}
            renderer={TagRow}
            rendererParams={tagRowRendererParams}
            filtered={false}
            pending={false}
            errored={false}
            groupRendererParams={subRowGroupRendererParams}
            groupKeySelector={groupKeySelector}
            groupRenderer={CellGroup}
            grouped
        />
    );
}

export default Matrix1dTagInput;
