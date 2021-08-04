import React from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
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
    ListView,
    useAlert,
} from '@the-deep/deep-ui';
import {
    IoAdd,
    IoCameraOutline,
    IoExpand,
    IoClose,
    IoBrush,
    IoCheckmark,
} from 'react-icons/io5';

import CanvasDrawModal from '#components/CanvasDrawModal';
import Screenshot from '#components/Screenshot';
import FullScreen from '#components/FullScreen';

import styles from './styles.css';

export interface Entry {
    clientId: string;
    excerpt: string;
    image?: string;
}

const entryKeySelector = (e: Entry) => e.clientId;

interface EntryItemProps extends Entry {
    isActive?: boolean;
    onClick?: (entryId: Entry['clientId']) => void;
}

function EntryItem(props: EntryItemProps) {
    const {
        clientId,
        excerpt,
        image,
        isActive,
        onClick,
    } = props;

    const handleClick = React.useCallback(() => {
        if (onClick) {
            onClick(clientId);
        }
    }, [clientId, onClick]);

    return (
        <div
            role="presentation"
            className={_cs(
                isActive && styles.active,
                styles.entry,
            )}
            onClick={handleClick}
        >
            <div className={styles.excerpt}>
                {excerpt}
            </div>
            {image && (
                <img
                    className={styles.image}
                    alt={excerpt}
                    src={image}
                />
            )}
        </div>
    );
}

interface Props {
    className?: string;
    onEntryCreate?: (newEntry: Entry) => void;
    entries?: Entry[];
    activeEntry?: Entry['clientId'];
    onEntryClick?: EntryItemProps['onClick'];
}

function PrimaryTagging(props: Props) {
    const {
        className,
        onEntryCreate,
        entries,
        activeEntry,
        onEntryClick,
    } = props;

    const alert = useAlert();

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
        alert.show(
            message,
            { variant: 'error' },
        );

        setShowScreenshotFalse();
    }, [setShowScreenshotFalse, alert]);

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
                    clientId: randomString(16),
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

    const entryItemRendererParams = React.useCallback((_: Entry['clientId'], entry: Entry) => ({
        ...entry,
        isActive: activeEntry === entry.clientId,
        onClick: onEntryClick,
    }), [activeEntry, onEntryClick]);

    return (
        <div className={_cs(styles.sourcePreview, className)}>
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
                    <ListView
                        data={entries}
                        renderer={EntryItem}
                        rendererParams={entryItemRendererParams}
                        keySelector={entryKeySelector}
                    />
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
    );
}

export default PrimaryTagging;
