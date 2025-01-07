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
import {
    ModelTagsType,
    Matrix1dValue,
    Matrix2dValue,
    SingleSelectValue,
    MultiSelectValue,
    ScaleValue,
    OrganigramValue,
} from '#types/newAnalyticalFramework';
import AssistPopup from '../AssistItem/AssistPopup';
import { createDefaultAttributes } from '../utils';
import {
    isValidObject,
    createMatrix1dAttrFromTags,
    createMatrix2dAttrFromTags,
    createSingleSelectAttrFromTags,
    createMultiSelectAttrFromTags,
    createScaleAttrFromTags,
    createOrganigramAttrFromTags,
} from '../AssistItem/utils';

import styles from './styles.css';

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
                        tags {
                            id
                            modelTags
                        }
                        geoAreas {
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
    const [recommendations, setRecommendations] = useState<
        Record<string, PartialAttributeType[]>
    >();

    const {
        allWidgets,
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

    const generateAttributesForEntry = useCallback((recommendedTags: Record<string, unknown>) => {
        const newAttributes = allWidgets?.map((widget) => {
            if (widget.widgetId === 'MATRIX1D') {
                return createMatrix1dAttrFromTags(
                    recommendedTags[widget.key] as Matrix1dValue,
                    widget,
                );
            }
            if (widget.widgetId === 'MATRIX2D') {
                return createMatrix2dAttrFromTags(
                    recommendedTags[widget.key] as Matrix2dValue,
                    widget,
                );
            }
            if (widget.widgetId === 'MULTISELECT') {
                return createMultiSelectAttrFromTags(
                    recommendedTags[widget.key] as MultiSelectValue,
                    widget,
                );
            }
            if (widget.widgetId === 'SELECT') {
                return createSingleSelectAttrFromTags(
                    recommendedTags[widget.key] as unknown as SingleSelectValue,
                    widget,
                );
            }
            if (widget.widgetId === 'SCALE') {
                return createScaleAttrFromTags(
                    recommendedTags[widget.key] as unknown as ScaleValue,
                    widget,
                );
            }
            if (widget.widgetId === 'ORGANIGRAM') {
                return createOrganigramAttrFromTags(
                    recommendedTags[widget.key] as OrganigramValue,
                    widget,
                );
            }
            return undefined;
        }).filter(isDefined);

        return newAttributes;
    }, [allWidgets]);

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
                    const modelTags = entry?.tags?.modelTags;
                    if (!isValidObject(modelTags)) {
                        return undefined;
                    }
                    const entryRecommendations = generateAttributesForEntry(
                        modelTags as ModelTagsType,
                    );

                    const entryId = randomString();
                    const requiredEntry = {
                        clientId: entryId,
                        entryType: 'EXCERPT' as const,
                        lead: leadId,
                        excerpt: entry.excerpt,
                        draftEntry: entry.id,
                        droppedExcerpt: entry.excerpt,
                        attributes: entryRecommendations,
                    };

                    return {
                        entryId,
                        entry: requiredEntry,
                        geoLocations: entry.geoAreas,
                        relevant: !!entryRecommendations,
                    };
                }).filter(isDefined);
                const requiredDraftEntries = transformedEntries?.map(
                    (draftEntry) => draftEntry.entry,
                );
                const entryRecommendations = listToMap(
                    transformedEntries,
                    (item) => item.entryId,
                    (item) => item.entry.attributes,
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
                setRecommendations(entryRecommendations);
                setRelevantEntries(tempRelevantEntries);
                setGeoAreaOptionsByEntryId(entryGeoAreas);
                setGeoAreaOptions(Object.values(entryGeoAreas).flat().filter(isDefined));
            },
        },
    );

    const handleEntryCreateButtonClick = useCallback((entryId: string) => {
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
            recommendations: recommendations?.[entryId],
            entryInputClassName: styles.entryInput,
            name: index,
            onChange: onEntryChange,
            leadId,
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
        recommendations,
        geoAreaOptions,
        relevantEntries,
        value?.entries,
        handleEntryCreateButtonClick,
        onEntryChange,
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
