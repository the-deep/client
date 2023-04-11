import React, { useState, useCallback, useContext, useMemo } from 'react';
import {
    Button,
    Container,
    Kraken,
    ListView,
    Message,
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

import EntryCard from './EntryCard';
import EntryContext from '../../context';
import Summary from './Summary';
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
        label: 'Report Text',
    },
];

const keySelector = (d: KeyLabel) => d.key;
const labelSelector = (d: KeyLabel) => d.label;

function generateReportText(entry: Entry) {
    const authors = entry.lead.authors
        ?.map((author) => organizationTitleSelector(author)).join(',');
    const entryCreatedDate = new Date(entry.createdAt);
    const entryText = entry?.excerpt.replace(/[.,\s]*$/, ' ');

    // FIXME: Use publicUrl here
    return `${entryText}([${authors}](${entry.lead.id}), ${encodeDate(entryCreatedDate)}).`;
}

interface Props {
    analyticalEntries: PartialAnalyticalStatementType['entries'];
    onModalClose: () => void,
    onSave: (newVal: string | undefined) => void;
    statementId: string | undefined;
    projectId: string;
    automaticNgramsId: string | undefined;
    automaticSummaryId: string | undefined;
    onRemove: (index: number) => void;
    index: number;
    framework: Framework;
    geoAreaOptions: GeoArea[] | undefined | null;
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onEntryDataChange: () => void;
}

function StoryAnalysisModal(props: Props) {
    const {
        analyticalEntries,
        onModalClose,
        onSave,
        statementId,
        projectId,
        automaticNgramsId,
        automaticSummaryId,
        onRemove,
        index,
        framework,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
    } = props;

    const { entries } = useContext(EntryContext);

    const [pristine, setPristine] = useState(true);
    const [tab, setTab] = useState<TabType | undefined>('map');
    const [informationGap, setInformationGap] = React.useState<string | undefined>();
    const [analyticalStatement, setAnalyticalStatement] = React.useState<string | undefined>();
    const [reportText, setReportText] = React.useState<string | undefined>('');
    const [sourceOption, setSourceOption] = useState<KeyLabel['key']>('originalEntries');
    const [word, setWord] = useState<string>();
    const [rootWord, setRootWord] = useState<string>();

    const handleSave = useCallback(() => {
        onSave(analyticalStatement);
    }, [onSave, analyticalStatement]);

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
        setInformationGap(newValue);
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
        const entriesOrganizationTypes = originalEntries.flatMap((entry) => (
            entry?.lead?.authors?.flatMap((author) => author.organizationType)?.filter(isDefined)
        )).filter(isDefined);

        const groupedOrganizationTypes = listToGroupList(
            entriesOrganizationTypes,
            (organizationType) => organizationType.id,
        );
        return unique(entriesOrganizationTypes, (d) => d.id)
            ?.map((uniqueOrganizationType) => ({
                ...uniqueOrganizationType,
                count: groupedOrganizationTypes[uniqueOrganizationType.id].length,
            }));
    }, [originalEntries]);

    const stats = useMemo(() => {
        // INFO: patten used from https://stephencharlesweiss.com/regex-markdown-link
        const entriesInReport = reportText
            ?.match(/!?\[([^\]]*)?\]\(((https?:\/\/)?[A-Za-z0-9\:\/\. ]+)(\"(.+)\")?\)/gm) //eslint-disable-line
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
    }, [reportText]);

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
                                <Message
                                    className={styles.message}
                                    message="Automatic geo location analysis is not available at the moment."
                                    icon={(<Kraken variant="sleep" />)}
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
                                value={informationGap}
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
                                    Generate Report Text
                                </Button>
                            </div>
                            <div className={styles.entriesList}>
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
                                label="Report Text"
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
