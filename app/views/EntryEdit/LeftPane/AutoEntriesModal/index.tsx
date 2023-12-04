import React, {
    useMemo,
    useEffect,
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
import {
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';
import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';
import {
    Modal,
    ListView,
    useAlert,
    Button,
} from '@the-deep/deep-ui';

import { mergeLists } from '#utils/common';
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
import getSchema, {
    defaultFormValues,
    PartialEntryType,
    PartialAttributeType,
} from '#components/entry/schema';
import {
    AutoEntriesForLeadQuery,
    AutoEntriesForLeadQueryVariables,
    CreateAutoDraftEntriesMutation,
    CreateAutoDraftEntriesMutationVariables,
    AutoDraftEntriesStatusQuery,
    AutoDraftEntriesStatusQueryVariables,
} from '#generated/types';
import AssistPopup from '../AssistItem/AssistPopup';
import { createDefaultAttributes } from '../../utils';

import styles from './styles.css';

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
            id
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

const CREATE_AUTO_DRAFT_ENTRIES = gql`
    mutation CreateAutoDraftEntries (
        $projectId: ID!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            id
            assistedTagging {
                autoDraftEntryCreate(data: {lead: $leadId}) {
                    ok
                    errors
                }
            }
        }
    }
`;

const AUTO_DRAFT_ENTRIES_STATUS = gql`
    query AutoDraftEntriesStatus (
        $projectId: ID!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            id
            assistedTagging {
                extractionStatusByLead(leadId: $leadId) {
                    autoEntryExtractionStatus
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
    createdEntries: PartialEntryType[] | undefined | null;
    onAssistedEntryAdd: (
        (newEntry: PartialEntryType, locations?: GeoArea[]) => void
    ) | undefined;
}

function AutoEntriesModal(props: Props) {
    const {
        onModalClose,
        projectId,
        leadId,
        onAssistedEntryAdd,
        frameworkDetails,
        createdEntries,
    } = props;

    const alert = useAlert();
    const draftEntriesMap = useMemo(() => (
        listToMap(
            createdEntries?.filter((item) => isDefined(item.draftEntry)) ?? [],
            (item) => item.draftEntry ?? '',
            () => true,
        )
    ), [createdEntries]);

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

    const schema = useMemo(
        () => {
            const widgetsMapping = listToMap(
                allWidgets,
                (item) => item.id,
                (item) => item,
            );

            return getSchema(widgetsMapping);
        },
        [allWidgets],
    );
    const {
        setValue,
        value,
        setFieldValue,
    } = useForm(schema, defaultFormValues);

    const {
        setValue: onEntryChange,
    } = useFormArray<'entries', PartialEntryType>('entries', setFieldValue);

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<Record<string, GeoArea[] | undefined> | undefined>(undefined);

    // FIXME: randomId is used to create different query variables after each poll
    // so that apollo doesn't create unnecessary cache
    const [randomId, setRandomId] = useState<string>(randomString());

    const autoEntryStatusVariables = useMemo(() => {
        if (isNotDefined(projectId)) {
            return undefined;
        }
        return ({
            leadId,
            randomId,
            projectId,
        });
    }, [
        randomId,
        leadId,
        projectId,
    ]);

    const [draftEntriesLoading, setDraftEntriesLoading] = useState<boolean>(true);

    const {
        data: autoEntryExtractionStatus,
        refetch: retriggerEntryExtractionStatus,
    } = useQuery<AutoDraftEntriesStatusQuery, AutoDraftEntriesStatusQueryVariables>(
        AUTO_DRAFT_ENTRIES_STATUS,
        {
            skip: isNotDefined(autoEntryStatusVariables),
            variables: autoEntryStatusVariables,
            onCompleted: (response) => {
                const status = response?.project
                    ?.assistedTagging?.extractionStatusByLead?.autoEntryExtractionStatus;
                if (status === 'SUCCESS') {
                    setDraftEntriesLoading(false);
                }
            },
        },
    );

    const extractionStatus = autoEntryExtractionStatus?.project
        ?.assistedTagging?.extractionStatusByLead?.autoEntryExtractionStatus;

    // TODO: This polling calls two queries at a time. Fix this.
    useEffect(() => {
        const timeout = setTimeout(
            () => {
                const shouldPoll = extractionStatus === 'PENDING' || extractionStatus === 'STARTED';
                if (shouldPoll) {
                    setDraftEntriesLoading(true);
                    setRandomId(randomString());
                    retriggerEntryExtractionStatus();
                } else {
                    setDraftEntriesLoading(false);
                }
            },
            2000,
        );

        return () => {
            clearTimeout(timeout);
        };
    }, [
        extractionStatus,
        leadId,
        retriggerEntryExtractionStatus,
    ]);

    const [
        triggerAutoEntriesCreate,
    ] = useMutation<CreateAutoDraftEntriesMutation, CreateAutoDraftEntriesMutationVariables>(
        CREATE_AUTO_DRAFT_ENTRIES,
        {
            onCompleted: (response) => {
                const autoEntriesResponse = response?.project?.assistedTagging
                    ?.autoDraftEntryCreate;
                if (autoEntriesResponse?.ok) {
                    retriggerEntryExtractionStatus();
                } else {
                    alert.show(
                        'Failed to extract entries using NLP.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to extract entries using NLP.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleAutoExtractClick = useCallback(() => {
        triggerAutoEntriesCreate({
            variables: {
                projectId,
                leadId,
            },
        });
    }, [
        projectId,
        leadId,
        triggerAutoEntriesCreate,
    ]);

    const [
        allRecommendations,
        setAllRecommendations,
    ] = useState<Record<string, PartialAttributeType[] | undefined> | undefined>(undefined);

    const [allHints, setAllHints] = useState<
        Record<string, WidgetHint[] | undefined> | undefined
    >(undefined);

    const mappings = frameworkDetails?.predictionTagsMapping;

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
            skip: isNotDefined(extractionStatus)
                || extractionStatus !== 'SUCCESS'
                || isNotDefined(autoEntriesVariables),
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
                        draftEntry: entry.id,
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
                setValue({
                    entries: requiredDraftEntries,
                });
                setAllRecommendations(entryRecommendations);
                setAllHints(entryHints);
                setGeoAreaOptions(entryGeoAreas);
            },
        },
    );

    const handleEntryCreateButtonClick = useCallback((entryId: string) => {
        if (!allRecommendations?.[entryId]) {
            return;
        }

        const selectedEntry = value?.entries?.find((item) => item.clientId === entryId);
        if (onAssistedEntryAdd && selectedEntry) {
            const defaultAttributes = createDefaultAttributes(allWidgets);

            const newAttributes = mergeLists(
                defaultAttributes,
                selectedEntry?.attributes ?? [],
                (attr) => attr.widget,
                (defaultAttr, newAttr) => ({
                    ...newAttr,
                    clientId: defaultAttr.clientId,
                    widget: defaultAttr.widget,
                    id: defaultAttr.id,
                    widgetVersion: defaultAttr.widgetVersion,
                }),
            );

            onAssistedEntryAdd(
                {
                    ...selectedEntry,
                    attributes: newAttributes,
                },
                geoAreaOptions?.[entryId] ?? undefined,
            );

            alert.show(
                'Successfully added entry from recommendation.',
                {
                    variant: 'success',
                },
            );
        } else {
            alert.show(
                'Failed to add entry from recommendations.',
                {
                    variant: 'error',
                },
            );
        }
    }, [
        alert,
        value?.entries,
        allWidgets,
        geoAreaOptions,
        allRecommendations,
        onAssistedEntryAdd,
    ]);

    const filteredEntries = useMemo(() => (
        value?.entries?.filter(
            (item) => item.draftEntry && !draftEntriesMap[item.draftEntry],
        )
    ), [
        value?.entries,
        draftEntriesMap,
    ]);

    const rendererParams = useCallback((
        entryId: string,
        datum: PartialEntryType,
    ) => {
        const onEntryCreateButtonClick = () => handleEntryCreateButtonClick(entryId);
        const index = value?.entries?.findIndex((item) => item.clientId === entryId);

        return ({
            frameworkDetails,
            value: datum,
            className: styles.listItem,
            entryInputClassName: styles.entryInput,
            name: index,
            onChange: onEntryChange,
            leadId,
            hints: allHints?.[entryId],
            recommendations: allRecommendations?.[entryId],
            geoAreaOptions: geoAreaOptions?.[entryId],
            onEntryDiscardButtonClick: noOp,
            onEntryCreateButtonClick,
            onNormalEntryCreateButtonClick: noOp,
            onGeoAreaOptionsChange: noOp,
            predictionsLoading: false,
            predictionsErrored: false,
            messageText: undefined,
            variant: 'normal' as const,
            error: undefined,
        });
    }, [
        value?.entries,
        handleEntryCreateButtonClick,
        onEntryChange,
        allHints,
        allRecommendations,
        frameworkDetails,
        leadId,
        geoAreaOptions,
    ]);

    const isFiltered = useMemo(() => (
        (filteredEntries?.length ?? 0) < (value?.entries?.length ?? 0)
    ), [
        filteredEntries,
        value?.entries,
    ]);

    const hideList = draftEntriesLoading
        || autoEntriesLoading
        || extractionStatus === 'NONE';

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            heading="NLP Extract & Classify"
            size={(hideList || value?.entries?.length === 0) ? 'small' : 'cover'}
            bodyClassName={styles.modalBody}
        >
            <ListView
                data={filteredEntries}
                keySelector={entryKeySelector}
                renderer={AssistPopup}
                rendererParams={rendererParams}
                pendingMessage="Please wait while we load recommendations."
                pending={autoEntriesLoading || draftEntriesLoading}
                errored={false}
                filtered={isFiltered}
                filteredEmptyMessage="Looks like you've already added all entries from recommendations."
                emptyMessage={
                    (extractionStatus === 'NONE')
                        ? "Looks like you've not triggered an extraction yet"
                        : "Looks like there aren't any recommendations."
                }
                messageActions={(extractionStatus === 'NONE') && (
                    <Button
                        name={undefined}
                        onClick={handleAutoExtractClick}
                        variant="tertiary"
                    >
                        Recommend entries
                    </Button>
                )}
                messageShown
                messageIconShown
                borderBetweenItem
            />
        </Modal>
    );
}

export default AutoEntriesModal;
