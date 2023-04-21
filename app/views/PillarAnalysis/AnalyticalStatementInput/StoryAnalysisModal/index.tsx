import React, { useState, useCallback, useContext, useMemo } from 'react';
import {
    Button,
    Container,
    ListView,
    Modal,
    QuickActionButton,
    SegmentInput,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TextInput,
} from '@the-deep/deep-ui';
import { isDefined, encodeDate, _cs, unique, listToGroupList } from '@togglecorp/fujs';
import { IoChevronForward } from 'react-icons/io5';

import WordTree from '#components/WordTree';
import MarkdownEditor from '#components/MarkdownEditor';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';

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

const keySelector = (d: KeyLabel) => d.key;
const labelSelector = (d: KeyLabel) => d.label;

function generateReportText(entry: Entry) {
    const authors = entry.lead.authors
        ?.map((author) => organizationTitleSelector(author)).join(', ');
    const publisher = entry.lead.source ? organizationTitleSelector(entry.lead.source) : '';
    const organizations = (authors?.length ?? 0) > 0 ? authors : publisher;
    const entryCreatedDate = new Date(entry.createdAt);
    const entryText = entry?.excerpt.replace(/[.,\s]*$/, ' ');

    const url = entry.lead.url.length > 0 ? entry.lead.url : entry.lead.shareViewUrl;
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

    const handleSourceOptionChange = useCallback((option) => {
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
            originalEntries?.flatMap(
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

    return (
        <Modal
            className={styles.storyAnalysisModal}
            heading="Story Analysis"
            onCloseButtonClick={onModalClose}
            size="cover"
            bodyClassName={styles.modalBody}
        >
            <Container
                className={styles.container}
                spacing="none"
                footerActions={(
                    <Button
                        name={statementId}
                        disabled={pristine}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                )}
                contentClassName={styles.content}
            >
                <div className={styles.left}>
                    <div className={styles.stats}>
                        <Stats
                            diversityChartData={organizationTypes}
                            {...stats}
                        />
                    </div>
                    <Tabs
                        value={tab}
                        onChange={setTab}
                        variant="secondary"
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
                                        activeClassName={styles.activeTab}
                                        name="map"
                                        transparentBorder
                                    >
                                        Map
                                    </Tab>
                                    <Tab
                                        className={styles.tab}
                                        activeClassName={styles.activeTab}
                                        name="nGrams"
                                        transparentBorder
                                    >
                                        N-grams
                                    </Tab>
                                    <Tab
                                        className={styles.tab}
                                        activeClassName={styles.activeTab}
                                        name="context"
                                        transparentBorder
                                    >
                                        Context
                                    </Tab>
                                    <Tab
                                        className={styles.tab}
                                        activeClassName={styles.activeTab}
                                        name="summary"
                                        transparentBorder
                                    >
                                        Automatic Summary
                                    </Tab>
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
                                        placeholder="Root word"
                                        onChange={setWord}
                                        actions={(
                                            <QuickActionButton
                                                name="drawChart"
                                                variant="secondary"
                                                onClick={handleDrawChart}
                                                title="Set root word"
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
                            <TabPanel name="summary" className={styles.tabPanel}>
                                <Summary
                                    projectId={projectId}
                                    summaryId={automaticSummaryId}
                                />
                            </TabPanel>
                        </Container>
                    </Tabs>
                </div>
                <div className={styles.right}>
                    <div className={styles.cardContainer}>
                        <div className={styles.markdownContainer}>
                            <MarkdownEditor
                                className={styles.editor}
                                labelContainerClassName={styles.labelContainer}
                                label="Information Gap"
                                name="informationGap"
                                value={informationGaps}
                                onChange={handleInformationGapChange}
                            />
                        </div>
                        <div className={styles.entriesContainer}>
                            <div className={styles.actions}>
                                <div className={styles.title}>Original Entries</div>
                                <Button
                                    name={undefined}
                                    onClick={handleGenerateReportText}
                                    disabled={generateReportTextDisabled}
                                    spacing="compact"
                                    variant="tertiary"
                                >
                                    Generate Analysis
                                </Button>
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
                                label="Analytical Statement"
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
                                label="Analysis"
                                name="reportText"
                                value={reportText}
                                onChange={handleReportTextChange}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </Modal>
    );
}

export default StoryAnalysisModal;
