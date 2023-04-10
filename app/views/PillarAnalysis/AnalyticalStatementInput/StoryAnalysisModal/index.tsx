import React, { useState, useCallback, useContext, useMemo } from 'react';
import {
    Button,
    Container,
    ListView,
    Modal,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    SegmentInput,
    TextInput,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { isDefined, encodeDate, _cs } from '@togglecorp/fujs';
import { IoChevronForward } from 'react-icons/io5';

import WordTree from '#components/WordTree';
import MarkdownEditor from '#components/MarkdownEditor';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';

import EntryCard from './EntryCard';
import EntryContext, { EntryMin } from '../../context';
import Summary from './Summary';
import Ngrams from './Ngrams';

import {
    PartialAnalyticalStatementType,
} from '../../schema';

import styles from './styles.css';

const entryKeySelector = (item: EntryMin) => item.id;

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

function generateReportText(entry: EntryMin) {
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

    const entriesForReport = useMemo(() => (
        analyticalEntries?.map(
            (ae) => (ae.entry ? entries?.[ae.entry] : undefined),
        ).filter(isDefined) ?? []
    ), [entries, analyticalEntries]);

    const entriesRendererParams = useCallback((_: string, data: EntryMin) => ({
        entry: data,
    }), []);

    const handleGenerateReportText = useCallback(() => {
        if (pristine) {
            setPristine(false);
        }
        const report = entriesForReport.map((entry) => generateReportText(entry)).join('\n\n');
        setReportText(report);
    }, [entriesForReport, pristine]);

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
        entriesForReport.map((entry) => entry.excerpt).join(' ')
    ), [entriesForReport]);

    const sourceText = useMemo(() => {
        if (sourceOption === 'originalEntries') {
            return originalEntriesText;
        }
        return reportText ?? '';
    }, [sourceOption, originalEntriesText, reportText]);

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
                    <div className={styles.stats}>Stats</div>
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
                            <TabPanel name="map" />
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
                                    variant="secondary"
                                >
                                    Generate Report Text
                                </Button>
                            </div>
                            <div className={styles.entriesList}>
                                <ListView
                                    className={styles.entries}
                                    data={entriesForReport}
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
