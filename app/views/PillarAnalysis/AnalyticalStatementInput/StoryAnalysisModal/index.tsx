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
} from '@the-deep/deep-ui';
import { isDefined, encodeDate } from '@togglecorp/fujs';
import MDEditor, { commands } from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';

import EntryCard from './EntryCard';
import EntryContext, { EntryMin } from '../../context';
import {
    PartialAnalyticalStatementType,
} from '../../schema';

import styles from './styles.css';

const keySelector = (item: EntryMin) => item.id;

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
}

function StoryAnalysisModal(props: Props) {
    const {
        analyticalEntries,
        onModalClose,
        onSave,
        statementId,
    } = props;

    const { entries } = useContext(EntryContext);

    const [pristine, setPristine] = useState(true);
    const [tab, setTab] = useState<string | undefined>('map');
    const [informationGap, setInformationGap] = React.useState<string | undefined>();
    const [analyticalStatement, setAnalyticalStatement] = React.useState<string | undefined>();
    const [reportText, setReportText] = React.useState<string | undefined>();

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
        const report = entriesForReport?.map((entry) => generateReportText(entry)).join(' ');
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
        setReportText(newValue);
    }, [pristine]);

    const generateReportTextDisabled = (reportText?.trim().length ?? 0) > 0;

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
                        >
                            <TabPanel name="map" />
                            <TabPanel name="nGrams" />
                            <TabPanel name="context" />
                            <TabPanel name="summary" />
                        </Container>
                    </Tabs>
                </div>
                <div className={styles.right}>
                    <div className={styles.cardContainer}>
                        <div className={styles.markdownContainer}>
                            <div className={styles.title}>Information Gap</div>
                            <MDEditor
                                value={informationGap}
                                onChange={handleInformationGapChange}
                                commands={[
                                    commands.bold,
                                    commands.italic,
                                    commands.divider,
                                ]}
                                preview="edit"
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]],
                                }}
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
                                    keySelector={keySelector}
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
                            <div className={styles.title}>Analytical Statement</div>
                            <MDEditor
                                value={analyticalStatement}
                                onChange={handleAnalyticalStatementChange}
                                commands={[
                                    commands.bold,
                                    commands.italic,
                                    commands.divider,
                                ]}
                                preview="edit"
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]],
                                }}
                            />
                        </div>
                        <div className={styles.markdownContainer}>
                            <div className={styles.title}>Report Text</div>
                            <MDEditor
                                value={reportText}
                                onChange={handleReportTextChange}
                                commands={[
                                    commands.bold,
                                    commands.italic,
                                    commands.divider,
                                ]}
                                height={500}
                                preview="edit"
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]],
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </Modal>
    );
}

export default StoryAnalysisModal;
