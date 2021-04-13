import React, { useCallback, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import {
    listToGroupList,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Heading,
    Button,
    TextArea,
} from '@the-deep/deep-ui';

import ListView from '#rsu/../v2/View/ListView';
import Pager from '#rscv/Pager';
import FullPageHeader from '#dui/FullPageHeader';
import { breadcrumb } from '#utils/safeCommon';
import BackLink from '#dui/BackLink';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { processEntryFilters } from '#entities/entries';
import Tabs, { Tab, TabList, TabPanel } from '#dui/Tabs';

import useRequest from '#utils/request';
import _ts from '#ts';
import { notifyOnFailure } from '#utils/requestNotify';

import {
    GeoOptions,
    MultiResponse,
    EntryFields,
    FrameworkFields,
    PillarAnalysisElement,
    ProjectDetails,
    AppState,
} from '#typings';

import {
    projectIdFromRouteSelector,
    analysisIdFromRouteSelector,
    pillarAnalysisIdFromRouteSelector,
    activeProjectFromStateSelector,
} from '#redux';
import EntriesFilterForm from './EntriesFilterForm';
import EntryItem from './EntryItem';

import styles from './styles.scss';

type EntryFieldsMin = Pick<
    EntryFields,
    'id' | 'excerpt' | 'droppedExcerpt' | 'image' | 'entryType' | 'tabularFieldData'
>;

const mapStateToProps = (state: AppState) => ({
    pillarId: pillarAnalysisIdFromRouteSelector(state),
    analysisId: analysisIdFromRouteSelector(state),
    projectId: projectIdFromRouteSelector(state),
    activeProject: activeProjectFromStateSelector(state),
});

interface PageProps {
    pillarId: number;
    projectId: number;
    analysisId: number;
    activeProject: ProjectDetails;
}

const frameworkQueryFields = {
    fields: ['widgets', 'filters', 'id'],
};

type TabNames = 'entries' | 'discarded';

export interface FaramValues {
    [key: string]: string | string[] | FaramValues;
}

const maxItemsPerPage = 5;
const entryKeySelector = (d: EntryFieldsMin) => d.id;

function PillarAnalysis(props: PageProps) {
    const {
        pillarId,
        analysisId,
        projectId,
        activeProject,
    } = props;

    const [value, setValue] = useState<string | undefined>();
    const [activeTab, setActiveTab] = useState<TabNames>('entries');
    const [filtersValue, setFiltersValue] = useState<FaramValues>({});
    const [entries, setEntries] = useState<EntryFieldsMin[]>([]);

    const [activePage, setActivePage] = useState(1);
    const [entriesCount, setEntriesCount] = useState(0);

    const [
        pendingPillarAnalysis,
        pillarAnalysis,
        ,
        ,
    ] = useRequest<PillarAnalysisElement>({
        url: `server://projects/${projectId}/analysis/${analysisId}/pillars/${pillarId}/`,
        method: 'GET',
        autoTrigger: true,
        onSuccess: (response) => {
            if (isDefined(response)) {
                const newFilters = listToGroupList(
                    response.filters,
                    o => o.key,
                    o => o.id,
                );
                setFiltersValue(newFilters);
            }
        },
    });

    const [
        pendingFramework,
        framework,
    ] = useRequest<Partial<FrameworkFields>>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        query: frameworkQueryFields,
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('analysis.editModal', 'frameworkTitle'))({ error: errorBody });
        },
    });

    const geoOptionsRequestQueryParams = useMemo(() => ({
        project: projectId,
    }), [projectId]);

    const [
        pendingGeoOptions,
        geoOptions,
    ] = useRequest<GeoOptions>({
        url: 'server://geo-options/',
        method: 'GET',
        query: geoOptionsRequestQueryParams,
        schemaName: 'geoOptions',
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('export', 'geoLabel'))({ error: errorBody });
        },
    });

    const entriesRequestBody = useMemo(() => {
        if (isNotDefined(framework) || isNotDefined(geoOptions)) {
            return {};
        }

        const otherFilters = {
            project: projectId,
        };

        const processedFilters = processEntryFilters(
            filtersValue,
            framework,
            geoOptions,
        );

        return ({
            filters: [
                ...processedFilters,
                ...Object.entries(otherFilters),
            ],
        });
    }, [geoOptions, filtersValue, framework, projectId]);

    const entriesRequestQuery = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
        fields: [
            'id',
            'excerpt',
            'dropped_excerpt',
            'image',
            'entry_type',
            'tabular_field_data',
        ],
    }), [activePage]);

    const [pendingEntries] = useRequest<MultiResponse<EntryFieldsMin>>({
        url: 'server://entries/filter/',
        method: 'POST',
        body: entriesRequestBody,
        query: entriesRequestQuery,
        autoTrigger: true,
        onSuccess: (response) => {
            setEntriesCount(response.count);
            setEntries(response.results);
        },
        autoTriggerDisabled: pendingPillarAnalysis || pendingFramework,
    });

    const entryCardRendererParams = useCallback((key, data) => ({
        entryId: key,
        excerpt: data.excerpt,
        image: data.image,
        tabularFieldData: data.tabularFieldData,
        type: data.entryType,
    }), []);

    const pending = pendingPillarAnalysis || pendingGeoOptions || pendingFramework;

    return (
        <div className={styles.pillarAnalysis}>
            <FullPageHeader
                className={styles.header}
                actionsClassName={styles.actions}
                contentClassName={styles.breadcrumb}
                heading={activeProject?.title}
                actions={(
                    <>
                        <Button
                            className={styles.button}
                            variant="primary"
                        >
                            {_ts('pillarAnalysis', 'saveButtonLabel')}
                        </Button>
                        <BackLink
                            className={styles.button}
                            defaultLink="/"
                        >
                            {_ts('pillarAnalysis', 'closeButtonLabel')}
                        </BackLink>
                    </>
                )}
            >
                {breadcrumb(pillarAnalysis?.analysisName, pillarAnalysis?.title ?? '')}
            </FullPageHeader>
            <div className={styles.content}>
                {pending && <LoadingAnimation />}
                <div className={styles.inputsContainer}>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'mainStatementLabel')}
                        </Heading>
                        <TextArea
                            value={value}
                            onChange={setValue}
                            rows={10}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'infoGapLabel')}
                        </Heading>
                        <TextArea
                            value={value}
                            onChange={setValue}
                            rows={10}
                        />
                    </div>
                </div>
                <EntriesFilterForm
                    className={styles.entriesFilter}
                    filtersValue={filtersValue}
                    geoOptions={geoOptions}
                    regions={activeProject?.regions}
                    onFiltersValueChange={setFiltersValue}
                    filters={framework?.filters}
                    widgets={framework?.widgets}
                    projectId={projectId}
                />
                <div className={styles.workspace}>
                    <div className={styles.leftContainer}>
                        <Tabs
                            value={activeTab}
                            onChange={setActiveTab}
                        >
                            <TabList className={styles.header}>
                                <Tab name="entries">
                                    {_ts('pillarAnalysis', 'entriesTabLabel')}
                                </Tab>
                                <Tab
                                    name="discarded"
                                    disabled
                                >
                                    {_ts('pillarAnalysis', 'discardedEntriesTabLabel')}
                                </Tab>
                            </TabList>
                            <TabPanel
                                className={styles.entries}
                                name="entries"
                            >
                                <ListView
                                    data={entries}
                                    keySelector={entryKeySelector}
                                    renderer={EntryItem}
                                    rendererParams={entryCardRendererParams}
                                    pending={pendingEntries}
                                />
                            </TabPanel>
                            <TabPanel name="discarded">
                                {/* NOTE: This is a dummy text */}
                                Discarded entries go here
                            </TabPanel>
                        </Tabs>
                        <Pager
                            className={styles.pager}
                            activePage={activePage}
                            itemsCount={entriesCount}
                            maxItemsPerPage={maxItemsPerPage}
                            onPageClick={setActivePage}
                            showItemsPerPageChange={false}
                        />
                    </div>
                    <div className={styles.rightContainer}>
                        {/* NOTE: This is a dummy text */}
                        Workspace goes here
                    </div>
                </div>
            </div>
        </div>
    );
}

export default connect(mapStateToProps)(PillarAnalysis);
