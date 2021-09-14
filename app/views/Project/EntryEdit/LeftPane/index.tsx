import React from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    Tabs,
    Container,
    TabPanel,
    TabList,
    Tab,
    TextInput,
    QuickActionButton,
    useBooleanState,
    useInputState,
    TextArea,
    Modal,
    Button,
    ListView,
    useAlert,
    QuickActionLink,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    IoAdd,
    IoOpenOutline,
    IoCameraOutline,
    IoExpand,
    IoClose,
    IoBrush,
    IoCheckmark,
} from 'react-icons/io5';

import LeadPreview from '#components/lead/LeadPreview';
import Screenshot from '#components/Screenshot';
import FullScreen from '#components/FullScreen';
import { Lead } from '#components/lead/LeadEditForm/schema';
import { useRequest } from '#base/utils/restRequest';

import { PartialEntryType as EntryInput } from '../schema';
import CanvasDrawModal from './CanvasDrawModal';
import SimplifiedTextView from './SimplifiedTextView';
import EntryItem from './EntryItem';
import styles from './styles.css';

const entryKeySelector = (e: EntryInput) => e.clientId;

interface LeadPreview {
    id: number;
    previewId: number;
    text?: string;
    images?: {
        id: number;
        file: string;
    }[];
}

interface Props {
    className?: string;
    onEntryCreate?: (newEntry: EntryInput) => void;
    entries: EntryInput[] | undefined | null;
    activeEntry?: string;
    onEntryClick?: (entryId: string) => void;
    onExcerptChange?: (entryClientId: string, newExcerpt: string | undefined) => void;
    onEntryDelete?: (entryClientId: string) => void;
    onApproveButtonClick?: (entryClientId: string) => void;
    onDiscardButtonClick?: (entryClientId: string) => void;
    lead?: Lead;
    leadId: string;
    hideSimplifiedPreview?: boolean;
    hideOriginalPreview?: boolean;
}

function LeftPane(props: Props) {
    const {
        className,
        onEntryCreate,
        entries,
        activeEntry,
        lead,
        onEntryClick,
        onExcerptChange,
        onApproveButtonClick,
        onDiscardButtonClick,
        onEntryDelete,
        hideSimplifiedPreview = false,
        hideOriginalPreview = false,
        leadId,
    } = props;

    const alert = useAlert();

    const [activeTab, setActiveTab] = React.useState<'simplified' | 'original' | 'entries' | undefined>(
        !hideSimplifiedPreview ? 'simplified' : 'entries',
    );

    // FIXME: we shouldn't need these values here
    const [capturedImageUrl, setCapturedImageUrl] = React.useState<string | undefined>();

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
                    clientId: randomString(),
                    excerpt,
                    entryType: 'IMAGE',
                    lead: leadId,
                    droppedExcerpt: excerpt,
                    imageRaw: capturedImageUrl,
                });
            }
        }
    }, [
        capturedImageUrl,
        excerpt,
        leadId,
        setExcerpt,
        onEntryCreate,
        setShowAddExcerptModalFalse,
        setShowCanvasDrawModalFalse,
        setCapturedImageUrl,
        setShowScreenshotFalse,
    ]);

    const entryItemRendererParams = React.useCallback((_: string, entry: EntryInput) => ({
        ...entry,
        isActive: activeEntry === entry.clientId,
        onClick: onEntryClick,
        onExcerptChange,
        onEntryDelete,
    }), [activeEntry, onEntryClick, onExcerptChange, onEntryDelete]);

    const handleSimplifiedViewAddButtonClick = React.useCallback((selectedText: string) => {
        if (onEntryCreate) {
            onEntryCreate({
                clientId: randomString(),
                entryType: 'EXCERPT',
                lead: leadId,
                excerpt: selectedText,
                droppedExcerpt: selectedText,
            });
        }
    }, [leadId, onEntryCreate]);

    const originalTabContent = (
        <Container
            className={styles.originalPreviewContainer}
            headingSize="extraSmall"
            headingClassName={styles.leadUrlContainer}
            heading={(lead?.url || lead?.attachment?.file) && (
                <TextInput
                    name="url"
                    value={lead?.url ?? lead?.attachment?.file ?? ''}
                    variant="general"
                    readOnly
                />
            )}
            headerActions={(
                <>
                    <QuickActionButton
                        name={undefined}
                        variant="primary"
                        disabled={showScreenshot}
                        onClick={setShowAddExcerptModalTrue}
                    >
                        <IoAdd />
                    </QuickActionButton>
                    <QuickActionLink
                        to={lead?.url ?? lead?.attachment?.file ?? ''}
                    >
                        <IoOpenOutline />
                    </QuickActionLink>
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
                </>
            )}
            contentClassName={styles.content}
        >
            <LeadPreview
                className={styles.preview}
                url={lead?.url}
                attachment={lead?.attachment}
                hideBar
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
        </Container>
    );

    return (
        <div className={_cs(styles.sourcePreview, className)}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="secondary"
            >
                <TabList className={styles.tabList}>
                    {!hideSimplifiedPreview && (
                        <Tab name="simplified">
                            Simplified Text
                        </Tab>
                    )}
                    {!hideOriginalPreview && (
                        <Tab name="original">
                            Original
                        </Tab>
                    )}
                    <Tab name="entries">
                        All Entries
                    </Tab>
                </TabList>
                {!hideSimplifiedPreview && (
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
                                onApproveButtonClick={onApproveButtonClick}
                                onDiscardButtonClick={onDiscardButtonClick}
                                // FIXME: disabled
                            />
                        )}
                    </TabPanel>
                )}
                {!hideOriginalPreview && (
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
                )}
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
                        data={entries ?? undefined}
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

export default LeftPane;
