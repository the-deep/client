import React, { useState, useContext, useCallback, useMemo } from 'react';
import {
    IoClose,
    IoCheckmarkCircleSharp,
    IoEllipseOutline,
    IoBarChartSharp,
    IoEyeOffOutline,
    IoEyeOutline,
    IoInformationCircleOutline,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import { useParams } from 'react-router-dom';
import {
    _cs,
    isDefined,
    isNotDefined,
    randomString,
    unique,
    compareString,
} from '@togglecorp/fujs';
import {
    Tabs,
    Tab,
    TabList,
    useBooleanState,
    TabPanel,
    Container,
    DropContainer,
    QuickActionButton,
    QuickActionConfirmButton,
    useAlert,
    Header,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    useFormObject,
    analyzeErrors,
    SetValueArg,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { gql, useMutation } from '@apollo/client';
import ProjectContext from '#base/context/ProjectContext';
import {
    AnalysisAutomaticSummaryMutation,
    AnalysisAutomaticSummaryMutationVariables,
    AnalysisGeoLocationMutation,
    AnalysisGeoLocationMutationVariables,
    AnalysisAutomaticNgramMutation,
    AnalysisAutomaticNgramMutationVariables,
    PillarAnalysisDetailsQuery,
    AttributeType as WidgetAttributeRaw,
} from '#generated/types';

import MarkdownEditor from '#components/MarkdownEditor';
import { useModalState } from '#hooks/stateManagement';
import NonFieldError from '#components/NonFieldError';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { Attributes, Listeners } from '#components/SortableList';
import { reorder, genericMemo } from '#utils/common';
import { DeepReplace } from '#utils/types';
import { WidgetAttribute as WidgetAttributeFromEntry } from '#types/newEntry';

import {
    AnalyticalStatementType,
    PartialAnalyticalEntryType,
    PartialAnalyticalStatementType,
} from '../schema';

import { Framework } from '..';
import AnalyticalEntryInput from './AnalyticalEntryInput';
import SummaryTagsModal from './StoryAnalysisModal/SummaryTagsModal';

import StoryAnalysisModal from './StoryAnalysisModal';
import styles from './styles.css';

export const ENTRIES_LIMIT = 200;

const ANALYSIS_AUTOMATIC_NGRAM = gql`
    mutation AnalysisAutomaticNgram($projectId: ID!, $entriesId: [ID!]) {
        project(id: $projectId) {
            triggerAnalysisAutomaticNgram(data: {entriesId: $entriesId}) {
                errors
                ok
                result {
                    id
                    status
                    unigrams {
                        count
                        word
                    }
                    bigrams {
                        count
                        word
                    }
                    trigrams {
                        count
                        word
                    }
                }
            }
        }
    }
`;

const ANALYSIS_GEO_LOCATION = gql`
    mutation AnalysisGeoLocation($projectId: ID!, $entriesId: [ID!]) {
        project(id: $projectId) {
            triggerAnalysisGeoLocation(data: {entriesId: $entriesId}) {
                errors
                ok
                result {
                    id
                    status
                    entryGeo {
                        data {
                            meta {
                                latitude
                                longitude
                                offsetEnd
                                offsetStart
                            }
                        }
                    }
                }
            }
        }
    }
`;

const ANALYSIS_AUTOMATIC_SUMMARY = gql`
    mutation AnalysisAutomaticSummary(
        $projectId: ID!,
        $entriesId: [ID!],
        $widgetTags: [String!],
    ) {
        project(id: $projectId) {
            triggerAnalysisAutomaticSummary(
                data: {
                    entriesId: $entriesId,
                    widgetTags: $widgetTags,
                }
            ) {
                errors
                ok
                result {
                    id
                    status
                    summary
                }
            }
        }
    }
`;

const defaultVal = (): AnalyticalStatementType => ({
    statement: '',
    order: -1,
    clientId: `auto-${randomString()}`,
    entries: [],
});

type Field = 'infogaps' | 'statement';
type Content = 'myAnalysis' | 'entries';

export interface DroppedValue {
    entryId: string;
    statementClientId?: string;
}

type EntryRaw = DeepReplace<PillarAnalysisDetailsQuery, Omit<WidgetAttributeRaw, 'widgetTypeDisplay' | 'widthTypeDisplay'>, WidgetAttributeFromEntry>;
export type EntryDetailType = NonNullable<NonNullable<NonNullable<NonNullable<NonNullable<EntryRaw['project']>['analysisPillar']>['statements']>[number]>['entries']>[number];

export interface AnalyticalStatementInputProps {
    className?: string;
    value: PartialAnalyticalStatementType;
    entriesDetail: EntryDetailType[],
    error: Error<AnalyticalStatementType> | undefined;
    onChange: (value: SetValueArg<PartialAnalyticalStatementType>, index: number) => void;
    onRemove: (index: number) => void;
    onEntryMove: (entryId: string, statementClientId: string) => void;
    onEntryDrop: (entryId: string) => void;
    index: number;
    isBeingDragged?: boolean;
    attributes?: Attributes;
    listeners?: Listeners;
    onSelectedNgramChange: (item: string | undefined) => void;
    framework: Framework;
    frameworkTagLabels: Record<string, string>;
    geoAreaOptions: GeoArea[] | undefined | null;
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onEntryDataChange: () => void;
}

function AnalyticalStatementInput(props: AnalyticalStatementInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        onEntryMove,
        onEntryDrop,
        index,
        attributes,
        listeners,
        framework,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
        entriesDetail,
        frameworkTagLabels,
    } = props;

    const {
        project,
    } = useContext(ProjectContext);
    const [prevSummaryEntryIds, setPrevSummaryEntryIds] = useState<string[]>();

    const [
        automaticSummaryTagsModalShown,
        showAutomaticSummaryTagsModal,
        hideAutomaticSummaryTagsModal,
    ] = useModalState(false);

    const [widgetTags, setWidgetTags] = useState<string[] | undefined>();

    const widgetsFromAttributes = useMemo(() => (
        entriesDetail?.flatMap((entry) => entry?.entry?.attributes)
            ?.filter(isDefined)
    ), [entriesDetail]);

    const tags = useMemo(() => (
        unique(widgetsFromAttributes?.map(
            (attribute) => {
                if (!attribute) {
                    return undefined;
                }
                if (attribute.widgetType === 'SELECT') {
                    return attribute.data?.value;
                }
                if (attribute.widgetType === 'MULTISELECT') {
                    return attribute.data?.value;
                }
                if (attribute.widgetType === 'ORGANIGRAM') {
                    return attribute.data?.value;
                }
                if (attribute.widgetType === 'MATRIX1D') {
                    const pillars = attribute.data?.value;
                    const pillarKeys = Object.keys(pillars ?? [])
                        ?.map((pillarKey) => Object.keys(pillars?.[pillarKey] ?? {}))
                        ?.flat();

                    return ([
                        ...pillarKeys,
                        ...(pillars ? Object.keys(pillars) : []),
                    ]);
                }
                if (attribute.widgetType === 'MATRIX2D') {
                    const dims = attribute.data?.value;

                    const subPillarList = Object.values(dims ?? {})
                        ?.flatMap((subPillar) => Object.values(subPillar ?? {}));

                    const pillars = Object.keys(dims ?? {});
                    const subPillars = pillars.map((key) => Object.keys(dims?.[key] ?? {})).flat();
                    const sectors = unique(subPillarList
                        .flatMap((sector) => Object.keys(sector ?? {})));
                    const subSectors = unique(subPillarList
                        .flatMap((sector) => Object.values(sector ?? {}))
                        .flat());
                    const widgetKeys = [
                        ...pillars,
                        ...subPillars,
                        ...sectors,
                        ...subSectors,
                    ];
                    return widgetKeys;
                }
                return undefined;
            },
        ).filter(isDefined).flat())
    ), [widgetsFromAttributes]);

    const allWidgetTagNames = useMemo(() => (
        tags?.map((key) => key && frameworkTagLabels?.[key]).filter(isDefined)
    ), [
        frameworkTagLabels,
        tags,
    ]);

    console.log('all tags', allWidgetTagNames);

    const [selectedField, setSelectedField] = useState<Field | undefined>('statement');
    const [selectedContent, setSelectedContent] = useState<Content | undefined>('entries');

    const alert = useAlert();

    const onFieldChange = useFormObject(index, onChange, defaultVal);
    const {
        projectId,
    } = useParams<{ projectId: string}>();

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.entries);

    const [
        moreDetailsModalShown,
        showStoryAnalysisModal,
        hideStoryAnalysisModal,
    ] = useModalState(false);

    const [
        createAnalysisAutomaticSummary,
        {
            data: analysisAutomaticSummary,
        },
    ] = useMutation<AnalysisAutomaticSummaryMutation, AnalysisAutomaticSummaryMutationVariables>(
        ANALYSIS_AUTOMATIC_SUMMARY,
        {
            onCompleted: (response) => {
                if (
                    !response
                    || !response.project?.triggerAnalysisAutomaticSummary
                ) {
                    return;
                }

                if (response.project.triggerAnalysisAutomaticSummary.errors) {
                    alert.show(
                        'There were errors when creating automatic summary.',
                        { variant: 'error' },
                    );
                }
                setPrevSummaryEntryIds(value.entries?.map((ae) => ae.entry).filter(isDefined));
            },
            onError: () => {
                alert.show(
                    'Failed to create automatic story analysis.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        createAnalysisGeoLocation,
        {
            data: analysisGeoLocation,
        },
    ] = useMutation<AnalysisGeoLocationMutation, AnalysisGeoLocationMutationVariables>(
        ANALYSIS_GEO_LOCATION,
        {
            onCompleted: (response) => {
                if (
                    !response
                    || !response.project?.triggerAnalysisGeoLocation
                ) {
                    return;
                }

                if (response.project.triggerAnalysisGeoLocation.errors) {
                    alert.show(
                        'There were errors when creating geo location.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create automatic geo location.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        createAnalysisAutomaticNgram,
        {
            data: analysisAutomaticNgram,
        },
    ] = useMutation<AnalysisAutomaticNgramMutation, AnalysisAutomaticNgramMutationVariables>(
        ANALYSIS_AUTOMATIC_NGRAM,
        {
            onCompleted: (response) => {
                if (
                    !response
                    || !response.project?.triggerAnalysisAutomaticNgram
                ) {
                    return;
                }

                if (response.project.triggerAnalysisAutomaticNgram.errors) {
                    alert.show(
                        'There were errors when creating automatic Ngram.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create automatic story analysis.',
                    { variant: 'error' },
                );
            },
        },
    );

    const triggerAutomaticStoryAnalysis = useCallback(() => {
        if (!project?.isPrivate) {
            createAnalysisAutomaticSummary({
                variables: {
                    projectId,
                    entriesId: value.entries?.map((ae) => ae.entry).filter(isDefined),
                    widgetTags: widgetTags ?? [],
                },
            });
        }
        createAnalysisGeoLocation({
            variables: {
                projectId,
                entriesId: value.entries?.map((ae) => ae.entry).filter(isDefined),
            },
        });
        createAnalysisAutomaticNgram({
            variables: {
                projectId,
                entriesId: value.entries?.map((ae) => ae.entry).filter(isDefined),
            },
        });

        showStoryAnalysisModal();
    }, [
        widgetTags,
        value.entries,
        project,
        showStoryAnalysisModal,
        projectId,
        createAnalysisAutomaticSummary,
        createAnalysisGeoLocation,
        createAnalysisAutomaticNgram,
    ]);

    const handleStoryAnalysisModalOpen = useCallback(() => {
        if (project?.isPrivate) {
            showStoryAnalysisModal();
            return;
        }
        const prevEntryIds = prevSummaryEntryIds?.sort((a, b) => compareString(a, b));
        const prevEntryIdsStringified = JSON.stringify(prevEntryIds);
        const currentEntryIds = value.entries
            ?.map((ae) => ae.entry).filter(isDefined).sort((a, b) => compareString(a, b));
        const currentEntryIdsStringified = JSON.stringify(currentEntryIds);

        if (prevEntryIdsStringified === currentEntryIdsStringified) {
            showStoryAnalysisModal();
        } else {
            setWidgetTags(allWidgetTagNames);
            showAutomaticSummaryTagsModal();
        }
    }, [
        project?.isPrivate,
        value.entries,
        showStoryAnalysisModal,
        allWidgetTagNames,
        prevSummaryEntryIds,
        showAutomaticSummaryTagsModal,
    ]);

    const handleSubmitTagsButtonClick = useCallback(() => {
        triggerAutomaticStoryAnalysis();
        hideAutomaticSummaryTagsModal();
        showStoryAnalysisModal();
    }, [
        hideAutomaticSummaryTagsModal,
        showStoryAnalysisModal,
        triggerAutomaticStoryAnalysis,
    ]);

    const handleSummaryTagsModalClose = useCallback(() => {
        hideAutomaticSummaryTagsModal();
        // hideStoryAnalysisModal();
    }, [
        // hideStoryAnalysisModal,
        hideAutomaticSummaryTagsModal,
    ]);

    const {
        // setValue: onAnalyticalEntryChange,
        removeValue: onAnalyticalEntryRemove,
    } = useFormArray('entries', onFieldChange);

    type AnalyticalEntry = typeof value.entries;

    const handleAnalyticalEntryDrop = useCallback(
        (dropValue: DroppedValue, dropOverEntryClientId?: string) => {
            onFieldChange(
                (oldEntries: AnalyticalEntry) => {
                    // NOTE: Treat moved item as a new item by removing the old one and
                    // adding the new one again
                    const movedItem = value.entries
                        ?.find((item) => item.entry === dropValue.entryId);

                    // NOTE: Don't let users add more that certain items
                    if (
                        isNotDefined(movedItem)
                        && (value?.entries?.length ?? 0) >= ENTRIES_LIMIT
                    ) {
                        return oldEntries;
                    }

                    const newAnalyticalEntries = [...(oldEntries ?? [])];

                    const clientId = randomString();
                    let newAnalyticalEntry: PartialAnalyticalEntryType = {
                        clientId,
                        entry: dropValue.entryId,
                        order: value.order ?? 1,
                    };

                    if (value.entries && isDefined(movedItem)) {
                        newAnalyticalEntry = {
                            ...movedItem,
                            order: value.order ?? 1,
                        };
                        const movedItemOldIndex = value.entries
                            .findIndex((item) => item.entry === dropValue.entryId);
                        newAnalyticalEntries.splice(movedItemOldIndex, 1);
                    }

                    if (dropOverEntryClientId) {
                        const currentIndex = newAnalyticalEntries
                            .findIndex((v) => v.clientId === dropOverEntryClientId);
                        newAnalyticalEntries.splice(currentIndex, 0, newAnalyticalEntry);
                    } else {
                        newAnalyticalEntries.push(newAnalyticalEntry);
                    }

                    // NOTE: After the newly added entry's order is set and
                    // placed in the desired index, we can change the order of
                    // whole list in bulk

                    return reorder(newAnalyticalEntries);
                },
                'entries' as const,
            );
            if (
                isDefined(dropValue.statementClientId)
                && (dropValue.statementClientId !== value.clientId)
            ) {
                // NOTE: Remove entry from old statement if it was moved from
                // one statement to another statement
                onEntryMove(dropValue.entryId, dropValue.statementClientId);
            }
            onEntryDrop(dropValue.entryId);
        },
        [
            onEntryDrop, onFieldChange, onEntryMove,
            value.entries, value.order, value.clientId,
        ],
    );

    const handleAnalyticalEntryUp = useCallback(
        (dropOverEntryClientId?: string) => (
            onFieldChange(
                (oldEntries: AnalyticalEntry) => {
                    const { entries } = value;
                    const fromIndex = entries?.findIndex(
                        (entry) => entry.clientId === dropOverEntryClientId,
                    );
                    if (isNotDefined(fromIndex)) {
                        return oldEntries;
                    }

                    const modifyingEntries = [...(oldEntries ?? [])];
                    const element = modifyingEntries[fromIndex];
                    const toIndex = fromIndex - 1;
                    modifyingEntries.splice(fromIndex, 1);
                    modifyingEntries.splice(toIndex, 0, element);

                    return modifyingEntries;
                },
                'entries' as const,
            )), [value, onFieldChange],
    );

    const handleAnalyticalEntryDown = useCallback(
        (dropOverEntryClientId?: string) => (
            onFieldChange(
                (oldEntries: AnalyticalEntry) => {
                    const { entries } = value;
                    const fromIndex = entries?.findIndex(
                        (entry) => entry.clientId === dropOverEntryClientId,
                    );
                    if (isNotDefined(fromIndex)) {
                        return oldEntries;
                    }

                    const modifyingEntries = [...(oldEntries ?? [])];
                    const element = modifyingEntries[fromIndex];
                    const toIndex = fromIndex + 1;
                    modifyingEntries.splice(fromIndex, 1);
                    modifyingEntries.splice(toIndex, 0, element);

                    return reorder(modifyingEntries);
                },
                'entries' as const,
            )), [value, onFieldChange],
    );

    const handleAnalyticalEntryAdd = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { entryId: string, statementClientId: string };
            handleAnalyticalEntryDrop(typedVal);
        },
        [handleAnalyticalEntryDrop],
    );

    const handleIncludeInReportChange = useCallback(() => {
        onFieldChange((oldVal?: boolean) => !oldVal, 'includeInReport' as const);
    }, [onFieldChange]);

    const handleStatementChange = useCallback((newStatementVal: string | undefined) => {
        onFieldChange(newStatementVal, 'statement');
    }, [onFieldChange]);

    const handleInfoGapsChange = useCallback((newVal: string | undefined) => {
        onFieldChange(newVal, 'informationGaps');
    }, [onFieldChange]);

    const handleReportTextChange = useCallback((newVal: string | undefined) => {
        onFieldChange(newVal, 'reportText');
    }, [onFieldChange]);

    const handleDeleteAnalyticalStatement = useCallback(() => {
        onRemove(index);
    }, [index, onRemove]);

    const [
        statementAndInfoGapsShown,
        , , ,
        toggleStatementAndInfoGaps,
    ] = useBooleanState(true);

    const isErrored = useMemo(() => analyzeErrors(error), [error]);

    return (
        <Tabs
            value={selectedField}
            onChange={setSelectedField}
            variant="primary"
        >
            <Container
                className={_cs(
                    styles.analyticalStatementInput,
                    className,
                    isErrored && styles.errored,
                )}
                contentClassName={styles.dragContent}
                headerClassName={styles.header}
                headerIcons={(
                    <>
                        <QuickActionButton
                            title="Include in report"
                            name="includeInReport"
                            onClick={handleIncludeInReportChange}
                            big
                        >
                            {(value.includeInReport
                                ? <IoCheckmarkCircleSharp />
                                : <IoEllipseOutline />
                            )}
                        </QuickActionButton>
                        <QuickActionButton
                            title="View Story Analysis"
                            name="viewStoryAnalysis"
                            onClick={handleStoryAnalysisModalOpen}
                            disabled={(value.entries?.length ?? 0) <= 0}
                            big
                        >
                            <IoBarChartSharp />
                        </QuickActionButton>
                        {statementAndInfoGapsShown && (
                            <TabList>
                                <Tab
                                    className={styles.tab}
                                    name="statement"
                                    transparentBorder
                                >
                                    Statement
                                </Tab>
                                <Tab
                                    className={styles.tab}
                                    name="infogaps"
                                    transparentBorder
                                >
                                    Info Gaps
                                </Tab>
                            </TabList>
                        )}
                    </>
                )}
                headerActions={(
                    <>
                        <QuickActionButton
                            title="Show/hide statement and info gaps"
                            name={undefined}
                            onClick={toggleStatementAndInfoGaps}
                        >
                            {statementAndInfoGapsShown ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </QuickActionButton>
                        <QuickActionConfirmButton
                            name={index}
                            onConfirm={handleDeleteAnalyticalStatement}
                            message="Are you sure you want to delete this analytical statement?"
                            showConfirmationInitially={false}
                            // FIXME: use translation
                            title="Remove Analytical Statement"
                        >
                            <IoClose />
                        </QuickActionConfirmButton>
                        <QuickActionButton
                            name={index}
                            // FIXME: use translation
                            title="Drag"
                            {...attributes}
                            {...listeners}
                        >
                            <GrDrag />
                        </QuickActionButton>
                    </>
                )}
                headerDescriptionClassName={styles.headerDescription}
                headerDescription={(
                    <>
                        {isDefined(value.title) && (
                            <Header
                                heading={value.title}
                                headingSize="extraSmall"
                                spacing="none"
                                headingClassName={styles.clusterHeading}
                                headingSectionClassName={styles.clusterHeadingSection}
                                icons={(
                                    <IoInformationCircleOutline
                                        className={styles.clusterInfoIcon}
                                        title="This NLP model generated short topic generalizes the entries contained within this cluster."
                                    />
                                )}
                            />
                        )}
                        <NonFieldError error={error} />
                        {statementAndInfoGapsShown && (
                            <>
                                <TabPanel name="statement">
                                    <MarkdownEditor
                                        className={styles.statement}
                                        placeholder="Enter analytical statement"
                                        name="statement"
                                        height={150}
                                        value={value.statement}
                                        onChange={onFieldChange}
                                        error={error?.statement}
                                    />
                                </TabPanel>
                                <TabPanel name="infogaps">
                                    <MarkdownEditor
                                        className={styles.statement}
                                        placeholder="Enter info gaps"
                                        name="informationGaps"
                                        height={150}
                                        value={value.informationGaps}
                                        onChange={onFieldChange}
                                        error={error?.informationGaps}
                                    />
                                </TabPanel>
                            </>
                        )}
                    </>
                )}
            >
                <Tabs
                    value={selectedContent}
                    onChange={setSelectedContent}
                    variant="primary"
                >
                    <TabList className={styles.contentTabs}>
                        <Tab
                            className={styles.tab}
                            name="entries"
                            transparentBorder
                        >
                            Entries
                        </Tab>
                        <Tab
                            className={styles.tab}
                            name="myAnalysis"
                            transparentBorder
                        >
                            My Analysis
                        </Tab>
                    </TabList>
                    <TabPanel
                        activeClassName={styles.myAnalysisTab}
                        name="myAnalysis"
                    >
                        <MarkdownEditor
                            className={styles.statement}
                            placeholder="My analysis"
                            name="reportText"
                            height={400}
                            value={value.reportText}
                            onChange={onFieldChange}
                            error={error?.reportText}
                        />
                    </TabPanel>
                    <TabPanel
                        name="entries"
                        activeClassName={styles.entriesList}
                    >
                        <div className={styles.entryContainer}>
                            {value.entries?.map((analyticalEntry, myIndex) => (
                                <AnalyticalEntryInput
                                    key={analyticalEntry.clientId}
                                    index={myIndex}
                                    statementClientId={value.clientId}
                                    value={analyticalEntry}
                                    projectId={projectId}
                                    entryUpButtonDisable={myIndex === 0}
                                    entryDownButtonDisable={value.entries?.length === myIndex + 1}
                                    // onChange={onAnalyticalEntryChange}
                                    onRemove={onAnalyticalEntryRemove}
                                    error={(
                                        analyticalEntry.clientId
                                            ? arrayError?.[analyticalEntry.clientId] : undefined
                                    )}
                                    onAnalyticalEntryDrop={handleAnalyticalEntryDrop}
                                    onAnalyticalEntryUp={handleAnalyticalEntryUp}
                                    onAnalyticalEntryDown={handleAnalyticalEntryDown}
                                    framework={framework}
                                    geoAreaOptions={geoAreaOptions}
                                    setGeoAreaOptions={setGeoAreaOptions}
                                    onEntryDataChange={onEntryDataChange}
                                />
                            ))}
                        </div>
                        <DropContainer
                            className={styles.dropContainer}
                            name="entry"
                            draggedOverClassName={styles.draggedOver}
                            onDrop={handleAnalyticalEntryAdd}
                        />
                    </TabPanel>
                </Tabs>
                {moreDetailsModalShown && (
                    <StoryAnalysisModal
                        onModalClose={hideStoryAnalysisModal}
                        analyticalStatement={value.statement}
                        reportText={value.reportText}
                        informationGaps={value.informationGaps}
                        onStatementChange={handleStatementChange}
                        onReportTextChange={handleReportTextChange}
                        onInfoGapsChange={handleInfoGapsChange}
                        statementId={value.clientId}
                        analyticalEntries={value.entries}
                        projectId={projectId}
                        automaticSummaryId={analysisAutomaticSummary
                            ?.project?.triggerAnalysisAutomaticSummary?.result?.id}
                        automaticNgramsId={analysisAutomaticNgram
                            ?.project?.triggerAnalysisAutomaticNgram?.result?.id}
                        automaticNlpMapId={analysisGeoLocation
                            ?.project?.triggerAnalysisGeoLocation?.result?.id}
                        onRemove={onAnalyticalEntryRemove}
                        index={index}
                        framework={framework}
                        geoAreaOptions={geoAreaOptions}
                        setGeoAreaOptions={setGeoAreaOptions}
                        onEntryDataChange={onEntryDataChange}
                    />
                )}
            </Container>
            {automaticSummaryTagsModalShown && (
                <SummaryTagsModal
                    onCloseButtonClick={handleSummaryTagsModalClose}
                    widgetTags={widgetTags ?? []}
                    setWidgetTags={setWidgetTags}
                    // TODO: Fix this after the mutation triggers have been separated
                    handleSubmitButtonClick={handleSubmitTagsButtonClick}
                />
            )}
        </Tabs>
    );
}

export default genericMemo(AnalyticalStatementInput);
