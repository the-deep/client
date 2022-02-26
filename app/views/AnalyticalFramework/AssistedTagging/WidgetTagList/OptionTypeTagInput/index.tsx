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
    CategoricalMappingsItem,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import CheckButton from '../../CheckButton';

import styles from './styles.css';

const cellKeySelector = (cell: KeyLabelEntity) => cell.key;

interface Props {
    className?: string;
    widget: ScaleWidget | SingleSelectWidget | MultiSelectWidget;
    mappings: CategoricalMappingsItem[] | undefined;
    onMappingsChange: (newMappings: CategoricalMappingsItem[], widgetPk: string) => void;
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

    const handleCellClick = useCallback((cellKey: string) => {
        if (!selectedTag) {
            return;
        }

        const selectedMappingsIndex = mappings?.findIndex((mapping) => {
            if (
                selectedTag === mapping.tagId
                && (
                    mapping.widgetType === 'SCALE'
                    || mapping.widgetType === 'SELECT'
                    || mapping.widgetType === 'MULTISELECT'
                )
            ) {
                return mapping.association.optionKey === cellKey;
            }
            return false;
        });

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
        value: mappings?.some((mapping) => {
            if (
                selectedTag === mapping.tagId
                && (
                    mapping.widgetType === 'SCALE'
                    || mapping.widgetType === 'SELECT'
                    || mapping.widgetType === 'MULTISELECT'
                )
            ) {
                return mapping.association.optionKey === cell.key;
            }
            return false;
        }) ?? false,
        mappedCount: mappings?.filter((mapping) => {
            if (
                mapping.widgetType === 'SCALE'
                || mapping.widgetType === 'SELECT'
                || mapping.widgetType === 'MULTISELECT'
            ) {
                return mapping.association.optionKey === cell.key;
            }
            return false;
        }).length ?? 0,
        onClick: handleCellClick,
        disabled: !selectedTag,
    }), [
        handleCellClick,
        selectedTag,
        mappings,
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
