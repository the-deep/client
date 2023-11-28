import React, {
    useMemo,
    useCallback,
    useState,
} from 'react';
import {
    isNotDefined,
    isDefined,
    randomString,
    noOp,
    listToMap,
} from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    Modal,
    ListView,
} from '@the-deep/deep-ui';

import { type Framework } from '#components/entry/types';
import { type GeoArea } from '#components/GeoMultiSelectInput';
import {
    mappingsSupportedWidgets,
    isCategoricalMappings,
    WidgetHint,
    filterMatrix1dMappings,
    filterMatrix2dMappings,
    filterScaleMappings,
    filterSelectMappings,
    filterMultiSelectMappings,
    filterOrganigramMappings,
    type MappingsItem,
} from '#types/newAnalyticalFramework';
import {
    PartialEntryType,
    PartialAttributeType,
} from '#components/entry/schema';
import {
    AutoEntriesForLeadQuery,
    AutoEntriesForLeadQueryVariables,
} from '#generated/types';
import AssistPopup from '../AssistItem/AssistPopup';

import {
    createOrganigramAttr,
    createMatrix1dAttr,
    createMatrix2dAttr,
    createScaleAttr,
    createSelectAttr,
    createMultiSelectAttr,
    createGeoAttr,
} from '../AssistItem/utils';

const GEOLOCATION_DEEPL_MODEL_ID = 'geolocation';

const AUTO_ENTRIES_FOR_LEAD = gql`
    query AutoEntriesForLead(
        $projectId: ID!,
        $leadIds: [ID!],
    ) {
        project(id: $projectId) {
            assistedTagging {
                draftEntryByLeads(
                filter: {
                    draftEntryType: AUTO,
                    lead: $leadIds,
                }) {
                    id
                    excerpt
                    predictionReceivedAt
                    predictionStatus
                    predictions {
                        id
                        draftEntry
                        tag
                        dataTypeDisplay
                        dataType
                        category
                        isSelected
                        modelVersion
                        modelVersionDeeplModelId
                        prediction
                        threshold
                        value
                    }
                }
            }
        }
    }
`;

interface EntryAttributes {
    predictions: {
        tags: string[];
        locations: GeoArea[];
    };
    mappings: MappingsItem[] | null | undefined;
    filteredWidgets: NonNullable<Framework['primaryTagging']>[number]['widgets']
    | NonNullable<Framework['secondaryTagging']>;
}

function handleMappingsFetch(entryAttributes: EntryAttributes) {
    const {
        predictions,
        mappings,
        filteredWidgets,
    } = entryAttributes;

    if (predictions.tags.length <= 0 && predictions.locations.length <= 0) {
        // setMessageText('DEEP could not provide any recommendations for the selected text.');
        return {};
    }

    if (isNotDefined(filteredWidgets)) {
        return {};
    }

    const matchedMappings = mappings
        ?.filter(isCategoricalMappings)
        .filter((m) => m.tag && predictions.tags.includes(m.tag));

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
                    tempHints: hintsWithInfo
                        ? [...oldTempHints, hintsWithInfo]
                        : oldTempHints,
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
                    tempHints: hintsWithInfo
                        ? [...oldTempHints, hintsWithInfo]
                        : oldTempHints,
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
            if (widget.widgetId === 'ORGANIGRAM') {
                const supportedTags = matchedMappings
                    ?.filter((m) => m.widget === widget.id)
                    .filter(filterOrganigramMappings);

                const attr = createOrganigramAttr(
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
            && predictions.locations.length > 0
            && supportedGeoWidgets?.includes(widget.id)
            ) {
                const attr = createGeoAttr(
                    predictions.locations,
                    widget,
                );

                return {
                    tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                    tempHints: oldTempHints,
                };
            }
            return acc;
        },
        {
            tempAttrs: [],
            tempHints: [],
        },
    );

    if (recommendedAttributes.length <= 0 && widgetsHints.length <= 0) {
        // setMessageText(
        // 'The provided recommendations for this text did not fit any tags in this project.',
        // );
        return {};
    }

    return {
        hints: widgetsHints,
        recommendations: recommendedAttributes,
        geoAreas: predictions.locations,
    };
}

const entryKeySelector = (entry: PartialEntryType) => entry.clientId;

interface Props {
    onModalClose: () => void;
    projectId: string;
    leadId: string;
    frameworkDetails: Framework;
}

function AutoEntriesModal(props: Props) {
    const {
        onModalClose,
        projectId,
        leadId,
        frameworkDetails,
    } = props;

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<{
        entryId: string;
        geoAreas: GeoArea[] | undefined | null;
    } | undefined>();

    // const [messageText, setMessageText] = useState<string | undefined>();

    const [
        allRecommendations,
        setAllRecommendations,
    ] = useState<Record<string, PartialAttributeType[] | undefined> | undefined>(undefined);

    const [allHints, setAllHints] = useState<
        Record<string, WidgetHint[] | undefined> | undefined
    >(undefined);

    const mappings = frameworkDetails?.predictionTagsMapping;

    const {
        allWidgets,
        filteredWidgets,
    } = useMemo(() => {
        const widgetsFromPrimary = frameworkDetails?.primaryTagging?.flatMap(
            (item) => (item.widgets ?? []),
        ) ?? [];
        const widgetsFromSecondary = frameworkDetails?.secondaryTagging ?? [];
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

    /*
    const handleMappingsFetchTest = useCallback(
        (predictions: { tags: string[]; locations: GeoArea[]; }) => {
            if (predictions.tags.length <= 0 && predictions.locations.length <= 0) {
                setMessageText('DEEP could not provide any recommendations for the selected text.');
                return;
            }

            setGeoAreaOptions(predictions.locations);

            const matchedMappings = mappings
                ?.filter(isCategoricalMappings)
                .filter((m) => m.tag && predictions.tags.includes(m.tag));

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
                            tempHints: hintsWithInfo
                                ? [...oldTempHints, hintsWithInfo]
                                : oldTempHints,
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
                            tempHints: hintsWithInfo
                                ? [...oldTempHints, hintsWithInfo]
                                : oldTempHints,
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
                    if (widget.widgetId === 'ORGANIGRAM') {
                        const supportedTags = matchedMappings
                            ?.filter((m) => m.widget === widget.id)
                            .filter(filterOrganigramMappings);

                        const attr = createOrganigramAttr(
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
                    && predictions.locations.length > 0
                    && supportedGeoWidgets?.includes(widget.id)
                    ) {
                        const attr = createGeoAttr(
                            predictions.locations,
                            widget,
                        );

                        return {
                            tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                            tempHints: oldTempHints,
                        };
                    }
                    return acc;
                },
                {
                    tempAttrs: [],
                    tempHints: [],
                },
            );

            if (recommendedAttributes.length <= 0 && widgetsHints.length <= 0) {
                setMessageText(
                    'The provided recommendations for this text did
                    not fit any tags in this project.',
                );
                return;
            }
            setAllHints(widgetsHints);
            setAllRecommendations(recommendedAttributes);
            return {
                hints: widgetsHints,
                recommendations: recommendedAttributes,

            };
        },
        [
            mappings,
            filteredWidgets,
        ],
    );
    */

    const [
        draftEntries,
        setDraftEntries,
    ] = useState<PartialEntryType[]>([]);

    const autoEntriesVariables = useMemo(() => ({
        projectId,
        leadIds: [leadId],
    }), [
        projectId,
        leadId,
    ]);

    const {
        loading: autoEntriesLoading,
    } = useQuery<AutoEntriesForLeadQuery, AutoEntriesForLeadQueryVariables>(
        AUTO_ENTRIES_FOR_LEAD,
        {
            skip: isNotDefined(autoEntriesVariables),
            variables: autoEntriesVariables,
            onCompleted: (response) => {
                const entries = response.project?.assistedTagging?.draftEntryByLeads;
                const transformedEntries = (entries ?? [])?.map((entry) => {
                    const validPredictions = entry.predictions?.filter(isDefined);
                    const categoricalTags = validPredictions?.filter(
                        (prediction) => (
                            prediction.modelVersionDeeplModelId !== GEOLOCATION_DEEPL_MODEL_ID
                            && prediction.isSelected
                        ),
                    ).map(
                        (prediction) => prediction.tag,
                    ).filter(isDefined) ?? [];

                    const entryAttributeData: EntryAttributes = {
                        predictions: {
                            tags: categoricalTags,
                            locations: [],
                        },
                        mappings,
                        filteredWidgets,
                    };

                    const {
                        hints: entryHints,
                        recommendations: entryRecommendations,
                        geoAreas: entryGeoAreas,
                    } = handleMappingsFetch(entryAttributeData);

                    const entryId = randomString();
                    const requiredEntry = {
                        clientId: entryId,
                        entryType: 'EXCERPT' as const,
                        lead: leadId,
                        excerpt: entry.excerpt,
                        droppedExcerpt: entry.excerpt,
                        attributes: entryRecommendations?.map((attr) => {
                            if (attr.widgetType !== 'GEO') {
                                return attr;
                            }
                            // NOTE: Selecting only the 1st recommendation
                            return ({
                                ...attr,
                                data: {
                                    value: attr?.data?.value.slice(0, 1) ?? [],
                                },
                            });
                        }),
                    };

                    return {
                        entryId,
                        geoLocations: entryGeoAreas,
                        recommendations: entryRecommendations,
                        hints: entryHints,
                        entry: requiredEntry,
                    };
                });
                const requiredDraftEntries = transformedEntries?.map(
                    (draftEntry) => draftEntry.entry,
                );
                const entryRecommendations = listToMap(
                    transformedEntries,
                    (item) => item.entryId,
                    (item) => item.recommendations,
                );
                const entryHints = listToMap(
                    transformedEntries,
                    (item) => item.entryId,
                    (item) => item.hints,
                );
                const entryGeoAreas = listToMap(
                    transformedEntries,
                    (item) => item.entryId,
                    (item) => item.geoLocations,
                );
                setDraftEntries(requiredDraftEntries);
                setAllRecommendations(entryRecommendations);
                setAllHints(entryHints);
                setGeoAreaOptions(entryGeoAreas);
            },
        },
    );

    const rendererParams = useCallback((entryId: string, datum: PartialEntryType) => ({
        frameworkDetails,
        value: datum,
        onChange: noOp,
        leadId,
        hints: allHints?.[entryId],
        recommendations: allRecommendations?.[entryId],
        geoAreaOptions: undefined,
        onEntryDiscardButtonClick: noOp,
        onEntryCreateButtonClick: noOp,
        onNormalEntryCreateButtonClick: noOp,
        onGeoAreaOptionsChange: noOp,
        predictionsLoading: false,
        predictionsErrored: false,
        messageText: undefined,
        variant: 'normal' as const,
        error: undefined,
    }), [
        allHints,
        allRecommendations,
        frameworkDetails,
        leadId,
    ]);

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            heading="Draft Entries"
            size="cover"
        >
            <ListView
                data={draftEntries}
                keySelector={entryKeySelector}
                renderer={AssistPopup}
                rendererParams={rendererParams}
                pendingMessage="Please wait while DEEP analyzes your text"
                pending={autoEntriesLoading}
                errored={false}
                filtered={false}
            />
        </Modal>
    );
}

export default AutoEntriesModal;
