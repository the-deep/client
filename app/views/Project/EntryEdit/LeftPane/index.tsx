import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
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
    QuickActionDropdownMenu,
    QuickActionDropdownMenuProps,
    ListView,
    Kraken,
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
import { useRequest } from '#base/utils/restRequest';

import { PartialEntryType as EntryInput } from '../schema';
import CanvasDrawModal from './CanvasDrawModal';
import { Lead, EntryImagesMap } from '../index';
import SimplifiedTextView from './SimplifiedTextView';
import EntryItem, { ExcerptModal } from './EntryItem';
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
    onEntryRestore?: (entryClientId: string) => void;
    onApproveButtonClick?: (entryClientId: string) => void;
    onDiscardButtonClick?: (entryClientId: string) => void;
    lead?: Lead | null;
    leadId: string;
    hideSimplifiedPreview?: boolean;
    hideOriginalPreview?: boolean;
    entryImagesMap: EntryImagesMap | undefined;
    isEntrySelectionActive?: boolean;
    entriesError: Partial<Record<string, boolean>> | undefined;
    projectId: string | undefined;
    defaultTab?: 'entries' | 'simplified' | 'original';
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
        onEntryRestore,
        hideSimplifiedPreview = false,
        hideOriginalPreview = false,
        entryImagesMap,
        leadId,
        isEntrySelectionActive,
        entriesError,
        defaultTab = 'simplified',
        projectId,
    } = props;

    const alert = useAlert();

    const [activeTab, setActiveTab] = useState<'simplified' | 'original' | 'entries' | undefined>(
        (hideSimplifiedPreview && defaultTab === 'simplified') || (hideOriginalPreview && defaultTab === 'original')
            ? 'entries'
            : defaultTab,
    );

    // FIXME: we shouldn't need these values here
    const [capturedImageUrl, setCapturedImageUrl] = useState<string | undefined>();

    const [
        showScreenshot,
        setShowScreenshotTrue,
        setShowScreenshotFalse,
    ] = useBooleanState(false);
    const [
        showCanvasDrawModal,
        setShowCanvasDrawModalTrue,
        setShowCanvasDrawModalFalse,
    ] = useBooleanState(false);

    const editExcerptDropdownRef: QuickActionDropdownMenuProps['componentRef'] = useRef(null);

    const {
        pending: leadPreviewPending,
        response: leadPreview,
    } = useRequest<LeadPreview>({
        skip: !lead,
        url: `server://lead-previews/${leadId}/`,
        failureMessage: 'Failed to preview lead.',
    });

    const handleScreenshotCaptureError = useCallback((message: React.ReactNode) => {
        alert.show(
            message,
            { variant: 'error' },
        );

        setShowScreenshotFalse();
    }, [setShowScreenshotFalse, alert]);

    const handleScreenshotCancel = useCallback(() => {
        setCapturedImageUrl(undefined);
        setShowScreenshotFalse();
    }, [setShowScreenshotFalse]);

    const handleCreateEntryButtonClick = useCallback(() => {
        setShowCanvasDrawModalFalse();
        setShowScreenshotFalse();
        setCapturedImageUrl(undefined);

        if (onEntryCreate) {
            onEntryCreate({
                clientId: randomString(),
                excerpt: '',
                droppedExcerpt: '',
                entryType: 'IMAGE',
                lead: leadId,
                imageRaw: capturedImageUrl,
            });
        }
    }, [
        capturedImageUrl,
        leadId,
        onEntryCreate,
        setShowCanvasDrawModalFalse,
        setShowScreenshotFalse,
    ]);

    const handleCanvasDrawDone = useCallback((newImageUrl: string) => {
        setShowCanvasDrawModalFalse();
        setShowScreenshotFalse();
        setCapturedImageUrl(undefined);

        if (onEntryCreate) {
            onEntryCreate({
                clientId: randomString(),
                excerpt: '',
                droppedExcerpt: '',
                entryType: 'IMAGE',
                lead: leadId,
                imageRaw: newImageUrl,
            });
        }
    }, [
        leadId,
        onEntryCreate,
        setShowCanvasDrawModalFalse,
        setShowScreenshotFalse,
    ]);

    const handleExcerptAddFromSimplified = useCallback((selectedText: string) => {
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

    const handleExcerptAddFromOriginal = useCallback((selectedText: string | undefined) => {
        if (onEntryCreate) {
            onEntryCreate({
                clientId: randomString(),
                entryType: 'EXCERPT',
                lead: leadId,
                excerpt: selectedText,
                // NOTE: the droppedExcerpt should not be same as `excerpt`
                droppedExcerpt: '',
            });
        }
        // Just hide the excerpt dropdown if it is shown
        if (editExcerptDropdownRef?.current) {
            editExcerptDropdownRef.current.setShowPopup(false);
        }
    }, [leadId, onEntryCreate]);

    const entryItemRendererParams = useCallback((entryId: string, entry: EntryInput) => ({
        ...entry,
        entryId: entry.clientId,
        entryServerId: entry.id,
        isActive: activeEntry === entry.clientId,
        projectId,
        onClick: onEntryClick,
        onExcerptChange,
        onEntryDelete,
        onEntryRestore,
        entryImage: entry?.image ? entryImagesMap?.[entry.image] : undefined,
        onApproveButtonClick,
        onDiscardButtonClick,
        disableClick: isEntrySelectionActive,
        errored: entriesError?.[entryId],
    }), [
        projectId,
        onApproveButtonClick,
        entriesError,
        onDiscardButtonClick,
        activeEntry,
        onEntryClick,
        onExcerptChange,
        onEntryDelete,
        onEntryRestore,
        entryImagesMap,
        isEntrySelectionActive,
    ]);

    const activeEntryDetails = useMemo(() => (
        entries?.find((entry) => entry.clientId === activeEntry)
    ), [
        entries,
        activeEntry,
    ]);

    const containerRef = useRef<HTMLDivElement>(null);

    const [fullScreenMode, setFullScreenMode] = useState(false);

    const handleFullScreenChange = useCallback(() => {
        setFullScreenMode(isDefined(document.fullscreenElement));
    }, []);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return (() => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        });
    }, [handleFullScreenChange]);

    const handleFullScreenToggleClick = useCallback(() => {
        if (isNotDefined(containerRef.current)) {
            return;
        }
        const { current: viewerContainer } = containerRef;
        if (!fullScreenMode && isDefined(viewerContainer?.requestFullscreen)) {
            viewerContainer?.requestFullscreen();
        } else if (fullScreenMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }, [fullScreenMode]);

    const handleCanvasDrawClick = useCallback(() => {
        setShowScreenshotFalse();
        if (fullScreenMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
        setShowCanvasDrawModalTrue();
    }, [fullScreenMode, setShowCanvasDrawModalTrue, setShowScreenshotFalse]);

    const originalTabContent = (
        <Container
            elementRef={containerRef}
            className={styles.originalPreviewContainer}
            headingSize="extraSmall"
            headingClassName={styles.leadUrlContainer}
            heading={(lead?.url || lead?.attachment?.file) && (
                <TextInput
                    name="url"
                    value={lead?.url || lead?.attachment?.file?.url || ''}
                    variant="general"
                    readOnly
                />
            )}
            headerActions={(
                <>
                    <QuickActionDropdownMenu
                        label={<IoAdd />}
                        variant="primary"
                        disabled={showScreenshot || isEntrySelectionActive}
                        popupClassName={styles.createExcerptPopup}
                        popupContentClassName={styles.createExcerptContent}
                        persistent
                        componentRef={editExcerptDropdownRef}
                    >
                        <ExcerptModal
                            title="Add Excerpt"
                            excerpt=""
                            onComplete={handleExcerptAddFromOriginal}
                        />
                    </QuickActionDropdownMenu>
                    <QuickActionLink
                        to={lead?.url || lead?.attachment?.file?.url || ''}
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
                                        onClick={handleCanvasDrawClick}
                                    >
                                        <IoBrush />
                                    </QuickActionButton>
                                    <QuickActionButton
                                        name={undefined}
                                        onClick={handleCreateEntryButtonClick}
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
                            disabled={isEntrySelectionActive}
                        >
                            <IoCameraOutline />
                        </QuickActionButton>
                    )}
                    <QuickActionButton
                        name={undefined}
                        onClick={handleFullScreenToggleClick}
                    >
                        <IoExpand />
                    </QuickActionButton>
                </>
            )}
            headerDescription={activeEntryDetails && activeEntry && (
                <EntryItem
                    {...activeEntryDetails}
                    entryId={activeEntry}
                    entryServerId={activeEntryDetails?.id}
                    projectId={projectId}
                    isActive
                    onExcerptChange={onExcerptChange}
                    onEntryDelete={onEntryDelete}
                    onEntryRestore={onEntryRestore}
                    onApproveButtonClick={onApproveButtonClick}
                    onDiscardButtonClick={onDiscardButtonClick}
                    // eslint-disable-next-line max-len
                    entryImage={activeEntryDetails.image ? entryImagesMap?.[activeEntryDetails.image] : undefined}
                    disableClick={isEntrySelectionActive}
                />
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
            {showCanvasDrawModal && (
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
                        <Tab
                            name="simplified"
                            disabled={isEntrySelectionActive}
                        >
                            Simplified Text
                        </Tab>
                    )}
                    {!hideOriginalPreview && (
                        <Tab
                            name="original"
                            disabled={isEntrySelectionActive}
                        >
                            Original
                        </Tab>
                    )}
                    <Tab
                        name="entries"
                        disabled={isEntrySelectionActive}
                    >
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
                                projectId={projectId}
                                onExcerptClick={onEntryClick}
                                entries={entries}
                                onAddButtonClick={handleExcerptAddFromSimplified}
                                text={leadPreview?.text}
                                onExcerptChange={onExcerptChange}
                                onApproveButtonClick={onApproveButtonClick}
                                onDiscardButtonClick={onDiscardButtonClick}
                                onEntryDelete={onEntryDelete}
                                onEntryRestore={onEntryRestore}
                                disableAddButton={isEntrySelectionActive}
                                disableExcerptClick={isEntrySelectionActive}
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
                <TabPanel
                    name="entries"
                    className={styles.entryListTab}
                >
                    <ListView
                        data={entries ?? undefined}
                        renderer={EntryItem}
                        rendererParams={entryItemRendererParams}
                        className={styles.entryList}
                        keySelector={entryKeySelector}
                        filtered={false}
                        errored={false}
                        pending={false}
                        emptyIcon={(
                            <Kraken
                                variant="search"
                            />
                        )}
                        emptyMessage="No entries found"
                        messageShown
                        messageIconShown
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default LeftPane;
