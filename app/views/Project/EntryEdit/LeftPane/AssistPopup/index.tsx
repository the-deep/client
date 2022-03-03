import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
} from '@togglecorp/toggle-form';

import useLocalStorage from '#hooks/useLocalStorage';
import EntryInput from '#components/entry/EntryInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    MappingsItem,
    isCategoricalMappings,
    mappingsSupportedWidgets,
    WidgetHint,
    filterMatrix1dMappings,
    filterMatrix2dMappings,
    filterScaleMappings,
    filterSelectMappings,
    filterMultiSelectMappings,
} from '#types/newAnalyticalFramework';

import {
    mergeLists,
} from '#utils/common';

import {
    Framework,
} from '../../types';
import {
    PartialAttributeType,
    PartialEntryType,
} from '../../schema';
import {
    createMatrix1dAttr,
    createMatrix2dAttr,
    createScaleAttr,
    createSelectAttr,
    createMultiSelectAttr,
} from './utils';

import styles from './styles.css';

// FIXME: Remove this after connecting backend
const mockAssistedMappingsResponse = {
    tags: [
        '9',
        '6',
        '7',
        '11',
        '12',
        '5',
        '2',
    ],
    numbers: [122, 1123, 541],
    locations: ['Kathmandu'],
};

interface Props {
    className?: string;
    frameworkDetails: Framework;
    leadId: string;
    value: PartialEntryType;
    onChange: (val: SetValueArg<PartialEntryType>, name: undefined) => void;
    selectedText: string;
    error: Error<PartialEntryType> | undefined;
    onEntryCreateButtonClick: () => void;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onCloseButtonClick: () => void;
}

function AssistPopup(props: Props) {
    const {
        className,
        onCloseButtonClick,
        selectedText,
        leadId,
        value,
        onChange,
        error,
        frameworkDetails,
        onEntryCreateButtonClick,
        geoAreaOptions,
        onGeoAreaOptionsChange,
    } = props;

    const [mappings] = useLocalStorage<MappingsItem[] | undefined>(`mappings-${frameworkDetails.id}`, undefined);
    const [allHints, setAllHints] = useState<WidgetHint[] | undefined>(undefined);

    const {
        allWidgets,
        filteredWidgets,
    } = useMemo(() => {
        const widgetsFromPrimary = frameworkDetails.primaryTagging?.flatMap(
            (item) => (item.widgets ?? []),
        ) ?? [];
        const widgetsFromSecondary = frameworkDetails.secondaryTagging ?? [];
        const widgets = [
            ...widgetsFromPrimary,
            ...widgetsFromSecondary,
        ];
        return {
            allWidgets: widgets,
            filteredWidgets: widgets.filter((w) => mappingsSupportedWidgets.includes(w.widgetId)),
        };
    }, [
        frameworkDetails,
    ]);

    // FIXME: Insert this inside onCompleted
    const handleMappingsFetch = useCallback(() => {
        const matchedMappings = mappings
            ?.filter(isCategoricalMappings)
            .filter((m) => mockAssistedMappingsResponse.tags.includes(m.tagId));

        const supportedGeoWidgets = mappings
            ?.filter((mappingItem) => mappingItem.widgetType === 'GEO')
            ?.map((mappingItem) => mappingItem.widgetPk);

        const supportedNumberWidgets = mappings
            ?.filter((mappingItem) => mappingItem.widgetType === 'NUMBER')
            ?.map((mappingItem) => mappingItem.widgetPk);

        const {
            tempAttrs: recommendedAttributes,
            tempHints: widgetsHints,
        } = filteredWidgets.reduce(
            (
                acc: { tempAttrs: PartialAttributeType[]; tempHints: WidgetHint[]; },
                widget,
            ) => {
                const {
                    tempAttrs: oldTempAttrs,
                    tempHints: oldTempHints,
                } = acc;

                if (widget.widgetId === 'MATRIX1D') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widgetPk === widget.id)
                        .filter(filterMatrix1dMappings);

                    const attr = createMatrix1dAttr(supportedTags, widget);
                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (widget.widgetId === 'MATRIX2D') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widgetPk === widget.id)
                        .filter(filterMatrix2dMappings);

                    const attr = createMatrix2dAttr(supportedTags, widget);

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (widget.widgetId === 'SCALE') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widgetPk === widget.id)
                        .filter(filterScaleMappings);

                    const {
                        attr,
                        hints,
                    } = createScaleAttr(supportedTags, widget);

                    const hintsWithInfo = hints ? {
                        widgetPk: widget.id,
                        widgetType: 'SCALE' as const,
                        hints,
                    } : undefined;

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: hintsWithInfo ? [...oldTempHints, hintsWithInfo] : oldTempHints,
                    };
                }
                if (widget.widgetId === 'SELECT') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widgetPk === widget.id)
                        .filter(filterSelectMappings);

                    const {
                        attr,
                        hints,
                    } = createSelectAttr(supportedTags, widget);

                    const hintsWithInfo = hints ? {
                        widgetPk: widget.id,
                        widgetType: 'SELECT' as const,
                        hints,
                    } : undefined;

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: hintsWithInfo ? [...oldTempHints, hintsWithInfo] : oldTempHints,
                    };
                }
                if (widget.widgetId === 'MULTISELECT') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widgetPk === widget.id)
                        .filter(filterMultiSelectMappings);

                    const attr = createMultiSelectAttr(
                        supportedTags,
                        widget,
                    );
                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (
                    widget.widgetId === 'NUMBER'
                    && mockAssistedMappingsResponse.numbers.length > 0
                    && supportedNumberWidgets?.includes(widget.id)
                ) {
                    if (mockAssistedMappingsResponse.numbers.length === 1) {
                        const attr = {
                            clientId: randomString(),
                            widget: widget.id,
                            widgetVersion: widget.version,
                            widgetType: 'NUMBER' as const,
                            data: {
                                value: mockAssistedMappingsResponse.numbers[0],
                            },
                        };
                        return {
                            tempAttrs: [...oldTempAttrs, attr],
                            tempHints: oldTempHints,
                        };
                    }
                    if (mockAssistedMappingsResponse.numbers.length > 1) {
                        const hintsWithInfo = {
                            widgetPk: widget.id,
                            widgetType: 'NUMBER' as const,
                            hints: mockAssistedMappingsResponse.numbers,
                        };
                        return {
                            tempAttrs: oldTempAttrs,
                            tempHints: [...oldTempHints, hintsWithInfo],
                        };
                    }
                }
                if (
                    widget.widgetId === 'GEO'
                    && mockAssistedMappingsResponse.locations.length > 0
                    && supportedGeoWidgets?.includes(widget.id)
                ) {
                    const hintsWithInfo = {
                        widgetPk: widget.id,
                        widgetType: 'GEO' as const,
                        hints: mockAssistedMappingsResponse.locations,
                    };
                    return {
                        tempAttrs: oldTempAttrs,
                        tempHints: [...oldTempHints, hintsWithInfo],
                    };
                }
                return acc;
            },
            {
                tempAttrs: [],
                tempHints: [],
            },
        );

        setAllHints(widgetsHints.filter(isDefined));

        onChange(
            (oldEntry) => {
                if (!oldEntry) {
                    const newEntry = {
                        clientId: randomString(),
                        entryType: 'EXCERPT' as const,
                        lead: leadId,
                        excerpt: selectedText,
                        droppedExcerpt: selectedText,
                        attributes: recommendedAttributes,
                    };

                    return newEntry;
                }
                const oldAttributes = oldEntry?.attributes ?? [];

                const newAttributes = mergeLists(
                    oldAttributes,
                    recommendedAttributes,
                    (attr) => attr.widget,
                    (oldAttr, newAttr) => ({
                        ...newAttr,
                        clientId: oldAttr.clientId,
                        widget: oldAttr.widget,
                        id: oldAttr.id,
                        widgetVersion: oldAttr.widgetVersion,
                    }),
                );

                return {
                    ...oldEntry,
                    attributes: newAttributes,
                };
            },
            undefined,
        );
    }, [
        selectedText,
        leadId,
        mappings,
        onChange,
        filteredWidgets,
    ]);

    return (
        <Modal
            className={_cs(className, styles.assistPopup)}
            heading="Assisted Tagging"
            headingSize="extraSmall"
            onCloseButtonClick={onCloseButtonClick}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={handleMappingsFetch}
                    >
                        Fetch Details
                    </Button>
                    <Button
                        name={undefined}
                        onClick={onEntryCreateButtonClick}
                    >
                        Create Entry
                    </Button>
                </>
            )}
        >
            <EntryInput
                leadId={leadId}
                name={undefined}
                error={error}
                value={value}
                onChange={onChange}
                primaryTagging={frameworkDetails.primaryTagging}
                secondaryTagging={frameworkDetails.secondaryTagging}
                entryImage={undefined}
                onAddButtonClick={undefined}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                allWidgets={allWidgets}
                widgetsHints={allHints}
                emptyValueHidden
                addButtonHidden
                compact
            />
        </Modal>
    );
}

export default AssistPopup;
