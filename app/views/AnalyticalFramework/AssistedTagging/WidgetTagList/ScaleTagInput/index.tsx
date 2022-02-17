import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    // compareNumber,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    ScaleWidget,
    SingleSelectWidget,
    MultiSelectWidget,
    MappingItem,
    KeyLabelEntity,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import CheckButton from '../../CheckButton';

import styles from './styles.css';

const cellKeySelector = (cell: KeyLabelEntity) => cell.key;

interface Props {
    className?: string;
    widget: ScaleWidget | SingleSelectWidget | MultiSelectWidget;
    mapping: MappingItem[] | undefined;
    onMappingChange: React.Dispatch<React.SetStateAction<MappingItem[] | undefined>>;
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

        const isCurrentlySelected = mapping?.some((m) => {
            if (
                selectedTag === m.tagId
                && m.widgetId === widget.clientId
                && (m.widgetType === 'SCALE' || m.widgetType === 'SELECT' || m.widgetType === 'MULTISELECT')
            ) {
                return m.mapping.optionKey === cellKey;
            }
            return false;
        }) ?? false;

        if (isCurrentlySelected) {
            onMappingChange((oldMapping) => (
                oldMapping?.filter((om) => {
                    if (
                        selectedTag === om.tagId
                        && om.widgetId === widget.clientId
                        && (
                            om.widgetType === 'SCALE'
                            || om.widgetType === 'SELECT'
                            || om.widgetType === 'MULTISELECT'
                        )
                    ) {
                        return om.mapping.optionKey !== cellKey;
                    }
                    return true;
                })
            ));
        } else {
            onMappingChange((oldMapping) => ([
                ...(oldMapping ?? []),
                {
                    tagId: selectedTag,
                    widgetId: widget.id,
                    widgetType: widget.widgetId,
                    mapping: {
                        optionKey: cellKey,
                    },
                },
            ]));
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
                && m.widgetId === widget.clientId
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
        onTagClick: handleCellClick,
        disabled: !selectedTag,
    }), [
        widget,
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
