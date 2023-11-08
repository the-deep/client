import React, { useContext, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    IoCopyOutline,
    IoTrashBinOutline,
    IoDownloadOutline,
} from 'react-icons/io5';
import {
    useAlert,
    Container,
    ContainerCard,
    Button,
    ListView,
    QuickActionConfirmButton,
    QuickActionButton,
    ExpandableContainer,
    Kraken,
    TextOutput,
    DateRangeOutput,
    PendingMessage,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';

import {
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    LabelList,
    Bar,
} from 'recharts';

import ProgressLine from '#components/ProgressLine';
import { ProjectContext } from '#base/context/ProjectContext';
import {
    useModalState,
} from '#hooks/stateManagement';

import {
    PillarSummary,
} from '#types';
import {
    CreateAnalysisExportMutation,
    CreateAnalysisExportMutationVariables,
} from '#generated/types';

import _ts from '#ts';
import PillarAnalysisList from './PillarList';
import PillarAssignment from './PillarAssignment';
import AnalysisCloneModal from './AnalysisCloneModal';
import ReportsModal from '../ReportsModal';

import styles from './styles.css';

const CREATE_ANALYSIS_EXPORT = gql`
    mutation CreateAnalysisExport(
        $projectId: ID!,
        $data: ExportCreateInputType!,
    )
    {
        project(id: $projectId) {
            id
            exportCreate(data: $data) {
                ok
                errors
            }
        }
    }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    const radius = 10;
    if (value === 0) {
        return null;
    }

    return (
        <g>
            <text
                className={styles.barLabel}
                x={x + (width / 2)}
                y={y - radius}
            >
                {`${Math.round(value)}%`}
            </text>
        </g>
    );
};

const barChartMargin = {
    top: 5,
    right: 30,
    left: 20,
    bottom: 5,
};
const BAR_TICK_COUNT = 5;
const MAX_BAR_SIZE = 16;

interface ComponentProps {
    analysisId: number;
    className?: string;
    title: string;
    startDate?: string;
    endDate: string;
    onEdit: (analysisId: number) => void;
    onAnalysisPillarDelete: () => void;
    onAnalysisCloseSuccess: () => void;
    teamLeadName: string;
    createdAt: string;
    modifiedAt: string;
    onDelete: (value: number) => void;
    pendingAnalysisDelete: boolean;
    pillars: PillarSummary[];
    pillarsPending: boolean;
    totalEntries: number;
    totalSources: number;
    analyzedEntries: number;
    analyzedSources: number;
}

const pillarSummaryKeySelector = (item: PillarSummary) => (item.id);

function Analysis(props: ComponentProps) {
    const {
        title,
        modifiedAt,
        className,
        startDate,
        endDate,
        analysisId,
        teamLeadName,
        onAnalysisPillarDelete,
        onAnalysisCloseSuccess,
        pillars,
        pillarsPending,
        createdAt,
        onEdit,
        onDelete,
        pendingAnalysisDelete,
        analyzedEntries,
        analyzedSources,
        totalEntries,
        totalSources,
    } = props;

    const {
        project,
    } = useContext(ProjectContext);

    const activeProject = project?.id;

    const [
        showCloneModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const [
        reportsModalVisible,
        showReportsModal,
        hideReportsModal,
    ] = useModalState(false);

    const alert = useAlert();

    const pillarAssignmentRendererParams = useCallback(
        (_: number, data: PillarSummary) => ({
            assigneeName: data.assigneeDetails.displayName,
            pillarTitle: data.title,
            analyzedEntries: data.analyzedEntries,
            totalEntries,
        }),
        [totalEntries],
    );

    const [
        createAnalysisExport,
        {
            loading: createExportPending,
        },
    ] = useMutation<CreateAnalysisExportMutation, CreateAnalysisExportMutationVariables>(
        CREATE_ANALYSIS_EXPORT,
        {
            onCompleted: (response) => {
                if (response?.project?.exportCreate?.ok) {
                    alert.show(
                        'Successfully started analysis export! You can find your export under the exports tab.',
                        { variant: 'success' },
                    );
                } else {
                    alert.show(
                        'There was an issue with exporting this analysis.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'There was an issue with exporting this analysis.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleAnalysisExport = useCallback(() => {
        if (!activeProject) {
            return;
        }
        createAnalysisExport({
            variables: {
                projectId: activeProject,
                data: {
                    analysis: String(analysisId),
                    exportType: 'EXCEL' as const,
                    format: 'XLSX' as const,
                    type: 'ANALYSES' as const,
                    filters: {},
                },
            },
        });
    }, [activeProject, analysisId, createAnalysisExport]);

    const handleDeleteAnalysis = useCallback(() => {
        onDelete(analysisId);
    }, [analysisId, onDelete]);

    const barChartData = useMemo(() => (
        pillars.map((o) => ({
            ...o,
            percent: Math.round(
                ((o.analyzedEntries ?? 0) / (totalEntries === 0 ? 1 : totalEntries)) * 10000,
            ) / 100,
        }))
    ), [pillars, totalEntries]);

    const disabled = pendingAnalysisDelete;

    const handleCloneSuccess = useCallback(() => {
        onAnalysisCloseSuccess();
        setModalHidden();
    }, [onAnalysisCloseSuccess, setModalHidden]);

    const canTagEntry = project?.analysisFramework?.id
        && project?.allowedPermissions?.includes('UPDATE_ENTRY');

    return (
        <ContainerCard
            className={_cs(className, styles.analysisItem)}
            heading={title}
            borderBelowHeader
            borderBelowHeaderWidth="thin"
            headingSize="small"
            headerDescription={(
                <DateRangeOutput
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
            headerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="tertiary"
                        onClick={showReportsModal}
                    >
                        Reports
                    </Button>
                    {canTagEntry && (
                        <>
                            <Button
                                name={analysisId}
                                onClick={onEdit}
                                disabled={disabled}
                                variant="tertiary"
                                icons={(
                                    <FiEdit2 />
                                )}
                            >
                                {_ts('analysis', 'editAnalysisTitle')}
                            </Button>
                            <QuickActionButton
                                name="clone"
                                onClick={setModalVisible}
                                disabled={disabled}
                                title={_ts('analysis', 'cloneAnalysisButtonTitle')}
                                variant="secondary"
                            >
                                <IoCopyOutline />
                            </QuickActionButton>
                            <QuickActionButton
                                name="analysis"
                                onClick={handleAnalysisExport}
                                disabled={createExportPending}
                                title="Export"
                                variant="secondary"
                            >
                                <IoDownloadOutline />
                            </QuickActionButton>

                            <QuickActionConfirmButton
                                name="delete"
                                onConfirm={handleDeleteAnalysis}
                                disabled={disabled}
                                title={_ts('analysis', 'deleteAnalysisButtonTitle')}
                                message={_ts('analysis', 'deleteAnalysisConfirmMessage')}
                                variant="secondary"
                                showConfirmationInitially={false}
                            >
                                <IoTrashBinOutline />
                            </QuickActionConfirmButton>
                        </>
                    )}
                </>
            )}
            contentClassName={styles.content}
        >
            {pendingAnalysisDelete && <PendingMessage />}
            <div className={styles.analysisDetails}>
                <div className={styles.metaSection}>
                    <TextOutput
                        className={styles.teamLeadName}
                        label={_ts('analysis', 'teamLead')}
                        value={teamLeadName}
                        hideLabelColon
                        block
                    />
                    <TextOutput
                        className={styles.pillarAssignments}
                        label={_ts('analysis', 'pillarAssignments')}
                        valueContainerClassName={styles.overflowWrapper}
                        block
                        hideLabelColon
                        value={(
                            <ListView
                                className={styles.pillarAssignmentList}
                                data={pillars}
                                renderer={PillarAssignment}
                                rendererParams={pillarAssignmentRendererParams}
                                keySelector={pillarSummaryKeySelector}
                                filtered={false}
                                errored={false}
                                pending={pillarsPending}
                                emptyIcon={(
                                    <Kraken
                                        variant="search"
                                    />
                                )}
                                emptyMessage="No Pillar analyses found under this analysis."
                                messageShown
                                messageIconShown
                            />
                        )}
                    />
                </div>
                <ContainerCard
                    className={styles.overviewContainer}
                    heading={_ts('analysis', 'overviewSectionHeader')}
                    headingSize="extraSmall"
                    contentClassName={styles.overviewContent}
                >
                    <ProgressLine
                        progress={(analyzedSources / totalSources) * 100}
                        title={_ts('analysis', 'sourcesAnalyzedLabel')}
                        variant="complement1"
                    />
                    <ProgressLine
                        progress={(analyzedEntries / totalEntries) * 100}
                        title={_ts('analysis', 'entriesAnalyzedLabel')}
                        variant="complement2"
                    />
                </ContainerCard>
                <Container
                    className={styles.frameworkOverviewContainer}
                    heading={_ts('analysis', 'frameworkOverviewHeader')}
                    headingSize="extraSmall"
                    contentClassName={styles.frameworkOverviewContent}
                >
                    <ResponsiveContainer className={styles.responsiveContainer}>
                        <BarChart
                            data={barChartData}
                            margin={barChartMargin}
                        >
                            <XAxis
                                dataKey="title"
                                axisLine={false}
                                tickLine={false}
                            />
                            <CartesianGrid
                                vertical={false}
                                stroke="var(--dui-color-background-information)"
                            />
                            <YAxis
                                axisLine={false}
                                domain={[0, 100]}
                                tickCount={BAR_TICK_COUNT}
                                tickLine={false}
                            />
                            <Tooltip
                                isAnimationActive={false}
                            />
                            <Bar
                                dataKey="percent"
                                name="Completion Percentage"
                                fill="var(--dui-color-accent)"
                                background={{
                                    fill: 'var(--dui-color-background-information)',
                                }}
                                maxBarSize={MAX_BAR_SIZE}
                            >
                                <LabelList
                                    // NOTE: LabelList required data for some reason
                                    data={[]}
                                    dataKey="percent"
                                    content={renderCustomizedLabel}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Container>
            </div>
            <ExpandableContainer
                className={styles.pillarAnalyses}
                headerClassName={styles.pillarAnalysesHeader}
                heading={_ts('analysis', 'pillarAnalysisCount', { count: pillars.length })}
                headingSize="extraSmall"
                alwaysMountedContent={false}
                contentClassName={styles.pillarAnalysisList}
            >
                {activeProject && (
                    <PillarAnalysisList
                        createdAt={createdAt}
                        analysisId={analysisId}
                        modifiedAt={modifiedAt}
                        activeProject={activeProject}
                        onAnalysisPillarDelete={onAnalysisPillarDelete}
                        totalEntries={totalEntries}
                    />
                )}
            </ExpandableContainer>
            {showCloneModal && activeProject && (
                <AnalysisCloneModal
                    onClose={setModalHidden}
                    projectId={activeProject}
                    analysisId={analysisId}
                    onClone={handleCloneSuccess}
                />
            )}
            {reportsModalVisible && activeProject && (
                <ReportsModal
                    onCloseButtonClick={hideReportsModal}
                    analysisId={String(analysisId)}
                    projectId={activeProject}
                />
            )}
        </ContainerCard>
    );
}

export default Analysis;
