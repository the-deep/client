import React, {
    useState,
    useCallback,
    useContext,
    useMemo,
    useEffect,
} from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    Button,
    CollapsibleContainer,
    Container,
    ListView,
    Modal,
    QuickActionButton,
    QuickActionConfirmButton,
    SegmentInput,
    Svg,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TextInput,
    Tooltip,
    useConfirmation,
} from '@the-deep/deep-ui';
import {
    isDefined,
    encodeDate,
    _cs,
    unique,
    listToGroupList,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    IoChevronForward,
    IoChevronBackOutline,
    IoInformation,
} from 'react-icons/io5';
import { VscServerProcess } from 'react-icons/vsc';
import WordTree from '#components/WordTree';
import MarkdownEditor from '#components/MarkdownEditor';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import ProjectContext from '#base/context/ProjectContext';

import {
    AnalyticalInformationSummaryQuery,
    AnalyticalInformationSummaryQueryVariables,
} from '#generated/types';
import brainIcon from '#resources/img/brain.svg';
import EntryCard from './EntryCard';
import EntryContext from '../../context';
import Summary from './Summary';
import NlpMap from './Map';
import Ngrams from './Ngrams';
import Stats from './Stats';

import {
    PartialAnalyticalStatementType,
} from '../../schema';
import { Entry, Framework } from '../..';

import styles from './styles.css';

const entryKeySelector = (item: Entry) => item.id;

type TabType = 'map' | 'nGrams' | 'context' | 'summary';

interface KeyLabel {
    key: 'originalEntries' | 'reportText';
    label: string;
}

const sourceOptions: KeyLabel[] = [
    {
        key: 'originalEntries',
        label: 'Original Entries',
    },
    {
        key: 'reportText',
        label: 'Analysis',
    },
];

const ANALYTICAL_INFORMATION_SUMMARY = gql`
query AnalyticalInformationSummary($projectId: ID!, $summaryId: ID!) {
    project(id: $projectId) {
        id
        analysisAutomaticSummary(id: $summaryId) {
            id
            status
            informationGap
            analyticalStatement
            summary
        }
    }
}
`;

const keySelector = (d: KeyLabel) => d.key;
const labelSelector = (d: KeyLabel) => d.label;

function generateReportText(entry: Entry) {
    const authors = entry.lead.authors
        ?.map((author) => organizationTitleSelector(author)).join(', ');
    const publisher = entry.lead.source ? organizationTitleSelector(entry.lead.source) : '';
    const organizations = (authors?.length ?? 0) > 0 ? authors : publisher;
    const entryText = entry.excerpt.replace(/[.,\s]*$/, ' ');

    const url = entry.lead.url.length > 0 ? entry.lead.url : entry.lead.shareViewUrl;

    if (!entry.lead.publishedOn) {
        return `${entryText}([${organizations}](${url})).`;
    }

    const entryCreatedDate = new Date(entry.lead.publishedOn);

    return `${entryText}([${organizations}](${url}), ${encodeDate(entryCreatedDate)}).`;
}

interface Props {
    analyticalEntries: PartialAnalyticalStatementType['entries'];
    onModalClose: () => void,
    statementId: string | undefined;
    projectId: string;
    automaticNgramsId: string | undefined;
    automaticSummaryId: string | undefined;
    automaticNlpMapId: string | undefined;
    onRemove: (index: number) => void;
    index: number;
    framework: Framework;
    geoAreaOptions: GeoArea[] | undefined | null;
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onEntryDataChange: () => void;
    onStatementChange: (newVal: string | undefined) => void;
    onReportTextChange: (newVal: string | undefined) => void;
    onInfoGapsChange: (newVal: string | undefined) => void;
    analyticalStatement: string | undefined;
    reportText: string | undefined;
    informationGaps: string | undefined;
}

function StoryAnalysisModal(props: Props) {
    const {
        analyticalEntries,
        onModalClose,
        onStatementChange,
        statementId,
        projectId,
        automaticNgramsId,
        automaticSummaryId,
        automaticNlpMapId,
        onRemove,
        index,
        framework,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
        onReportTextChange,
        onInfoGapsChange,
        analyticalStatement: analyticalStatementFromProps,
        reportText: reportTextFromProps,
        informationGaps: informationGapsFromProps,
    } = props;

    const {
        project,
    } = useContext(ProjectContext);
    const { entries } = useContext(EntryContext);
    const { organizationTypeOptions } = useContext(SourcesFilterContext);

    const [pristine, setPristine] = useState(true);
    const [tab, setTab] = useState<TabType | undefined>('map');
    const [informationGaps, setInformationGaps] = useState<string | undefined>(
        informationGapsFromProps,
    );
    const [analyticalStatement, setAnalyticalStatement] = useState<string | undefined>(
        analyticalStatementFromProps,
    );
    const [reportText, setReportText] = useState<string | undefined>(reportTextFromProps);
    const [sourceOption, setSourceOption] = useState<KeyLabel['key']>('originalEntries');
    const [word, setWord] = useState<string>();
    const [rootWord, setRootWord] = useState<string>();

    const handleSave = useCallback(() => {
        onStatementChange(analyticalStatement);
        onReportTextChange(reportText);
        onInfoGapsChange(informationGaps);
        setPristine(true);
    }, [
        onStatementChange,
        onReportTextChange,
        onInfoGapsChange,
        analyticalStatement,
        reportText,
        informationGaps,
    ]);

    const originalEntries = useMemo(() => (
        analyticalEntries?.map(
            (ae) => (ae.entry ? entries?.[ae.entry] : undefined),
        ).filter(isDefined) ?? []
    ), [entries, analyticalEntries]);

    const entriesRendererParams = useCallback((_: string, data: Entry) => ({
        className: styles.entry,
        entry: data,
        projectId,
        onRemove,
        index,
        framework,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
        entryAttachment: data.entryAttachment,
    }), [
        projectId,
        index,
        onRemove,
        framework,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
    ]);

    const handleGenerateReportText = useCallback(() => {
        if (pristine) {
            setPristine(false);
        }
        const report = originalEntries.map((entry) => generateReportText(entry)).join('\n\n');
        setReportText(report);
    }, [originalEntries, pristine]);

    const handleAnalyticalStatementChange = useCallback((newValue: string | undefined) => {
        if (pristine) {
            setPristine(false);
        }
        setAnalyticalStatement(newValue);
    }, [pristine]);

    const handleInformationGapChange = useCallback((newValue: string | undefined) => {
        if (pristine) {
            setPristine(false);
        }
        setInformationGaps(newValue);
    }, [pristine]);

    const handleReportTextChange = useCallback((newValue: string | undefined) => {
        if (pristine) {
            setPristine(false);
        }
        if (sourceOption === 'reportText') {
            setSourceOption('originalEntries');
        }
        setReportText(newValue);
    }, [pristine, sourceOption]);

    const handleDrawChart = useCallback(() => {
        setRootWord(word);
    }, [word]);

    const handleSourceOptionChange = useCallback((option: KeyLabel['key']) => {
        setSourceOption(option);
        setWord(undefined);
        setRootWord(undefined);
    }, []);

    const handleWordSelect = useCallback((selectedWord: string) => {
        setWord(selectedWord);
        setRootWord(selectedWord);
    }, []);

    const generateReportTextDisabled = (reportText?.trim().length ?? 0) > 0;

    const originalEntriesText = useMemo(() => (
        originalEntries.map((entry) => entry.excerpt).join(' ')
    ), [originalEntries]);

    const sourceText = useMemo(() => {
        if (sourceOption === 'originalEntries') {
            return originalEntriesText;
        }
        return reportText ?? '';
    }, [sourceOption, originalEntriesText, reportText]);

    const organizationTypes = useMemo(() => {
        const uniqueAuthors = unique(
            originalEntries.flatMap(
                (entry) => entry?.lead?.authors?.filter(isDefined),
            )?.filter(isDefined),
            (d) => d.id,
        );

        const groupedAuthorsByOrganizationType = listToGroupList(
            uniqueAuthors.filter((a) => isDefined(a.organizationType?.id)),
            (author) => author?.organizationType?.id ?? 'none',
        );

        return (organizationTypeOptions ?? []).map((organizationType) => ({
            ...organizationType,
            count: groupedAuthorsByOrganizationType[organizationType.id]?.length ?? 0,
        }));
    }, [originalEntries, organizationTypeOptions]);

    const stats = useMemo(() => {
        const entriesInReport = reportText
            ?.match(/\(https?:\/\/[^ ]*\)/gmi)
            ?.filter(isDefined);

        const sourcesUsed = unique(entriesInReport ?? []).length;
        const totalSources = unique(originalEntries.map((entry) => entry.lead.id)).length;
        const entriesUsed = entriesInReport?.length ?? 0;
        const totalEntries = originalEntries.length ?? 0;

        /* INFO: Adding sources or entries that are different from the original sources or entries
         * is possible while editing report text. If this is the case, the total sources / total
         * entries count may be higher than the sources used / entries used count. We put a ceiling
         * to the sources used / entries used values to total sources / total entries.
         */
        return {
            sourcesUsed: sourcesUsed > totalSources ? totalSources : sourcesUsed,
            totalSources,
            entriesUsed: entriesUsed > totalEntries ? totalEntries : entriesUsed,
            totalEntries,
        };
    }, [
        reportText,
        originalEntries,
    ]);

    const [
        modal,
        handleCloseClick,
    ] = useConfirmation<undefined>({
        showConfirmationInitially: false,
        onConfirm: onModalClose,
        message: 'Looks like there are some changes that have not been saved yet. Are you sure you want to close?',
    });

    const variables = useMemo(() => (
        isDefined(automaticSummaryId)
            ? {
                projectId,
                summaryId: automaticSummaryId,
            }
            : undefined
    ), [projectId, automaticSummaryId]);

    const {
        data,
        loading,
        startPolling,
        stopPolling,
        error,
    } = useQuery<AnalyticalInformationSummaryQuery, AnalyticalInformationSummaryQueryVariables>(
        ANALYTICAL_INFORMATION_SUMMARY,
        {
            skip: !automaticSummaryId,
            variables,
        },
    );

    const informationGapOnClick = useCallback(() => {
        if (pristine) {
            setPristine(false);
        }
        const informationGapResponse = data?.project?.analysisAutomaticSummary?.informationGap;
        setInformationGaps(informationGapResponse);
    }, [pristine, data?.project?.analysisAutomaticSummary]);

    const analyticalStatementOnClick = useCallback(() => {
        if (pristine) {
            setPristine(false);
        }
        const analyticalStatementResponse = data
            ?.project?.analysisAutomaticSummary?.analyticalStatement;
        setAnalyticalStatement(analyticalStatementResponse);
    }, [pristine, data?.project?.analysisAutomaticSummary]);

    const myAnalysisOnClick = useCallback(() => {
        if (pristine) {
            setPristine(false);
        }
        const entriesText = originalEntries.map(
            (entry) => entry.excerpt,
        ).filter(isTruthyString).join('\n \n');

        const summaryResponse = data?.project?.analysisAutomaticSummary?.summary;

        const summaryText = summaryResponse
            ? `${summaryResponse} \n \n`
            : '';

        const informationGapText = informationGaps
            ? `${informationGaps} \n \n`
            : '';

        const analyticalStatementText = analyticalStatement
            ? `${analyticalStatement} \n \n`
            : '';

        const myAnalysis = analyticalStatementText + summaryText + informationGapText + entriesText;
        setReportText(myAnalysis);
    }, [pristine, informationGaps, analyticalStatement, originalEntries,
        data?.project?.analysisAutomaticSummary]);

    useEffect(
        () => {
            const shouldPoll = data?.project?.analysisAutomaticSummary?.status === 'PENDING'
                || data?.project?.analysisAutomaticSummary?.status === 'STARTED';

            if (shouldPoll) {
                startPolling(5000);
            } else {
                stopPolling();
            }
            return (() => {
                stopPolling();
            });
        },
        [
            data?.project?.analysisAutomaticSummary,
            startPolling,
            stopPolling,
        ],
    );

    const pending = loading
        || data?.project?.analysisAutomaticSummary?.status === 'STARTED'
        || data?.project?.analysisAutomaticSummary?.status === 'PENDING';

    return (
        <>
            <Modal
                className={styles.storyAnalysisModal}
                heading="Story Analysis"
                onCloseButtonClick={pristine ? onModalClose : handleCloseClick}
                size="cover"
                bodyClassName={styles.modalBody}
                headerActions={(
                    <Button
                        name={statementId}
                        disabled={pristine}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                )}
            >
                <CollapsibleContainer
                    className={styles.leftPanel}
                    expandButtonClassName={styles.expandChartsButton}
                    collapseButtonClassName={styles.collapseChartsButton}
                    expandButtonContent={(
                        <div className={styles.buttonText}>
                            Show Charts
                            <IoChevronBackOutline />
                        </div>
                    )}
                    contentClassName={styles.content}
                >
                    <Stats
                        className={styles.stats}
                        diversityChartData={organizationTypes}
                        sourcesUsed={stats.sourcesUsed}
                        totalSources={stats.totalSources}
                        entriesUsed={stats.entriesUsed}
                        totalEntries={stats.totalEntries}
                    />
                    <Tabs
                        value={tab}
                        onChange={setTab}
                        variant="primary"
                    >
                        <Container
                            className={styles.visualization}
                            spacing="none"
                            headingSize="medium"
                            headerClassName={styles.header}
                            heading={(
                                <TabList>
                                    <Tab
                                        className={styles.tab}
                                        name="map"
                                        transparentBorder
                                    >
                                        Map
                                    </Tab>
                                    <Tab
                                        className={styles.tab}
                                        name="nGrams"
                                        transparentBorder
                                    >
                                        N-grams
                                    </Tab>
                                    <Tab
                                        className={styles.tab}
                                        name="context"
                                        transparentBorder
                                    >
                                        Context
                                    </Tab>
                                    <Tab
                                        className={styles.tab}
                                        name="summary"
                                        transparentBorder
                                        disabled={project?.isPrivate}
                                    >
                                        Automatic Summary
                                    </Tab>
                                    {project?.isPrivate && (
                                        <div className={styles.info}>
                                            <IoInformation />
                                            <Tooltip>
                                                Automatic summary is not available
                                                for private projects to
                                                maintain document privacy.
                                            </Tooltip>
                                        </div>
                                    )}
                                </TabList>
                            )}
                            contentClassName={styles.tabPanelContainer}
                        >
                            <TabPanel name="map" className={styles.tabPanel}>
                                <NlpMap
                                    projectId={projectId}
                                    nlpMapId={automaticNlpMapId}
                                />
                            </TabPanel>
                            <TabPanel name="nGrams" className={styles.tabPanel}>
                                <Ngrams
                                    projectId={projectId}
                                    ngramsId={automaticNgramsId}
                                />
                            </TabPanel>
                            <TabPanel name="context" className={styles.tabPanel}>
                                <div className={styles.contextActions}>
                                    <SegmentInput
                                        name="context"
                                        value={sourceOption}
                                        onChange={handleSourceOptionChange}
                                        options={sourceOptions}
                                        keySelector={keySelector}
                                        labelSelector={labelSelector}
                                    />
                                    <TextInput
                                        name="word"
                                        value={word}
                                        placeholder="Key word"
                                        onChange={setWord}
                                        actions={(
                                            <QuickActionButton
                                                name="drawChart"
                                                variant="secondary"
                                                onClick={handleDrawChart}
                                                title="Set key word"
                                            >
                                                <IoChevronForward />
                                            </QuickActionButton>
                                        )}
                                    />
                                </div>
                                <div className={styles.wordTreeContainer}>
                                    <WordTree
                                        text={sourceText}
                                        rootWord={rootWord}
                                        onWordClick={handleWordSelect}
                                    />
                                </div>
                            </TabPanel>
                            <TabPanel
                                name="summary"
                                className={styles.tabPanel}
                            >
                                <Summary
                                    error={error}
                                    summaryData={data}
                                />
                            </TabPanel>
                        </Container>
                    </Tabs>
                </CollapsibleContainer>
                <div className={styles.right}>
                    <div className={styles.cardContainer}>
                        <div className={styles.markdownContainer}>
                            <MarkdownEditor
                                className={styles.editor}
                                labelContainerClassName={styles.labelContainer}
                                label={(
                                    <>
                                        <div>
                                            Information Gap
                                        </div>
                                        <div className={styles.labelContainerAction}>
                                            <QuickActionConfirmButton
                                                name={undefined}
                                                title="Auto generate information gap using NLP"
                                                message="You are about to auto generate information gap using NLP. This will replace the current information gap. Are you sure you want to continue?"
                                                onConfirm={informationGapOnClick}
                                                disabled={project?.isPrivate || pending}
                                                variant="nlp-primary"
                                            >
                                                <Svg
                                                    className={styles.brainIcon}
                                                    src={brainIcon}
                                                />
                                            </QuickActionConfirmButton>
                                            {project?.isPrivate && (
                                                <div className={styles.info}>
                                                    <IoInformation />
                                                    <Tooltip>
                                                        Auto generate is not available
                                                        for private projects to
                                                        maintain document privacy.
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                name="informationGap"
                                value={informationGaps}
                                onChange={handleInformationGapChange}
                            />
                        </div>
                        <div className={styles.entriesContainer}>
                            <div className={styles.actions}>
                                <div className={styles.title}>Original Entries</div>
                                <QuickActionButton
                                    name={undefined}
                                    onClick={handleGenerateReportText}
                                    disabled={generateReportTextDisabled}
                                    spacing="compact"
                                    variant="tertiary"
                                    title="Generate analysis"
                                >
                                    <VscServerProcess />
                                </QuickActionButton>
                            </div>
                            <ListView
                                className={styles.entries}
                                data={originalEntries}
                                keySelector={entryKeySelector}
                                renderer={EntryCard}
                                rendererParams={entriesRendererParams}
                                filtered={false}
                                errored={false}
                                pending={false}
                            />
                        </div>
                    </div>
                    <div className={styles.cardContainer}>
                        <div className={styles.markdownContainer}>
                            <MarkdownEditor
                                className={styles.editor}
                                labelContainerClassName={styles.labelContainer}
                                label={(
                                    <>
                                        <div>
                                            Analytical Statament
                                        </div>
                                        <div className={styles.labelContainerAction}>
                                            <QuickActionConfirmButton
                                                name={undefined}
                                                title="Auto generate analytical statement using NLP"
                                                message="You are about to auto generate analytical statement using NLP. This will replace the current analytical statement. Are you sure you want to continue?"
                                                onConfirm={analyticalStatementOnClick}
                                                disabled={project?.isPrivate || pending}
                                                variant="nlp-primary"
                                            >
                                                <Svg
                                                    className={styles.brainIcon}
                                                    src={brainIcon}
                                                />
                                            </QuickActionConfirmButton>
                                            {project?.isPrivate && (
                                                <div className={styles.info}>
                                                    <IoInformation />
                                                    <Tooltip>
                                                        Auto generate is not available
                                                        for private projects to
                                                        maintain document privacy.
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                name="analyticalStatement"
                                value={analyticalStatement}
                                onChange={handleAnalyticalStatementChange}
                            />
                        </div>
                        <div className={_cs(styles.markdownContainer, styles.reportTextContainer)}>
                            <MarkdownEditor
                                className={styles.editor}
                                labelContainerClassName={styles.labelContainer}
                                inputSectionClassName={styles.inputSection}
                                label={(
                                    <>
                                        <div>
                                            My Analysis
                                        </div>
                                        <div className={styles.labelContainerAction}>
                                            <QuickActionConfirmButton
                                                name={undefined}
                                                title="Auto generate my analysis using NLP"
                                                message="You are about to auto generate my analysis using NLP. This will use the current analytical statement, automatic summary, informations gap, entries and replace the current my analysis. Are you sure you want to continue?"
                                                onConfirm={myAnalysisOnClick}
                                                disabled={project?.isPrivate || pending}
                                                variant="nlp-primary"
                                            >
                                                <Svg
                                                    className={styles.brainIcon}
                                                    src={brainIcon}
                                                />
                                            </QuickActionConfirmButton>
                                            {project?.isPrivate && (
                                                <div className={styles.info}>
                                                    <IoInformation />
                                                    <Tooltip>
                                                        Auto generate is not available
                                                        for private projects to
                                                        maintain document privacy.
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                name="reportText"
                                value={reportText}
                                onChange={handleReportTextChange}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
            {modal}
        </>
    );
}

export default StoryAnalysisModal;
