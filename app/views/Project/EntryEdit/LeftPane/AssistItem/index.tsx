import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FaBrain } from 'react-icons/fa';
import {
    listToMap,
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    useForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    QuickActionButton,
    Container,
} from '@the-deep/deep-ui';
import { IoClose } from 'react-icons/io5';

import { useModalState } from '#hooks/stateManagement';
import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    mappingsSupportedWidgets,
    isCategoricalMappings,
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
    PartialEntryType as EntryInput,
    PartialAttributeType,
    getEntrySchema,
} from '../../schema';
import { createDefaultAttributes } from '../../utils';
import { Framework } from '../../types';
import AssistPopup from '../AssistPopup';
import {
    createMatrix1dAttr,
    createMatrix2dAttr,
    createScaleAttr,
    createSelectAttr,
    createMultiSelectAttr,
} from '../AssistPopup/utils';

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
    text: string;
    onAssistedEntryAdd: ((newEntry: EntryInput) => void) | undefined;
    frameworkDetails: Framework;
    leadId: string;
    onAssistCancel: () => void;
    disabled?: boolean;
}

function AssistItem(props: Props) {
    const {
        className,
        text,
        onAssistedEntryAdd,
        frameworkDetails,
        leadId,
        onAssistCancel,
        disabled,
    } = props;

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

    const mappings = frameworkDetails?.predictionTagsMapping;
    const [allHints, setAllHints] = useState<WidgetHint[] | undefined>(undefined);

    const schema = useMemo(
        () => {
            const widgetsMapping = listToMap(
                allWidgets,
                (item) => item.id,
                (item) => item,
            );
            return getEntrySchema(widgetsMapping);
        },
        [allWidgets],
    );

    const emptyEntry: EntryInput = useMemo(() => ({
        clientId: randomString(),
        entryType: 'EXCERPT' as const,
        lead: leadId,
        excerpt: text,
        droppedExcerpt: text,
        attributes: createDefaultAttributes(allWidgets),
    }), [
        leadId,
        allWidgets,
        text,
    ]);

    const [
        isAssistedTaggingModalShown,
        showAssistedTaggingModal,
        hideAssistedTaggingModal,
    ] = useModalState(true);

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const {
        setValue,
        value,
        validate,
        setError,
        error,
    } = useForm(schema, emptyEntry);

    const handleEntryCreateButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                if (onAssistedEntryAdd) {
                    onAssistedEntryAdd(entryData);
                }
            },
        );
        submit();
    }, [
        validate,
        setError,
        onAssistedEntryAdd,
    ]);

    // FIXME: Use pending from request
    const [pending, setPending] = useState(true);

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

        setValue(
            (oldEntry) => {
                if (!oldEntry) {
                    return {
                        clientId: randomString(),
                        entryType: 'EXCERPT',
                        lead: leadId,
                        excerpt: text,
                        droppedExcerpt: text,
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
        text,
        leadId,
        mappings,
        setValue,
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

    return (
        <Container
            className={_cs(className, styles.assistItem)}
            footerActions={(
                <QuickActionButton
                    name={undefined}
                    title="Assist"
                    className={styles.button}
                    onClick={showAssistedTaggingModal}
                    disabled={disabled}
                    variant="tertiary"
                >
                    <FaBrain />
                </QuickActionButton>
            )}
            headerActions={(
                <QuickActionButton
                    name={undefined}
                    title="Cancel"
                    onClick={onAssistCancel}
                    disabled={disabled}
                    variant="action"
                >
                    <IoClose />
                </QuickActionButton>
            )}
            contentClassName={styles.content}
        >
            {text}
            {isAssistedTaggingModalShown && (
                <AssistPopup
                    onCloseButtonClick={hideAssistedTaggingModal}
                    frameworkDetails={frameworkDetails}
                    value={value}
                    onChange={setValue}
                    error={error}
                    leadId={leadId}
                    hints={allHints}
                    onEntryCreateButtonClick={handleEntryCreateButtonClick}
                    geoAreaOptions={geoAreaOptions}
                    onGeoAreaOptionsChange={setGeoAreaOptions}
                    loadingPredictions={pending}
                />
            )}
        </Container>
    );
}

export default AssistItem;
