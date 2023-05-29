import React, { useState, useCallback } from 'react';
import {
    IoClose,
    IoCheckmarkCircleSharp,
    IoEllipseOutline,
    IoBarChartSharp,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import { useParams } from 'react-router-dom';

import {
    _cs,
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    Tabs,
    Tab,
    TabList,
    TabPanel,
    Container,
    DropContainer,
    QuickActionButton,
    QuickActionConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    useFormObject,
    SetValueArg,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { gql, useMutation } from '@apollo/client';
import {
    AutomaticStoryAnalysisMutation,
    AutomaticStoryAnalysisMutationVariables,
} from '#generated/types';

import MarkdownEditor from '#components/MarkdownEditor';
import { useModalState } from '#hooks/stateManagement';
import NonFieldError from '#components/NonFieldError';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { Attributes, Listeners } from '#components/SortableList';
import { reorder, genericMemo } from '#utils/common';

import {
    AnalyticalStatementType,
    PartialAnalyticalEntryType,
    PartialAnalyticalStatementType,
} from '../schema';

import { Framework } from '..';
import AnalyticalEntryInput from './AnalyticalEntryInput';

import StoryAnalysisModal from './StoryAnalysisModal';
import styles from './styles.css';

export const ENTRIES_LIMIT = 200;

const AUTOMATIC_STORY_ANALYSIS = gql`
    mutation AutomaticStoryAnalysis($projectId: ID!, $entriesId: [ID!]) {
        project(id: $projectId) {
            triggerAnalysisGeoLocation(data: {entriesId: $entriesId}) {
                errors
                ok
                result {
                    id
                    status
                    entryGeo {
                        data {
                            geoids {
                                countrycode
                                featurecode
                                geonameid
                                latitude
                                longitude
                                match
                            }
                        }
                    }
                }
            }
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
            triggerAnalysisAutomaticSummary(data: {entriesId: $entriesId}) {
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

type Field = 'infogaps' | 'myAnalysis' | 'statement';

export interface DroppedValue {
    entryId: string;
    statementClientId?: string;
}

export interface AnalyticalStatementInputProps {
    className?: string;
    value: PartialAnalyticalStatementType;
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
    } = props;

    const [selectedField, setSelectedField] = useState<Field | undefined>('statement');

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
        createAutomaticStoryAnalysis,
        {
            data: automaticStoryAnalysis,
        },
    ] = useMutation<AutomaticStoryAnalysisMutation, AutomaticStoryAnalysisMutationVariables>(
        AUTOMATIC_STORY_ANALYSIS,
        {
            onCompleted: (response) => {
                if (
                    !response
                    || !response.project?.triggerAnalysisAutomaticNgram
                    || !response.project?.triggerAnalysisAutomaticSummary
                    || !response.project?.triggerAnalysisGeoLocation
                ) {
                    return;
                }

                if (response.project.triggerAnalysisAutomaticSummary.errors) {
                    alert.show(
                        'There were errors when creating automatic summary.',
                        { variant: 'error' },
                    );
                }
                if (response.project.triggerAnalysisAutomaticNgram.errors) {
                    alert.show(
                        'There were errors when creating automatic Ngram.',
                        { variant: 'error' },
                    );
                }
                if (response.project.triggerAnalysisGeoLocation.errors) {
                    alert.show(
                        'There were errors when extracting geo locations.',
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

    const handleStoryAnalysisModalOpen = useCallback(() => {
        createAutomaticStoryAnalysis({
            variables: {
                projectId,
                entriesId: value.entries?.map((ae) => ae.entry).filter(isDefined),
            },
        });
        showStoryAnalysisModal();
    }, [value.entries, showStoryAnalysisModal, projectId, createAutomaticStoryAnalysis]);

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

    return (
        <Container
            className={_cs(styles.analyticalStatementInput, className)}
            contentClassName={styles.dragContent}
            headerClassName={styles.header}
            headerDescriptionClassName={styles.headerDescription}
            headerDescription={(
                <>
                    <NonFieldError error={error} />
                    <Tabs
                        value={selectedField}
                        onChange={setSelectedField}
                        variant="primary"
                    >
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
                            <Tab
                                className={styles.tab}
                                name="myAnalysis"
                                transparentBorder
                            >
                                My Analysis
                            </Tab>
                        </TabList>
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
                        <TabPanel name="myAnalysis">
                            <MarkdownEditor
                                className={styles.statement}
                                placeholder="My analysis"
                                name="reportText"
                                height={150}
                                value={value.reportText}
                                onChange={onFieldChange}
                                error={error?.reportText}
                            />
                        </TabPanel>
                    </Tabs>
                </>
            )}
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
                </>
            )}
            // actionsContainerClassName={styles.actionsContainer}
            headerActions={(
                <>
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
        >
            <div className={styles.entryContainer}>
                {value.entries?.map((analyticalEntry, myIndex) => (
                    <AnalyticalEntryInput
                        key={analyticalEntry.clientId}
                        index={myIndex}
                        statementClientId={value.clientId}
                        value={analyticalEntry}
                        projectId={projectId}
                        // onChange={onAnalyticalEntryChange}
                        onRemove={onAnalyticalEntryRemove}
                        error={(
                            analyticalEntry.clientId
                                ? arrayError?.[analyticalEntry.clientId] : undefined
                        )}
                        onAnalyticalEntryDrop={handleAnalyticalEntryDrop}
                        framework={framework}
                        geoAreaOptions={geoAreaOptions}
                        setGeoAreaOptions={setGeoAreaOptions}
                        onEntryDataChange={onEntryDataChange}
                    />
                ))}
            </div>
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
                    automaticSummaryId={automaticStoryAnalysis
                        ?.project?.triggerAnalysisAutomaticSummary?.result?.id}
                    automaticNgramsId={automaticStoryAnalysis
                        ?.project?.triggerAnalysisAutomaticNgram?.result?.id}
                    automaticNlpMapId={automaticStoryAnalysis
                        ?.project?.triggerAnalysisGeoLocation?.result?.id}
                    onRemove={onAnalyticalEntryRemove}
                    index={index}
                    framework={framework}
                    geoAreaOptions={geoAreaOptions}
                    setGeoAreaOptions={setGeoAreaOptions}
                    onEntryDataChange={onEntryDataChange}
                />
            )}
            <DropContainer
                className={styles.dropContainer}
                name="entry"
                draggedOverClassName={styles.draggedOver}
                onDrop={handleAnalyticalEntryAdd}
            />
        </Container>
    );
}

export default genericMemo(AnalyticalStatementInput);
