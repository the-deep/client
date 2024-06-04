import React, {
    useContext,
    useState,
    useMemo,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
    randomString,
    listToMap,
} from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    MdOutlineZoomIn,
    MdOutlineZoomOut,
} from 'react-icons/md';
import {
    Tabs,
    Container,
    TabPanel,
    TabList,
    Tab,
    TextInput,
    QuickActionButton,
    useBooleanState,
    useModalState,
    Button,
    QuickActionDropdownMenu,
    QuickActionDropdownMenuProps,
    VirtualizedListView,
    Kraken,
    useAlert,
    QuickActionLink,
    PendingMessage,
    Message,
    Tooltip,
    Pager,
    ListView,
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
    IoInformation,
} from 'react-icons/io5';

import { GeoArea } from '#components/GeoMultiSelectInput';
import LeadPreview from '#components/lead/LeadPreview';
import Screenshot from '#components/Screenshot';
import { UserContext } from '#base/context/UserContext';
import {
    LeadPreviewForTextQuery,
    LeadPreviewForTextQueryVariables,
    LeadEntriesQuery,
    LeadPreviewAttachmentType,
} from '#generated/types';

import { PartialEntryType as EntryInput } from '#components/entry/schema';
import {
    Entry,
    Framework,
} from '#components/entry/types';

import CanvasDrawModal from './CanvasDrawModal';
import SimplifiedTextView from './SimplifiedTextView';
import AutoEntriesModal from './AutoEntriesModal';
import TablesAndVisualsItem from './TableAndVisualItem';
import EntryItem, { ExcerptModal } from './EntryItem';

import styles from './styles.css';

type EntryImagesMap = { [key: string]: Entry['image'] | undefined };
export type EntryAttachmentsMap = { [key: string]: Entry['entryAttachment'] | undefined };

type Lead = NonNullable<NonNullable<LeadEntriesQuery['project']>['lead']>;

const LEAD_PREVIEW = gql`
    query LeadPreviewForText(
        $leadId: ID!,
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $excludeAttachmentId: [ID!],
    ) {
        project(id: $projectId) {
            id
            leadPreviewAttachments(
                lead: $leadId,
                page: $page,
                pageSize: $pageSize,
                excludeAttachmentIds: $excludeAttachmentId, 
            ) {
                results {
                    id
                    pageNumber
                    type
                    file {
                        name
                        url
                    }
                    filePreview {
                        name
                        url
                    }
                    order
                }
                totalCount
                page
                pageSize
            }
            lead(id: $leadId) {
                id
                extractionStatus
                connectorLead
                confidentiality
                leadPreview {
                    textExtract
                    textExtractionId
                }
            }
        }
    }
`;

const entryKeySelector = (e: EntryInput) => e.clientId;

const leadAttachmentKeySelector = (e: LeadPreviewAttachmentType) => e.id;

export type TabOptions = 'simplified' | 'original' | 'entries' | 'visuals' | undefined;

interface Props {
    className?: string;
    onEntryCreate?: (newEntry: EntryInput) => void;
    onAssistedEntryAdd?: (newEntry: EntryInput, geoAreaOptions?: GeoArea[]) => void;
    entries: EntryInput[] | undefined | null;
    activeEntry?: string;
    onEntryClick?: (entryId: string) => void;
    onExcerptChange?: (entryClientId: string, newExcerpt: string | undefined) => void;
    onEntryDelete?: (entryClientId: string) => void;
    onEntryRestore?: (entryClientId: string) => void;
    onApproveButtonClick?: (entryClientId: string) => void;
    onDiscardButtonClick?: (entryClientId: string) => void;
    onAttachmentClick?: (entryClientId: string) => void;
    lead?: Lead | null;
    leadId: string;
    hideSimplifiedPreview?: boolean;
    hideOriginalPreview?: boolean;
    entryImagesMap: EntryImagesMap | undefined;
    entryAttachmentsMap?: EntryAttachmentsMap | undefined;
    isEntrySelectionActive?: boolean;
    entriesError?: Partial<Record<string, boolean>> | undefined;
    projectId: string | undefined;
    leadAttachmentId?: string;
    defaultTab?: 'entries' | 'simplified' | 'original' | 'visuals';
    frameworkDetails?: Framework;
    activeTabRef?: React.MutableRefObject<{
        setActiveTab: React.Dispatch<React.SetStateAction<TabOptions>>;
    } | null>;
    listComponentRef?: React.MutableRefObject<{
        scrollTo: (item: string) => void;
    } | null>;
    page?: number;
    pageSize?: number;
    setPage?: (page: number) => void;
    setPageSize?: (pageSize: number) => void;
}

const defaultMaxItemsPerPage = 10;

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
        leadAttachmentId,
        entryAttachmentsMap,
    } = props;

    const [showResults, setShowResults] = useState(false);

    const handleToggle = () => {
        setShowResults(!showResults);
    };

    const alert = useAlert();
    const { user } = useContext(UserContext);

    const isAssistedTaggingAccessible = !!user
        ?.accessibleFeatures?.some((feature) => feature.key === 'ASSISTED');

    const [activeTab, setActiveTab] = useState<TabOptions>(
        (hideSimplifiedPreview && defaultTab === 'simplified') || (hideOriginalPreview && defaultTab === 'original')
            ? 'entries'
            : defaultTab,
    );

    const [
        autoEntriesModalShown,
        showAutoEntriesModal,
        hideAutoEntriesModal,
    ] = useModalState(false);

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
    const [activePage, setActivePage] = useState<number>(1);
    const [maxItemsPerPage, setMaxItemsPerPage] = useState(defaultMaxItemsPerPage);

    const variables = useMemo(
        () => ((leadId && projectId) ? ({
            leadId,
            projectId,
            page: activePage,
            pageSize: maxItemsPerPage,
        }) : undefined),
        [
            leadId,
            projectId,
            activePage,
            maxItemsPerPage,
        ],
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
    const leadPreviewAttachments = leadPreviewData?.project?.leadPreviewAttachments?.results;
    const leadPreviewCount = leadPreviewData?.project?.leadPreviewAttachments?.totalCount;

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
                leadAttachment: leadAttachmentId,
            });
        }
        if (fullScreenMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }, [
        fullScreenMode,
        capturedImageUrl,
        leadId,
        leadAttachmentId,
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

    const handleAttachmentClick = useCallback((selectedAttachment: string) => {
        if (onEntryCreate) {
            onEntryCreate({
                clientId: randomString(),
                entryType: 'ATTACHMENT',
                lead: leadId,
                leadAttachment: selectedAttachment,
                excerpt: '',
                droppedExcerpt: '',
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

    const entriesWithLeadAttachments = useMemo(() => (listToMap(
        entries?.filter((entry) => isDefined(entry.leadAttachment)),
        (entry) => entry.leadAttachment ?? '',
        (entry) => entry.clientId,
    )), [entries]);

    const allEntriesWithLeadAttachments = entries?.filter(
        (entry) => isDefined(entry.entryAttachment?.leadAttachmentId),
    );

    const leadAttachmentIdsToExclude = useMemo(
        () => ([
            ...Object.keys(entriesWithLeadAttachments ?? {}),
            ...(allEntriesWithLeadAttachments ?? []),
        ]), [entriesWithLeadAttachments, allEntriesWithLeadAttachments],
    );

    const entryItemRendererParams = useCallback((
        entryId: string,
        entry: EntryInput,
        index: number,
    ) => ({
        ...entry,
        entryId: entry.clientId,
        index,
        entryServerId: entry.id,
        isActive: activeEntry === entry.clientId,
        projectId,
        onClick: onEntryClick,
        onExcerptChange,
        onEntryDelete,
        onEntryRestore,
        leadAttachmentImage: entry?.leadAttachment ? leadPreviewAttachments?.find(
            (attachment) => attachment.id === entry.leadAttachment,
        ) : undefined,
        entryImage: entry?.image ? entryImagesMap?.[entry.image] : undefined,
        entryAttachment: entry?.entryAttachment
            ? entryAttachmentsMap?.[entry.entryAttachment] : undefined,
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
        leadPreviewAttachments,
        entryAttachmentsMap,
    ]);

    const leadAttachmentItemRendererParams = useCallback((
        attachmentId: string,
        attachment: LeadPreviewAttachmentType,
        index: number,
    ) => ({
        ...attachment,
        attachmentId: attachment.id,
        index,
        entryServerId: attachment?.id,
        isActive: isDefined(activeEntry)
            && activeEntry === entriesWithLeadAttachments?.[attachment.id],
        entryId: entriesWithLeadAttachments?.[attachmentId],
        onClick: handleAttachmentClick,
        onApproveButtonClick,
        onDiscardButtonClick,
        className: styles.entryItem,
        disableClick: isEntrySelectionActive,
        errored: entriesError?.[attachmentId],
        data: attachment,
    }), [
        handleAttachmentClick,
        onApproveButtonClick,
        entriesError,
        onDiscardButtonClick,
        activeEntry,
        isEntrySelectionActive,
        entriesWithLeadAttachments,
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
                    {!fullScreenMode && isDefined(onEntryCreate) && (
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
                    {isDefined(onEntryCreate) && (
                        showScreenshot ? (
                            <>
                                <QuickActionButton
                                    name={undefined}
                                    title="Close"
                                    onClick={setShowScreenshotFalse}
                                >
                                    <IoClose />
                                </QuickActionButton>
                                {capturedImageUrl && (
                                    <>
                                        <QuickActionButton
                                            title="Draw over screenshot"
                                            name={undefined}
                                            onClick={handleCanvasDrawClick}
                                        >
                                            <IoBrush />
                                        </QuickActionButton>
                                        {isDefined(onEntryCreate) && (
                                            <QuickActionButton
                                                name={undefined}
                                                title="Finalize screenshot"
                                                onClick={handleCreateEntryButtonClick}
                                            >
                                                <IoCheckmark />
                                            </QuickActionButton>
                                        )}
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
                        )
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

    const [
        textZoomValue,
        setTextZoomValue,
    ] = useState<number | undefined>(2);
    const handleTextZoomOut = useCallback(() => {
        setTextZoomValue((prev) => {
            if (isNotDefined(prev)) {
                return undefined;
            }
            if (prev <= 1) {
                return 1;
            }
            return (prev - 1);
        });
    }, []);

    const handleTextZoomIn = useCallback(() => {
        setTextZoomValue((prev) => {
            if (isNotDefined(prev)) {
                return undefined;
            }
            if (prev >= 5) {
                return 5;
            }
            return (prev + 1);
        });
    }, []);

    const assistedTaggingShown = isAssistedTaggingAccessible
        && frameworkDetails?.assistedTaggingEnabled
        && (frameworkDetails?.predictionTagsMapping?.length ?? 0) > 0;

    const isAutoExtractionCompatible = isDefined(leadPreview?.textExtractionId)
        && assistedTaggingShown;

    const errorMessageForAutoExtraction = useMemo(() => {
        if (isAutoExtractionCompatible) {
            return undefined;
        }
        if (isDefined(leadPreviewData?.project?.lead?.connectorLead)) {
            return 'The feature to extract entries through Natural Language Processing (NLP) is currently unavailable for the selected source. The connector associated with the chosen source may be outdated or incompatible with the NLP extraction functionality.';
        }
        if (leadPreviewData?.project?.lead?.extractionStatus !== 'SUCCESS') {
            return 'The feature to extract entries through Natural Language Processing (NLP) is currently unavailable for the selected source. The content from the selected source could not be adequately simplified for NLP extraction, possibly due to complex language structures or formatting issues.';
        }
        return 'The feature to extract entries through Natural Language Processing (NLP) is currently unavailable for the selected source. The selected source appears to be outdated, and the NLP extraction feature is not compatible with older content formats.';
    }, [
        isAutoExtractionCompatible,
        leadPreviewData?.project?.lead,
    ]);

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
                    <Tab
                        name="visuals"
                        disabled={isEntrySelectionActive}
                    >
                        Tables & Visuals
                    </Tab>
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
                        <>
                            <div className={styles.simplifiedHeader}>
                                {!isEntrySelectionActive && assistedTaggingShown && (
                                    <div className={styles.extraction}>
                                        <Button
                                            className={styles.autoEntriesButton}
                                            name={undefined}
                                            title={!isAutoExtractionCompatible
                                                ? 'Ooops. Looks like this source does not support Auto extraction at the moment. Please try it with a new source.'
                                                : 'Extract entries for this source'}
                                            onClick={showAutoEntriesModal}
                                            variant="nlp-tertiary"
                                            spacing="compact"
                                            disabled={!isAutoExtractionCompatible}
                                        >
                                            NLP Extract and Classify
                                        </Button>
                                        {isDefined(errorMessageForAutoExtraction) && (
                                            <div className={styles.info}>
                                                <IoInformation />
                                                <Tooltip>
                                                    {errorMessageForAutoExtraction}
                                                </Tooltip>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={styles.actions}>
                                    <QuickActionButton
                                        name={undefined}
                                        className={styles.zoom}
                                        variant="general"
                                        onClick={handleTextZoomOut}
                                        disabled={isNotDefined(textZoomValue) || textZoomValue <= 1}
                                    >
                                        <MdOutlineZoomOut />
                                    </QuickActionButton>
                                    <QuickActionButton
                                        name={undefined}
                                        className={styles.zoom}
                                        variant="general"
                                        onClick={handleTextZoomIn}
                                        disabled={isNotDefined(textZoomValue) || textZoomValue >= 5}
                                    >
                                        <MdOutlineZoomIn />
                                    </QuickActionButton>
                                </div>
                            </div>
                            {(leadPreview?.textExtract?.length ?? 0) > 0 ? (
                                <SimplifiedTextView
                                    className={styles.simplifiedTextView}
                                    activeEntryClientId={activeEntry}
                                    projectId={projectId}
                                    onExcerptClick={onEntryClick}
                                    entries={entries}
                                    onAddButtonClick={onEntryCreate
                                        ? handleExcerptAddFromSimplified
                                        : undefined}
                                    // attachmentData={leadPreviewAttachments}
                                    onAssistedEntryAdd={onAssistedEntryAdd}
                                    text={leadPreview?.textExtract}
                                    onExcerptChange={onExcerptChange}
                                    onApproveButtonClick={onApproveButtonClick}
                                    onDiscardButtonClick={onDiscardButtonClick}
                                    onEntryDelete={onEntryDelete}
                                    onEntryRestore={onEntryRestore}
                                    disableAddButton={isEntrySelectionActive}
                                    disableExcerptClick={isEntrySelectionActive}
                                    assistedTaggingEnabled={!!assistedTaggingShown}
                                    frameworkDetails={frameworkDetails}
                                    leadId={leadId}
                                    textZoomValue={textZoomValue}
                                />
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
                        </>
                    </TabPanel>
                )}
                <TabPanel
                    name="visuals"
                    activeClassName={styles.entryListTab}
                    retainMount="lazy"
                >
                    <Container
                        contentClassName={styles.tableVisualsTab}
                        headerIcons={(
                            <Switch
                                label="Hide Created entries"
                                onChange={handleToggle}
                                name=""
                                value={showResults}
                            />
                        )}
                        footerActions={(
                            <Pager
                                activePage={activePage}
                                itemsCount={leadPreviewCount ?? 0}
                                maxItemsPerPage={maxItemsPerPage}
                                onActivePageChange={setActivePage}
                                onItemsPerPageChange={setMaxItemsPerPage}
                            />
                        )}
                    >
                        <ListView
                            spacing="comfortable"
                            direction="vertical"
                            data={leadPreviewAttachments}
                            renderer={TablesAndVisualsItem}
                            rendererParams={leadAttachmentItemRendererParams}
                            className={styles.entryList}
                            keySelector={leadAttachmentKeySelector}
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
                    </Container>
                </TabPanel>
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
            {autoEntriesModalShown && isDefined(projectId) && frameworkDetails && (
                <AutoEntriesModal
                    createdEntries={entries}
                    onModalClose={hideAutoEntriesModal}
                    projectId={projectId}
                    onAssistedEntryAdd={onAssistedEntryAdd}
                    leadId={leadId}
                    frameworkDetails={frameworkDetails}
                />
            )}
        </div>
    );
}

export default LeftPane;
