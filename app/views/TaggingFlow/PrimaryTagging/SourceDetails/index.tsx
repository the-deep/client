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
    QuickActionDropdownMenu,
    QuickActionDropdownMenuProps,
    Footer,
    Heading,
    QuickActionConfirmButton,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    IoPencil,
    IoAdd,
    IoCameraOutline,
    IoExpand,
    IoClose,
    IoBrush,
    IoCheckmark,
    IoTrash,
} from 'react-icons/io5';

import CanvasDrawModal from '#components/CanvasDrawModal';
import SimplifiedTextView from '#components/SimplifiedTextView';
import LeadPreview from '#components/LeadPreview';
import Screenshot from '#components/Screenshot';
import FullScreen from '#components/FullScreen';
import { Lead } from '#views/Sources/LeadEditModal/LeadEditForm/schema';
import { useRequest } from '#base/utils/restRequest';

import styles from './styles.css';

export interface Entry {
    clientId: string;
    excerpt: string;
    droppedExcerpt: string;
    image?: string;
}

const entryKeySelector = (e: Entry) => e.clientId;

interface EntryItemProps extends Entry {
    isActive?: boolean;
    onClick?: (entryId: Entry['clientId']) => void;
    onExcerptChange?: (entryId: Entry['clientId'], modifiedExcerpt: string) => void;
    onEntryDelete?: (entryId: Entry['clientId']) => void;
}

function EntryItem(props: EntryItemProps) {
    const {
        clientId,
        droppedExcerpt,
        excerpt: excerptFromProps,
        image,
        isActive,
        onClick,
        onExcerptChange,
        onEntryDelete,
    } = props;

    const editExcerptDropdownRef: QuickActionDropdownMenuProps['componentRef'] = React.useRef(null);
    const [excerpt, setExcerpt] = useInputState<string | undefined>(excerptFromProps);
    const handleClick = React.useCallback(() => {
        if (onClick) {
            onClick(clientId);
        }
    }, [clientId, onClick]);

    const handleExcerptChange = React.useCallback((modifiedExcerpt) => {
        if (onExcerptChange) {
            onExcerptChange(clientId, modifiedExcerpt);
        }

        if (editExcerptDropdownRef?.current) {
            editExcerptDropdownRef.current.setShowPopup(false);
        }
    }, [clientId, onExcerptChange]);

    const handleDeleteConfirm = React.useCallback(() => {
        if (onEntryDelete) {
            onEntryDelete(clientId);
        }
    }, [clientId, onEntryDelete]);

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
                {droppedExcerpt}
            </div>
            {image && (
                <img
                    className={styles.image}
                    alt={excerpt}
                    src={image}
                />
            )}
            {isActive && (
                <Footer
                    quickActions={(
                        <>
                            <QuickActionDropdownMenu
                                label={<IoPencil />}
                                popupClassName={styles.editExcerptPopup}
                                popupContentClassName={styles.content}
                                persistent
                                componentRef={editExcerptDropdownRef}
                            >
                                <Heading size="small">
                                    Modify Excerpt
                                </Heading>
                                <TextArea
                                    className={styles.excerptTextArea}
                                    name="modified-excerpt"
                                    value={excerpt}
                                    onChange={setExcerpt}
                                    rows={4}
                                />
                                <Footer
                                    actions={(
                                        <Button
                                            name={excerpt}
                                            onClick={handleExcerptChange}
                                        >
                                            Done
                                        </Button>
                                    )}
                                />
                            </QuickActionDropdownMenu>
                            <QuickActionConfirmButton
                                name={undefined}
                                onConfirm={handleDeleteConfirm}
                            >
                                <IoTrash />
                            </QuickActionConfirmButton>
                        </>
                    )}
                />
            )}
            <div className={styles.verticalBorder} />
        </div>
    );
}

interface LeadPreview {
    id: number;
    previewId: number;
    text?: string;
    images: {
        id: number;
        file: string;
    }[];
}

interface Props {
    className?: string;
    onEntryCreate?: (newEntry: Entry) => void;
    entries?: Entry[];
    activeEntry?: Entry['clientId'];
    onEntryClick?: EntryItemProps['onClick'];
    onExcerptChange?: (entryClientId: Entry['clientId'], newExcerpt: string) => void;
    onEntryDelete?: (entryClientId: Entry['clientId']) => void;
    lead?: Lead;
}

function SourceDetails(props: Props) {
    const {
        className,
        onEntryCreate,
        entries,
        activeEntry,
        onEntryClick,
        lead,
        onExcerptChange,
        onEntryDelete,
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

    const {
        pending: leadPreviewPending,
        response: leadPreview,
    } = useRequest<LeadPreview>({
        skip: !lead,
        url: `server://lead-previews/${lead?.id}/`,
    });

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
                    droppedExcerpt: excerpt,
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
                <LeadPreview
                    className={styles.preview}
                    url={lead?.url}
                    attachment={lead?.attachment}
                />
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
        onExcerptChange,
        onEntryDelete,
    }), [activeEntry, onEntryClick, onExcerptChange, onEntryDelete]);

    const handleSimplifiedViewAddButtonClick = React.useCallback((selectedText: string) => {
        if (onEntryCreate) {
            onEntryCreate({
                clientId: randomString(8),
                excerpt: selectedText,
                droppedExcerpt: selectedText,
            });
        }
    }, [onEntryCreate]);

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
                    {leadPreviewPending ? (
                        <PendingMessage
                            message="Fetching simplified text"
                        />
                    ) : (
                        <SimplifiedTextView
                            className={styles.simplifiedTextView}
                            activeEntryClientId={activeEntry}
                            onExcerptClick={onEntryClick}
                            entries={entries}
                            onAddButtonClick={handleSimplifiedViewAddButtonClick}
                            text={leadPreview?.text}
                            onExcerptChange={onExcerptChange}
                        />
                    )}
                </TabPanel>
                <TabPanel
                    name="original"
                    className={styles.originalTab}
                >
                    {leadPreviewPending && (
                        <PendingMessage
                            message="Fetching simplified text"
                        />
                    )}
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

export default SourceDetails;
