import React, { useState, useCallback } from 'react';
import {
    Button,
    Container,
    ContainerCard,
    Modal,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@the-deep/deep-ui';
import MDEditor, { commands } from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

import {
    PartialAnalyticalStatementType,
} from '../../schema';

import styles from './styles.css';

interface Props {
    onModalClose: () => void,
    statementId: string | undefined;
    mainStatement: string | undefined,
    onStatementChange: (newVal: string | undefined) => void;
    analyticalEntries: PartialAnalyticalStatementType['entries'];
}

function StoryAnalysisModal(props: Props) {
    const {
        onModalClose,
        mainStatement,
        analyticalEntries,
        statementId,
        onStatementChange,
    } = props;

    console.warn('mainStatement', mainStatement, analyticalEntries, statementId, onStatementChange);
    const [tab, setTab] = useState<string | undefined>('map');
    const [value, setValue] = React.useState<string | undefined>('');

    const handleGenerateReportText = useCallback(() => {
        console.warn('generate report');
    }, []);

    const handleCompleteStatement = useCallback(() => {
        console.warn('message');
    }, []);

    const [pristine, setPristine] = useState(true);

    console.warn('setPristine', setPristine);

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
                        onClick={handleCompleteStatement}
                    >
                        Complete Statement
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
                                className={styles.markdownEditor}
                                value={value}
                                onChange={setValue}
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
                            <div className={styles.actions}>
                                <div className={styles.title}>Original Entries</div>
                                <Button
                                    name={undefined}
                                    onClick={handleGenerateReportText}
                                    spacing="compact"
                                    variant="secondary"
                                >
                                    Generate Report Text
                                </Button>
                            </div>
                            <MDEditor
                                className={styles.markdownEditor}
                                value={value}
                                onChange={setValue}
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
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.cardContainer}>
                        <div className={styles.markdownContainer}>
                            <div className={styles.title}>Analytical Statement</div>
                            <MDEditor
                                className={styles.markdownEditor}
                                value={value}
                                onChange={setValue}
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
                                className={styles.markdownEditor}
                                value={value}
                                onChange={setValue}
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
                    </div>
                </div>
            </Container>
        </Modal>
    );
}

export default StoryAnalysisModal;
