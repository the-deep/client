import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    Modal,
    Message,
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
        '10',
        '18',
        '20',
        '19',
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

    // FIXME: Use pending from request
    const [pending, setPending] = useState(true);

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
            .filter((m) => mockAssistedMappingsResponse.tags.includes(m.tag));

        const supportedGeoWidgets = mappings
            ?.filter((mappingItem) => mappingItem.widgetType === 'GEO')
            ?.map((mappingItem) => mappingItem.widget);

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
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterMatrix1dMappings);

                    const attr = createMatrix1dAttr(supportedTags, widget);
                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (widget.widgetId === 'MATRIX2D') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterMatrix2dMappings);

                    const attr = createMatrix2dAttr(supportedTags, widget);

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (widget.widgetId === 'SCALE') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterScaleMappings);

                    const {
                        attr,
                        hints,
                    } = createScaleAttr(supportedTags, widget);

                    const hintsWithInfo: WidgetHint | undefined = hints ? {
                        widgetPk: widget.id,
                        widgetType: 'SCALE',
                        hints,
                    } : undefined;

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: hintsWithInfo ? [...oldTempHints, hintsWithInfo] : oldTempHints,
                    };
                }
                if (widget.widgetId === 'SELECT') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterSelectMappings);

                    const {
                        attr,
                        hints,
                    } = createSelectAttr(supportedTags, widget);

                    const hintsWithInfo: WidgetHint | undefined = hints ? {
                        widgetPk: widget.id,
                        widgetType: 'SELECT',
                        hints,
                    } : undefined;

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: hintsWithInfo ? [...oldTempHints, hintsWithInfo] : oldTempHints,
                    };
                }
                if (widget.widgetId === 'MULTISELECT') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
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
                    widget.widgetId === 'GEO'
                    && mockAssistedMappingsResponse.locations.length > 0
                    && supportedGeoWidgets?.includes(widget.id)
                ) {
                    const hintsWithInfo: WidgetHint = {
                        widgetPk: widget.id,
                        widgetType: 'GEO',
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

        setAllHints(widgetsHints);

        onChange(
            (oldEntry) => {
                if (!oldEntry) {
                    return {
                        clientId: randomString(),
                        entryType: 'EXCERPT',
                        lead: leadId,
                        excerpt: selectedText,
                        droppedExcerpt: selectedText,
                        attributes: recommendedAttributes,
                    };
                }
                const oldAttributes = oldEntry.attributes ?? [];

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
        // FIXME: Remove this later
        setPending(false);
    }, [
        selectedText,
        leadId,
        mappings,
        onChange,
        filteredWidgets,
    ]);

    useEffect(() => {
        const timeout = setTimeout(
            () => {
                if (pending) {
                    handleMappingsFetch();
                }
            },
            2000,
        );
        return () => {
            clearTimeout(timeout);
        };
    }, [handleMappingsFetch, pending]);

    const isMessageShown = pending;

    return (
        <Modal
            className={_cs(className, styles.assistPopup)}
            heading="Assisted Tagging"
            headingSize="extraSmall"
            onCloseButtonClick={onCloseButtonClick}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={onEntryCreateButtonClick}
                    disabled={isMessageShown}
                >
                    Create Entry
                </Button>
            )}
        >
            {isMessageShown ? (
                <Message
                    pending={pending}
                    pendingMessage="DEEP is analyzing your text."
                />
            ) : (
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
            )}
        </Modal>
    );
}

export default AssistPopup;
