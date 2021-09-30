import React, { useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    IoCopyOutline,
    IoTrashBinOutline,
} from 'react-icons/io5';
import {
    Container,
    ContainerCard,
    Button,
    ListView,
    QuickActionConfirmButton,
    QuickActionButton,
    ExpandableContainer,
    TextOutput,
    DateRangeOutput,
    PendingMessage,
} from '@the-deep/deep-ui';
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

import ProgressLine from '#newComponents/viz/ProgressLine';
import Cloak from '#components/general/Cloak';
import {
    useModalState,
} from '#hooks/stateManagement';

import {
    AppState,
    PillarSummary,
} from '#types';

import _ts from '#ts';
import { activeProjectIdFromStateSelector } from '#redux';
import PillarAnalysisList from './PillarList';
import PillarAssignment from './PillarAssignment';
import AnalysisCloneModal from './AnalysisCloneModal';

import styles from './styles.scss';

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

function shouldHideEdit({
    hasAnalysisFramework,
    entryPermissions,
}: {
    hasAnalysisFramework: boolean;
    entryPermissions: {
        create: boolean;
        modify: boolean;
    };
}) {
    return (!hasAnalysisFramework || !(entryPermissions.create || entryPermissions.modify));
}


interface ComponentProps {
    analysisId: number;
    className?: string;
    title: string;
    startDate?: string;
    endDate: string;
    activeProject: number;
    onEdit: (analysisId: number) => void;
    onAnalysisPillarDelete: () => void;
    onAnalysisCloseSuccess: () => void;
    teamLeadName: string;
    createdAt: string;
    modifiedAt: string;
    onDelete: (value: number) => void;
    pendingAnalysisDelete: boolean;
    pillars: PillarSummary[];
    totalEntries: number;
    totalSources: number;
    analyzedEntries: number;
    analyzedSources: number;
}

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

const pillarSummaryKeySelector = (item: PillarSummary) => (item.id);

function Analysis(props: ComponentProps) {
    const {
        title,
        modifiedAt,
        className,
        startDate,
        endDate,
        activeProject,
        analysisId,
        teamLeadName,
        onAnalysisPillarDelete,
        onAnalysisCloseSuccess,
        pillars,
        createdAt,
        onEdit,
        onDelete,
        pendingAnalysisDelete,
        analyzedEntries,
        analyzedSources,
        totalEntries,
        totalSources,
    } = props;

    const [
        showCloneModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const pillarAssignmentRendererParams = useCallback(
        (_: number, data: PillarSummary) => ({
            assigneeName: data.assigneeDetails.displayName,
            pillarTitle: data.title,
            analyzedEntries: data.analyzedEntries,
            totalEntries,
        }),
        [totalEntries],
    );

    const handleDeleteAnalysis = useCallback(() => {
        onDelete(analysisId);
    }, [analysisId, onDelete]);

    const barChartData = useMemo(() => (
        pillars.map(o => ({
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

    return (
        <ContainerCard
            className={_cs(className, styles.analysisItem)}
            heading={title}
            headingSize="small"
            headerDescription={(
                <DateRangeOutput
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
            headerActions={(
                <Cloak
                    hide={shouldHideEdit}
                    render={(
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
                />
            )}
            horizontallyCompactContent
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
                            />
                        )}
                    />
                </div>
                <ContainerCard
                    className={styles.overviewContainer}
                    heading={_ts('analysis', 'overviewSectionHeader')}
                    headerClassName={styles.overviewHeader}
                    headingSize="small"
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
                    headingSize="small"
                    horizontallyCompactContent
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
                sub
                alwaysMountContent={false}
                contentClassName={styles.pillarAnalysisList}
            >
                <PillarAnalysisList
                    createdAt={createdAt}
                    analysisId={analysisId}
                    modifiedAt={modifiedAt}
                    activeProject={activeProject}
                    onAnalysisPillarDelete={onAnalysisPillarDelete}
                    totalEntries={totalEntries}
                />
            </ExpandableContainer>
            {showCloneModal && (
                <AnalysisCloneModal
                    onClose={setModalHidden}
                    projectId={activeProject}
                    analysisId={analysisId}
                    onClone={handleCloneSuccess}
                />
            )}
        </ContainerCard>
    );
}

export default connect(mapStateToProps)(Analysis);
