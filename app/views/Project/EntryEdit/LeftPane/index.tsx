import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    Tabs,
    Container,
    TabPanel,
    TabList,
    Tab,
    TextInput,
    QuickActionButton,
    useBooleanState,
    Button,
    QuickActionDropdownMenu,
    QuickActionDropdownMenuProps,
    VirtualizedListView,
    Kraken,
    useAlert,
    QuickActionLink,
    PendingMessage,
    Message,
    Switch,
} from '@the-deep/deep-ui';
import {
    IoAdd,
    IoOpenOutline,
    IoCameraOutline,
    IoExpand,
    IoReloadOutline,
    IoClose,
    IoBrush,
    IoCheckmark,
} from 'react-icons/io5';

import useLocalStorage from '#hooks/useLocalStorage';
import LeadPreview from '#components/lead/LeadPreview';
import Screenshot from '#components/Screenshot';
import {
    LeadPreviewForTextQuery,
    LeadPreviewForTextQueryVariables,
} from '#generated/types';

import { PartialEntryType as EntryInput } from '../schema';
import CanvasDrawModal from './CanvasDrawModal';
import { Lead, EntryImagesMap } from '../index';
import { Framework } from '../types';
import SimplifiedTextView from './SimplifiedTextView';
import EntryItem, { ExcerptModal } from './EntryItem';
import styles from './styles.css';

const LEAD_PREVIEW = gql`
    query LeadPreviewForText(
        $leadId: ID!,
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            lead(id: $leadId) {
                id
                extractionStatus
                leadPreview {
                    textExtract
                }
            }
        }
    }
`;

const entryKeySelector = (e: EntryInput) => e.clientId;

export type TabOptions = 'simplified' | 'original' | 'entries' | undefined;

interface Props {
    className?: string;
    onEntryCreate?: (newEntry: EntryInput) => void;
    onAssistedEntryAdd?: (newEntry: EntryInput) => void;
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
    frameworkDetails: Framework;
    activeTabRef?: React.MutableRefObject<{
        setActiveTab: React.Dispatch<React.SetStateAction<TabOptions>>;
    } | null>;
    listComponentRef?: React.MutableRefObject<{
        scrollTo: (item: string) => void;
    } | null>;
}

function LeftPane(props: Props) {
    const {
        className,
        onEntryCreate,
        entries,
        activeEntry,
        lead,
        listComponentRef,
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
        activeTabRef,
        frameworkDetails,
        onAssistedEntryAdd,
    } = props;

    const alert = useAlert();

    const [activeTab, setActiveTab] = useState<TabOptions>(
        (hideSimplifiedPreview && defaultTab === 'simplified') || (hideOriginalPreview && defaultTab === 'original')
            ? 'entries'
            : defaultTab,
    );

    const [
        assistedTaggingEnabled,
        onAssistedTaggingStatusChange,
    ] = useLocalStorage('assisted-tagging-enabled', false);

    useEffect(() => {
        if (activeTabRef) {
            activeTabRef.current = {
                setActiveTab,
            };
        }
    }, [activeTabRef]);

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

    const [fullScreenMode, setFullScreenMode] = useState(false);

    const editExcerptDropdownRef: QuickActionDropdownMenuProps['componentRef'] = useRef(null);

    const variables = useMemo(
        () => ((leadId && projectId) ? ({
            leadId,
            projectId,
        }) : undefined),
        [leadId, projectId],
    );

    const {
        data: leadPreviewData,
        loading: leadPreviewPending,
        refetch,
    } = useQuery<LeadPreviewForTextQuery, LeadPreviewForTextQueryVariables>(
        LEAD_PREVIEW,
        {
            skip: !variables,
            variables,
        },
    );

    const leadPreview = leadPreviewData?.project?.lead?.leadPreview;
    const extractionStatus = leadPreviewData?.project?.lead?.extractionStatus;

    const handleScreenshotCaptureError = useCallback((message: React.ReactNode) => {
        alert.show(
            message,
            {
                variant: 'error',
                duration: 8000,
            },
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
        if (fullScreenMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }, [
        fullScreenMode,
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
        className: styles.entryItem,
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
                    {!fullScreenMode && (
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
                    )}
                    <QuickActionLink
                        title="Open external"
                        to={lead?.url || lead?.attachment?.file?.url || ''}
                    >
                        <IoOpenOutline />
                    </QuickActionLink>
                    {showScreenshot ? (
                        <>
                            <QuickActionButton
                                name={undefined}
                                title="Close"
                                onClick={setShowScreenshotFalse}
                            >
                                <IoClose />
                            </QuickActionButton>
                            { capturedImageUrl && (
                                <>
                                    <QuickActionButton
                                        title="Draw over screenshot"
                                        name={undefined}
                                        onClick={handleCanvasDrawClick}
                                    >
                                        <IoBrush />
                                    </QuickActionButton>
                                    <QuickActionButton
                                        name={undefined}
                                        title="Finalize screenshot"
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
                        title={fullScreenMode ? 'Exit fullscreen' : 'Enter fullscreen'}
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
                        {`All Entries (${entries?.length ?? 0})`}
                    </Tab>
                </TabList>
                {!hideSimplifiedPreview && (
                    <TabPanel
                        name="simplified"
                        activeClassName={styles.simplifiedTab}
                        retainMount="lazy"
                    >
                        {(leadPreview?.textExtract?.length ?? 0) > 0 ? (
                            <>
                                {/* TODO: Hide this button based on whether or not the
                                    associated framework has NLP mapping */}
                                <Switch
                                    className={styles.switch}
                                    name="isAssistedTaggingEnabled"
                                    value={assistedTaggingEnabled}
                                    onChange={onAssistedTaggingStatusChange}
                                    label="Assisted Tagging"
                                />
                                <SimplifiedTextView
                                    className={styles.simplifiedTextView}
                                    activeEntryClientId={activeEntry}
                                    projectId={projectId}
                                    onExcerptClick={onEntryClick}
                                    entries={entries}
                                    onAddButtonClick={handleExcerptAddFromSimplified}
                                    onAssistedEntryAdd={onAssistedEntryAdd}
                                    text={leadPreview?.textExtract}
                                    onExcerptChange={onExcerptChange}
                                    onApproveButtonClick={onApproveButtonClick}
                                    onDiscardButtonClick={onDiscardButtonClick}
                                    onEntryDelete={onEntryDelete}
                                    onEntryRestore={onEntryRestore}
                                    disableAddButton={isEntrySelectionActive}
                                    disableExcerptClick={isEntrySelectionActive}
                                    assistedTaggingEnabled={assistedTaggingEnabled}
                                    frameworkDetails={frameworkDetails}
                                    leadId={leadId}
                                />
                            </>
                        ) : (
                            <Message
                                // NOTE: Pending from server side to get state of extraction
                                // to properly toggle between whether the source has been
                                // extracted or not
                                pending={leadPreviewPending}
                                pendingMessage="Fetching simplified text"
                                icon={(
                                    <Kraken variant="work" />
                                )}
                                message={(
                                    (extractionStatus === 'PENDING'
                                    || extractionStatus === 'STARTED')
                                        ? 'Simplified text is currently being extracted from this source. Please retry after few minutes.'
                                        : 'Oops! Either the source was empty or we couldn\'t extract its text.'
                                )}
                                errored={extractionStatus === 'FAILED'}
                                erroredEmptyIcon={(
                                    <Kraken variant="work" />
                                )}
                                erroredEmptyMessage="There was an when issue extracting simplified
                                text for this source."
                                actions={(extractionStatus === 'PENDING' || extractionStatus === 'STARTED') && (
                                    <Button
                                        name={undefined}
                                        variant="secondary"
                                        onClick={refetch}
                                        icons={(<IoReloadOutline />)}
                                        disabled={leadPreviewPending}
                                    >
                                        Retry
                                    </Button>
                                )}
                            />
                        )}
                    </TabPanel>
                )}
                {!hideOriginalPreview && (
                    <TabPanel
                        name="original"
                        activeClassName={styles.originalTab}
                        retainMount="lazy"
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
                    activeClassName={styles.entryListTab}
                    retainMount="lazy"
                >
                    <VirtualizedListView
                        spacing="comfortable"
                        direction="vertical"
                        itemHeight={200}
                        componentRef={listComponentRef}
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
