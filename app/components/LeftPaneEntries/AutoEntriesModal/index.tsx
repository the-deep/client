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
    ListView,
    Modal,
    Pager,
    Tab,
    TabList,
    TabPanel,
    Tabs,
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
    UpdateDraftEntryMutation,
    UpdateDraftEntryMutationVariables,
} from '#generated/types';
import AssistPopup from '../AssistItem/AssistPopup';
import { createDefaultAttributes } from '../utils';
import {
    createOrganigramAttr,
    createMatrix1dAttr,
    createMatrix2dAttr,
    createScaleAttr,
    createSelectAttr,
    createMultiSelectAttr,
    createGeoAttr,
} from '../AssistItem/utils';

import styles from './styles.css';

const GEOLOCATION_DEEPL_MODEL_ID = 'geolocation';

const AUTO_ENTRIES_FOR_LEAD = gql`
    query AutoEntriesForLead(
        $projectId: ID!,
        $leadId: ID!,
        $ignoreIds: [ID!],
        $isDiscarded: Boolean,
        $page: Int,
        $pageSize: Int,
    ) {
        project(id: $projectId) {
            id
            assistedTagging {
                draftEntries(
                    draftEntryTypes: AUTO,
                    lead: $leadId,
                    isDiscarded: $isDiscarded,
                    ignoreIds: $ignoreIds,
                    page: $page,
                    pageSize: $pageSize,
                ) {
                    page
                    pageSize
                    totalCount
                    results {
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
                        relatedGeoareas {
                            adminLevelLevel
                            adminLevelTitle
                            id
                            regionTitle
                            title
                            parentTitles
                        }
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
                triggerAutoDraftEntry(data: {lead: $leadId}) {
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
            lead(
                id: $leadId,
            ) {
                autoEntryExtractionStatus
            }
        }
    }
`;

const UPDATE_DRAFT_ENTRY = gql`
    mutation UpdateDraftEntry(
        $projectId: ID!,
        $draftEntryId: ID!,
        $input: UpdateDraftEntryInputType!,
    ){
        project(id: $projectId) {
            id
            assistedTagging {
                updateDraftEntry(
                    data: $input,
                    id: $draftEntryId,
                ) {
                    errors
                    ok
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

const MAX_ITEMS_PER_PAGE = 20;

const entryKeySelector = (entry: PartialEntryType) => entry.clientId;

type EntriesTabType = 'extracted' | 'discarded';

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

    const [
        selectedTab,
        setSelectedTab,
    ] = useState<EntriesTabType | undefined>('extracted');

    const [activePage, setActivePage] = useState<number>(1);

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
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const [
        geoAreaOptionsByEntryId,
        setGeoAreaOptionsByEntryId,
    ] = useState<Record<string, GeoArea[] | undefined | null> | undefined>(undefined);

    const autoEntryStatusVariables = useMemo(() => {
        if (isNotDefined(projectId)) {
            return undefined;
        }
        return ({
            leadId,
            projectId,
        });
    }, [
        leadId,
        projectId,
    ]);

    const [draftEntriesLoading, setDraftEntriesLoading] = useState<boolean>(true);

    const {
        data: autoEntryExtractionStatus,
        loading: extractionStatusLoading,
        startPolling,
        stopPolling,
    } = useQuery<AutoDraftEntriesStatusQuery, AutoDraftEntriesStatusQueryVariables>(
        AUTO_DRAFT_ENTRIES_STATUS,
        {
            skip: isNotDefined(autoEntryStatusVariables),
            variables: autoEntryStatusVariables,
            notifyOnNetworkStatusChange: true,
            onCompleted: (response) => {
                const status = response?.project
                    ?.lead?.autoEntryExtractionStatus;
                if (status === 'SUCCESS') {
                    setDraftEntriesLoading(false);
                }
            },
        },
    );

    const extractionStatus = autoEntryExtractionStatus?.project
        ?.lead?.autoEntryExtractionStatus;

    useEffect(() => {
        const extractionStatusInternal = autoEntryExtractionStatus?.project
            ?.lead?.autoEntryExtractionStatus;

        const shouldPoll = extractionStatusInternal === 'PENDING' || extractionStatusInternal === 'STARTED';
        if (shouldPoll) {
            setDraftEntriesLoading(true);
            startPolling(3_000);
        } else {
            stopPolling();
            setDraftEntriesLoading(false);
        }
    }, [
        startPolling,
        stopPolling,
        autoEntryExtractionStatus,
        leadId,
    ]);

    const [
        triggerAutoEntriesCreate,
        {
            loading: autoDraftEntriesTriggerPending,
        },
    ] = useMutation<CreateAutoDraftEntriesMutation, CreateAutoDraftEntriesMutationVariables>(
        CREATE_AUTO_DRAFT_ENTRIES,
        {
            onCompleted: (response) => {
                const autoEntriesResponse = response?.project?.assistedTagging
                    ?.triggerAutoDraftEntry;
                if (autoEntriesResponse?.ok) {
                    setDraftEntriesLoading(true);
                    startPolling(3_000);
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
        relevantEntries,
        setRelevantEntries,
    ] = useState<Record<string, boolean> | undefined>(undefined);

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
        leadId,
        isDiscarded: selectedTab === 'discarded',
        ignoreIds: createdEntries?.map((item) => item.draftEntry).filter(isDefined),
        page: activePage,
        pageSize: MAX_ITEMS_PER_PAGE,
    }), [
        createdEntries,
        projectId,
        leadId,
        selectedTab,
        activePage,
    ]);

    const {
        data: autoEntries,
        loading: autoEntriesLoading,
        refetch: retriggerAutoEntriesFetch,
    } = useQuery<AutoEntriesForLeadQuery, AutoEntriesForLeadQueryVariables>(
        AUTO_ENTRIES_FOR_LEAD,
        {
            skip: isNotDefined(extractionStatus)
                || extractionStatus !== 'SUCCESS'
                || isNotDefined(autoEntriesVariables),
            variables: autoEntriesVariables,
            // TODO: This is due to caching issue in apollo.
            notifyOnNetworkStatusChange: true,
            onCompleted: (response) => {
                const entries = response.project?.assistedTagging?.draftEntries?.results;
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
                            locations: entry.relatedGeoareas?.filter(isDefined) ?? [],
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
                        relevant: !!entryHints || !!entryRecommendations || !!entryGeoAreas,
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
                const tempRelevantEntries = listToMap(
                    transformedEntries,
                    (item) => item.entryId,
                    (item) => item.relevant,
                );
                setValue({
                    entries: requiredDraftEntries,
                });
                setAllRecommendations(entryRecommendations);
                setRelevantEntries(tempRelevantEntries);
                setAllHints(entryHints);
                setGeoAreaOptionsByEntryId(entryGeoAreas);
                setGeoAreaOptions(Object.values(entryGeoAreas).flat().filter(isDefined));
            },
        },
    );

    const handleEntryCreateButtonClick = useCallback((entryId: string) => {
        if (!allRecommendations?.[entryId]) {
            return;
        }

        const selectedEntry = value?.entries?.find((item) => item.clientId === entryId);
        if (onAssistedEntryAdd && selectedEntry) {
            const duplicateEntryCheck = createdEntries?.find(
                (entry) => entry.droppedExcerpt === selectedEntry.droppedExcerpt,
            );

            if (isDefined(duplicateEntryCheck)) {
                alert.show(
                    'Similar entry found. Failed to add entry from recommendations.',
                    {
                        variant: 'error',
                    },
                );
                return;
            }

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
                geoAreaOptionsByEntryId?.[entryId] ?? undefined,
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
        geoAreaOptionsByEntryId,
        allRecommendations,
        onAssistedEntryAdd,
        createdEntries,
    ]);

    const [
        triggerUpdateDraftEntry,
    ] = useMutation<UpdateDraftEntryMutation, UpdateDraftEntryMutationVariables>(
        UPDATE_DRAFT_ENTRY,
        {
            onCompleted: (response) => {
                const updateDraftEntryResponse = response?.project?.assistedTagging
                    ?.updateDraftEntry;
                retriggerAutoEntriesFetch();
                if (updateDraftEntryResponse?.ok) {
                    alert.show(
                        'Successfully changed the discard status.',
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to change the discard status.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to change the discard status.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleUpdateDraftEntryClick = useCallback((entryId: string | undefined) => {
        triggerUpdateDraftEntry({
            variables: {
                projectId,
                input: {
                    lead: leadId,
                    isDiscarded: true,
                },
                // FIXME: Handle this better
                draftEntryId: entryId ?? '',
            },
        });
    }, [
        triggerUpdateDraftEntry,
        leadId,
        projectId,
    ]);

    const handleUndiscardEntryClick = useCallback((entryId: string | undefined) => {
        triggerUpdateDraftEntry({
            variables: {
                projectId,
                input: {
                    lead: leadId,
                    isDiscarded: false,
                },
                // FIXME: Handle this better
                draftEntryId: entryId ?? '',
            },
        });
    }, [
        triggerUpdateDraftEntry,
        leadId,
        projectId,
    ]);

    const rendererParams = useCallback((
        entryId: string,
        datum: PartialEntryType,
    ) => {
        const onEntryCreateButtonClick = () => handleEntryCreateButtonClick(entryId);
        const index = value?.entries?.findIndex((item) => item.clientId === entryId);

        const footerActions = (selectedTab === 'extracted' ? (
            <div className={styles.footerButtons}>
                <Button
                    name={datum?.draftEntry}
                    onClick={handleUpdateDraftEntryClick}
                    title="Discard Entry"
                    variant="nlp-secondary"
                >
                    Discard Entry
                </Button>
                <Button
                    name={undefined}
                    onClick={onEntryCreateButtonClick}
                    // disabled={predictionsLoading}
                    variant="nlp-primary"
                    title="Create Entry"
                >
                    Add Entry
                </Button>
            </div>
        ) : (
            <Button
                name={datum?.draftEntry}
                onClick={handleUndiscardEntryClick}
                title="Discard Entry"
                variant="nlp-secondary"
            >
                Undiscard Entry
            </Button>
        ));

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
            geoAreaOptions,
            onGeoAreaOptionsChange: setGeoAreaOptions,
            predictionsLoading: false,
            predictionsErrored: false,
            messageText: undefined,
            variant: 'normal' as const,
            error: undefined,
            excerptShown: true,
            displayHorizontally: true,
            footerActions,
            relevant: relevantEntries?.[entryId],
        });
    }, [
        geoAreaOptions,
        relevantEntries,
        value?.entries,
        handleEntryCreateButtonClick,
        onEntryChange,
        allHints,
        allRecommendations,
        frameworkDetails,
        leadId,
        handleUpdateDraftEntryClick,
        handleUndiscardEntryClick,
        selectedTab,
    ]);

    const isPending = autoEntriesLoading
        || draftEntriesLoading
        || autoDraftEntriesTriggerPending
        || extractionStatusLoading;

    const emptyMessage = useMemo(() => {
        if (extractionStatus === 'NONE') {
            return "Looks like you've not triggered an extraction yet";
        }
        if (extractionStatus === 'SUCCESS') {
            return "Looks like there aren't any recommendations.";
        }
        if (extractionStatus === 'FAILED') {
            return "Looks like DEEP couldn't generate extractions for this source.";
        }
        if (extractionStatus === 'PENDING' || extractionStatus === 'STARTED') {
            return 'Please wait while we load the recommendations.';
        }
        return '';
    }, [extractionStatus]);

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            heading="NLP Extract & Classify"
            size="cover"
            bodyClassName={styles.modalBody}
        >
            <Tabs
                value={selectedTab}
                onChange={setSelectedTab}
            >
                {(isDefined(extractionStatus) && (extractionStatus !== 'NONE')) && (
                    <TabList className={styles.tabList}>
                        <Tab
                            name="extracted"
                        >
                            All Recommendations
                        </Tab>
                        <Tab
                            name="discarded"
                        >
                            Discarded Recommendations
                        </Tab>
                    </TabList>
                )}
                <TabPanel
                    className={styles.tabPanel}
                    activeClassName={styles.activeTabPanel}
                    name="extracted"
                >
                    <ListView
                        className={styles.list}
                        data={value?.entries}
                        keySelector={entryKeySelector}
                        renderer={AssistPopup}
                        rendererParams={rendererParams}
                        pendingMessage="Please wait while we load recommendations."
                        pending={isPending}
                        errored={false}
                        filtered={false}
                        filteredEmptyMessage="Looks like you've already added all entries from recommendations."
                        emptyMessage={emptyMessage}
                        messageActions={!isPending && (extractionStatus === 'NONE') && (
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
                </TabPanel>
                <TabPanel
                    className={styles.tabPanel}
                    activeClassName={styles.activeTabPanel}
                    name="discarded"
                >
                    <ListView
                        className={styles.list}
                        data={value?.entries}
                        keySelector={entryKeySelector}
                        renderer={AssistPopup}
                        rendererParams={rendererParams}
                        pendingMessage="Please wait while we load recommendations."
                        pending={isPending}
                        errored={false}
                        filtered={false}
                        filteredEmptyMessage="Looks like you've already added all entries from recommendations."
                        emptyMessage={emptyMessage}
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
                </TabPanel>
            </Tabs>
            <Pager
                activePage={activePage}
                itemsCount={autoEntries?.project?.assistedTagging?.draftEntries?.totalCount ?? 0}
                onActivePageChange={setActivePage}
                maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                itemsPerPageControlHidden
            />
        </Modal>
    );
}

export default AutoEntriesModal;
