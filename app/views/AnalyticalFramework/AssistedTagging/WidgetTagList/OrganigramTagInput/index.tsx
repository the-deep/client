import React, { useMemo, useCallback } from 'react';
import {
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    OrganigramWidget,
    OrganigramMappingsItem,
    KeyLabelEntity,
    PredictionTag,
} from '#types/newAnalyticalFramework';
import { sortByOrder } from '#utils/common';

import FrameworkTagRow from '../../FrameworkTagRow';

import { getOrganigramFlatOptions } from './utils';

const cellKeySelector = (cell: KeyLabelEntity) => cell.key;
const optionTypeKeySelector = (mapping: OrganigramMappingsItem) => mapping.association.optionKey;

interface Props {
    className?: string;
    widget: OrganigramWidget;
    mappings: OrganigramMappingsItem[] | undefined;
    onMappingsChange: (
        newMappings: OrganigramMappingsItem[],
        widgetPk: string,
    ) => void;
    predictionTags: PredictionTag[] | undefined;
    disabled?: boolean;
}

function OrganigramTagInput(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        disabled,
        predictionTags,
    } = props;

    const sortedCells = useMemo(() => (
        sortByOrder(getOrganigramFlatOptions(widget?.properties?.options)) ?? []
    ), [widget.properties?.options]);

    const handleCellRemove = useCallback((cellKey: string, tagKey: string) => {
        if (!mappings) {
            return;
        }
        const selectedMappingsIndex = mappings.findIndex((mapping) => (
            tagKey === mapping.tag && mapping.association.optionKey === cellKey
        ));

        if (selectedMappingsIndex !== -1) {
            const newMappings = [...mappings];
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
            } as OrganigramMappingsItem,
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
        predictionTags,
        mappings,
        disabled,
        handleCellAdd,
        handleCellRemove,
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

export default OrganigramTagInput;
