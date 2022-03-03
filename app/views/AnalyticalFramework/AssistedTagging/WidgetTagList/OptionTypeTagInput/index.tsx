import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    listToGroupList,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    ScaleWidget,
    SingleSelectWidget,
    MultiSelectWidget,
    ScaleMappingsItem,
    SelectMappingsItem,
    MultiSelectMappingsItem,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import CheckButton from '../../CheckButton';

import styles from './styles.css';

const cellKeySelector = (cell: KeyLabelEntity) => cell.key;

interface Props {
    className?: string;
    widget: ScaleWidget | SingleSelectWidget | MultiSelectWidget;
    mappings: (ScaleMappingsItem | SelectMappingsItem | MultiSelectMappingsItem)[] | undefined;
    onMappingsChange: (
        newMappings: (ScaleMappingsItem | SelectMappingsItem | MultiSelectMappingsItem)[],
        widgetPk: string,
    ) => void;
    selectedTag: string | undefined;
}

function ScaleTagInput(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        selectedTag,
    } = props;

    const sortedCells = useMemo(() => (
        sortByOrder(widget?.properties?.options) ?? []
    ), [widget?.properties?.options]);

    const optionKeysInMappings = useMemo(() => (
        listToMap(
            mappings?.filter((mappingItem) => mappingItem.tagId === selectedTag),
            (mappingItem) => mappingItem.association.optionKey,
            () => true,
        )
    ), [
        mappings,
        selectedTag,
    ]);

    const mappingsGroupedByOptionKey = useMemo(() => (
        listToGroupList(
            mappings,
            (mappingItem) => mappingItem.association.optionKey,
        )
    ), [
        mappings,
    ]);

    const handleCellClick = useCallback((cellKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            selectedTag === mapping.tagId
            && mapping.association.optionKey === cellKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            const newMappings = [...(mappings ?? [])];
            newMappings.splice(selectedMappingsIndex, 1);

            onMappingsChange(newMappings, widget.id);
        } else {
            onMappingsChange([
                ...(mappings ?? []),
                {
                    tagId: selectedTag,
                    widgetPk: widget.id,
                    widgetType: widget.widgetId,
                    association: {
                        optionKey: cellKey,
                    },
                },
            ], widget.id);
        }
    }, [
        onMappingsChange,
        mappings,
        selectedTag,
        widget,
    ]);

    const cellRendererParams = useCallback((_: string, cell: KeyLabelEntity) => ({
        children: cell.label,
        name: cell.key,
        value: !!optionKeysInMappings?.[cell.key],
        badgeCount: mappingsGroupedByOptionKey?.[cell.key]?.length ?? 0,
        onClick: handleCellClick,
        disabled: !selectedTag,
    }), [
        handleCellClick,
        selectedTag,
        optionKeysInMappings,
        mappingsGroupedByOptionKey,
    ]);

    return (
        <ListView
            className={_cs(className, styles.scaleTagInput)}
            data={sortedCells}
            keySelector={cellKeySelector}
            renderer={CheckButton}
            rendererParams={cellRendererParams}
            filtered={false}
            pending={false}
            errored={false}
        />
    );
}

export default ScaleTagInput;
