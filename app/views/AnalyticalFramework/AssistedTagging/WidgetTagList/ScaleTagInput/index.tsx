import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    ScaleWidget,
    SingleSelectWidget,
    MultiSelectWidget,
    CategoricalMappingItem,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import CheckButton from '../../CheckButton';

import styles from './styles.css';

const cellKeySelector = (cell: KeyLabelEntity) => cell.key;

interface Props {
    className?: string;
    widget: ScaleWidget | SingleSelectWidget | MultiSelectWidget;
    mapping: CategoricalMappingItem[] | undefined;
    onMappingChange: (newMapping: CategoricalMappingItem[], widgetClientId: string) => void;
    selectedTag: string | undefined;
}

function ScaleTagInput(props: Props) {
    const {
        className,
        widget,
        mapping,
        onMappingChange,
        selectedTag,
    } = props;

    const sortedCells = useMemo(() => (
        sortByOrder(widget?.properties?.options) ?? []
    ), [widget?.properties?.options]);

    const handleCellClick = useCallback((cellKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingIndex = mapping?.findIndex((m) => {
            if (
                selectedTag === m.tagId
                && (m.widgetType === 'SCALE' || m.widgetType === 'SELECT' || m.widgetType === 'MULTISELECT')
            ) {
                return m.mapping.optionKey === cellKey;
            }
            return false;
        });

        if (isDefined(selectedMappingIndex) && selectedMappingIndex !== -1) {
            const newMapping = [...(mapping ?? [])];
            newMapping.splice(selectedMappingIndex, 1);

            onMappingChange(newMapping, widget.clientId);
        } else {
            onMappingChange([
                ...(mapping ?? []),
                {
                    tagId: selectedTag,
                    widgetClientId: widget.id,
                    widgetType: widget.widgetId,
                    mapping: {
                        optionKey: cellKey,
                    },
                },
            ], widget.clientId);
        }
    }, [
        onMappingChange,
        mapping,
        selectedTag,
        widget,
    ]);

    const cellRendererParams = useCallback((_: string, cell: KeyLabelEntity) => ({
        title: cell.label,
        itemKey: cell.key,
        value: mapping?.some((m) => {
            if (
                selectedTag === m.tagId
                && (
                    m.widgetType === 'SCALE'
                    || m.widgetType === 'SELECT'
                    || m.widgetType === 'MULTISELECT'
                )
            ) {
                return m.mapping.optionKey === cell.key;
            }
            return false;
        }) ?? false,
        mappedCount: mapping?.filter((m) => {
            if (
                m.widgetType === 'SCALE'
                || m.widgetType === 'SELECT'
                || m.widgetType === 'MULTISELECT'
            ) {
                return m.mapping.optionKey === cell.key;
            }
            return false;
        }).length ?? 0,
        onTagClick: handleCellClick,
        disabled: !selectedTag,
    }), [
        handleCellClick,
        selectedTag,
        mapping,
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
