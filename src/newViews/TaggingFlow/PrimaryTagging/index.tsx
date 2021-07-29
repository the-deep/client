import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Tabs,
    TabPanel,
    TabList,
    Tab,
    QuickActionButton,
    useBooleanState,
    useInputState,
    TextArea,
    Modal,
    Button,
} from '@the-deep/deep-ui';
import {
    IoAdd,
    IoCameraOutline,
    IoExpand,
    IoClose,
    IoBrush,
    IoCheckmark,
} from 'react-icons/io5';

// import { Lead } from '#typings';
import CanvasDrawModal from '#newComponents/CanvasDrawModal';
import Screenshot from '#newComponents/Screenshot';
import FullScreen from '#newComponents/FullScreen';
import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

interface NewEntry {
    excerpt: string;
    image?: string;
}

interface Props {
    className?: string;
    onEntryCreate?: (newEntry: NewEntry) => void;
    // source?: Lead;
}

function PrimaryTagging(props: Props) {
    const {
        className,
        onEntryCreate,
    } = props;

    const [capturedImageUrl, setCapturedImageUrl] = React.useState<string | undefined>();
    const [activeTab, setActiveTab] = React.useState<'simplified' | 'original' | 'entries'>('simplified');
    const [excerpt, setExcerpt] = useInputState<string | undefined>(undefined);
    const [
        showScreenshot,
        setShowScreenshotTrue,
        setShowScreenshotFalse,
    ] = useBooleanState(false);
    const [
        showSourcePreviewInFullScreen,,,,
        toggleShowSourcePreviewInFullScreen,
    ] = useBooleanState(false);
    const [
        showCanvasDrawModal,
        setShowCanvasDrawModalTrue,
        setShowCanvasDrawModalFalse,
    ] = useBooleanState(false);
    const [
        showAddExcerptModal,
        setShowAddExcerptModalTrue,
        setShowAddExcerptModalFalse,
    ] = useBooleanState(false);

    const handleScreenshotCaptureError = React.useCallback((message) => {
        notify.send({
            title: _ts('components.galleryViewer', 'errorTitle'), // screenshot
            type: notify.type.ERROR,
            message,
            duration: notify.duration.SLOW,
        });

        setShowScreenshotFalse();
    }, [setShowScreenshotFalse]);

    const handleScreenshotCancel = React.useCallback(() => {
        setCapturedImageUrl(undefined);
        setShowScreenshotFalse();
    }, [setShowScreenshotFalse]);

    const handleScreenshotCaptureComplete = React.useCallback(() => {
        setShowAddExcerptModalTrue();
    }, [setShowAddExcerptModalTrue]);

    const handleCanvasDrawDone = React.useCallback((newImageUrl: string) => {
        setCapturedImageUrl(newImageUrl);
        setShowAddExcerptModalTrue();
    }, [setShowAddExcerptModalTrue]);

    const handleAddExcerptCancel = React.useCallback(() => {
        setShowAddExcerptModalFalse();
        setExcerpt(undefined);
    }, [setExcerpt, setShowAddExcerptModalFalse]);

    const handleCreateEntryButtonClick = React.useCallback(() => {
        setShowAddExcerptModalFalse();
        setCapturedImageUrl(undefined);
        setShowCanvasDrawModalFalse();
        setExcerpt(undefined);
        setShowScreenshotFalse();

        if (excerpt) {
            if (onEntryCreate) {
                onEntryCreate({
                    excerpt,
                    image: capturedImageUrl,
                });
            }
        }
    }, [
        capturedImageUrl,
        excerpt,
        setExcerpt,
        onEntryCreate,
        setShowAddExcerptModalFalse,
        setShowCanvasDrawModalFalse,
        setCapturedImageUrl,
        setShowScreenshotFalse,
    ]);

    const originalTabContent = (
        <>
            <div className={styles.actions}>
                <QuickActionButton
                    name={undefined}
                    variant="primary"
                    disabled={showScreenshot}
                    onClick={setShowAddExcerptModalTrue}
                >
                    <IoAdd />
                </QuickActionButton>
                {showScreenshot ? (
                    <>
                        <QuickActionButton
                            name={undefined}
                            onClick={setShowScreenshotFalse}
                        >
                            <IoClose />
                        </QuickActionButton>
                        { capturedImageUrl && (
                            <>
                                <QuickActionButton
                                    name={undefined}
                                    onClick={setShowCanvasDrawModalTrue}
                                >
                                    <IoBrush />
                                </QuickActionButton>
                                <QuickActionButton
                                    name={undefined}
                                    onClick={handleScreenshotCaptureComplete}
                                >
                                    <IoCheckmark />
                                </QuickActionButton>
                            </>
                        )}
                    </>
                ) : (
                    <QuickActionButton
                        name={undefined}
                        onClick={setShowScreenshotTrue}
                    >
                        <IoCameraOutline />
                    </QuickActionButton>
                )}
                <QuickActionButton
                    name={undefined}
                    onClick={toggleShowSourcePreviewInFullScreen}
                >
                    <IoExpand />
                </QuickActionButton>
            </div>
            <div className={styles.content}>
                Original
                {showScreenshot && (
                    <Screenshot
                        onCapture={setCapturedImageUrl}
                        onCaptureError={handleScreenshotCaptureError}
                        onCancel={handleScreenshotCancel}
                    />
                )}
                { showCanvasDrawModal && (
                    <CanvasDrawModal
                        imgSrc={capturedImageUrl}
                        onDone={handleCanvasDrawDone}
                        onCancel={setShowCanvasDrawModalFalse}
                    />
                )}
            </div>
        </>
    );

    return (
        <div className={_cs(className, styles.primaryTagging)}>
            <div className={styles.sourcePreview}>
                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    variant="secondary"
                >
                    <TabList className={styles.tabList}>
                        <Tab name="simplified">
                            Simplified Text
                        </Tab>
                        <Tab name="original">
                            Original
                        </Tab>
                        <Tab name="entries">
                            All Entries
                        </Tab>
                    </TabList>
                    <TabPanel
                        name="simplified"
                        className={styles.simplifiedTab}
                    >
                        Simplified lead view
                    </TabPanel>
                    <TabPanel
                        name="original"
                        className={styles.originalTab}
                    >
                        {originalTabContent}
                    </TabPanel>
                    {showSourcePreviewInFullScreen && (
                        <FullScreen className={styles.originalTab}>
                            {originalTabContent}
                        </FullScreen>
                    )}
                    <TabPanel
                        name="entries"
                        className={styles.entryListTab}
                    >
                        All Entries
                    </TabPanel>
                </Tabs>
                {showAddExcerptModal && (
                    <Modal
                        heading="Add excerpt"
                        headingSize="small"
                        onCloseButtonClick={handleAddExcerptCancel}
                        footerActions={(
                            <Button
                                name="create-entry-button"
                                variant="primary"
                                onClick={handleCreateEntryButtonClick}
                                disabled={!excerpt}
                            >
                                Create Entry
                            </Button>
                        )}
                    >
                        <TextArea
                            name="excerpt"
                            value={excerpt}
                            onChange={setExcerpt}
                            rows={5}
                        />
                    </Modal>
                )}
            </div>
            <div className={styles.taggingPlayground}>
                Tagging playground
            </div>
        </div>
    );
}

export default PrimaryTagging;
