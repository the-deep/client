import React, { useMemo, useCallback } from 'react';
import {
    isDefined,
    randomString,
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
    PredictionTag,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import FrameworkTagRow from '../../FrameworkTagRow';

const cellKeySelector = (cell: KeyLabelEntity) => cell.key;
const optionTypeKeySelector = (
    mapping: ScaleMappingsItem | SelectMappingsItem | MultiSelectMappingsItem,
) => mapping.association.optionKey;

interface Props {
    className?: string;
    widget: ScaleWidget | SingleSelectWidget | MultiSelectWidget;
    mappings: (ScaleMappingsItem | SelectMappingsItem | MultiSelectMappingsItem)[] | undefined;
    onMappingsChange: (
        newMappings: (ScaleMappingsItem | SelectMappingsItem | MultiSelectMappingsItem)[],
        widgetPk: string,
    ) => void;
    predictionTags: PredictionTag[] | undefined;
    disabled?: boolean;
}

function OptionTypeTagInput(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        predictionTags,
        disabled,
    } = props;

    const sortedCells = useMemo(() => (
        sortByOrder(widget?.properties?.options) ?? []
    ), [widget?.properties?.options]);

    const handleCellRemove = useCallback((cellKey: string, tagKey: string) => {
        const selectedMappingsIndex = mappings?.findIndex((mapping) => (
            tagKey === mapping.tag && mapping.association.optionKey === cellKey
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
            tagKey === mapping.tag
            && mapping.association.optionKey === cellKey
        ));

        if (isDefined(selectedMappingsIndex) && selectedMappingsIndex !== -1) {
            return;
        }

        onMappingsChange([
            ...(mappings ?? []),
            {
                tag: tagKey,
                widget: widget.id,
                widgetType: widget.widgetId,
                association: {
                    optionKey: cellKey,
                },
                clientId: randomString(),
            // FIXME: need to cast here because we cannot set id
            // and a proper fix would require more time
            } as ScaleMappingsItem | SelectMappingsItem | MultiSelectMappingsItem,
        ], widget.id);
    }, [
        onMappingsChange,
        mappings,
        widget,
    ]);

    const cellRendererParams = useCallback((_: string, cell: KeyLabelEntity) => ({
        title: cell.label,
        itemKey: cell.key,
        onMappingRemoveClick: handleCellRemove,
        onMappingAddClick: handleCellAdd,
        associationKeySelector: optionTypeKeySelector,
        mappings,
        predictionTags,
        disabled,
    }), [
        disabled,
        mappings,
        handleCellRemove,
        handleCellAdd,
        predictionTags,
    ]);

    return (
        <ListView
            className={className}
            data={sortedCells}
            keySelector={cellKeySelector}
            renderer={FrameworkTagRow}
            rendererParams={cellRendererParams}
            filtered={false}
            pending={false}
            errored={false}
        />
    );
}

export default OptionTypeTagInput;
