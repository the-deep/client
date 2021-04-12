import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { IoAdd } from 'react-icons/io5';
import { Dispatch } from 'redux';
import { isNotDefined, isDefined, randomString } from '@togglecorp/fujs';
import {
    Heading,
    Button,
    QuickActionButton,
    TextArea,
} from '@the-deep/deep-ui';
import {
    PartialForm,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import ListView from '#rsu/../v2/View/ListView';
import Pager from '#rscv/Pager';
import FullPageHeader from '#dui/FullPageHeader';
import { breadcrumb } from '#utils/safeCommon';
import BackLink from '#dui/BackLink';
// import LoadingAnimation from '#rscv/LoadingAnimation';
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
    editPillarAnalysisPillarAnalysisSelector,
    setPillarAnalysisDataAction,
} from '#redux';
import EntriesFilterForm from './EntriesFilterForm';
import EntryItem from './EntryItem';
import AnalyticalStatementInput from './AnalyticalStatementInput';
import { schema, defaultFormValues, AnalyticalStatementType } from './schema';

import styles from './styles.scss';

type EntryFieldsMin = Pick<
    EntryFields,
    'id' | 'excerpt' | 'droppedExcerpt' | 'image' | 'entryType' | 'tabularFieldData'
>;

type TabNames = 'entries' | 'discarded';

// FIXME: remove this
export interface FaramValues {
    [key: string]: string | string[] | FaramValues;
}

const frameworkQueryFields = {
    fields: ['widgets', 'filters', 'id'],
};

const maxItemsPerPage = 5;

const entryKeySelector = (d: EntryFieldsMin) => d.id;

const mapStateToProps = (state: AppState, props: unknown) => ({
    // FIXME: get this from url directly
    pillarId: pillarAnalysisIdFromRouteSelector(state),
    analysisId: analysisIdFromRouteSelector(state),
    projectId: projectIdFromRouteSelector(state),

    // FIXME: get this from request
    activeProject: activeProjectFromStateSelector(state),

    pillarAnalysis: editPillarAnalysisPillarAnalysisSelector(state, props),
});

interface PropsFromDispatch {
    setPillarAnalysisData: typeof setPillarAnalysisDataAction;
}

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setPillarAnalysisData: params => dispatch(setPillarAnalysisDataAction(params)),
});

interface PropsFromState {
    pillarId: number;
    projectId: number;
    analysisId: number;

    activeProject: ProjectDetails;
    pillarAnalysis: {
        id: number;
        data: typeof defaultFormValues;
    } | undefined;
}

interface PageProps {
}

function PillarAnalysis(props: PageProps & PropsFromState & PropsFromDispatch) {
    const {
        pillarId,
        analysisId,
        projectId,
        activeProject,
        pillarAnalysis: pillarAnalysisFromProps,
        setPillarAnalysisData,
    } = props;

    // FIXME: set initial pristine value on form

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(pillarAnalysisFromProps?.data ?? defaultFormValues, schema);

    useEffect(
        () => {
            setPillarAnalysisData({
                id: pillarId,
                data: value,
                pristine,
            });
        },
        [value, pillarId, setPillarAnalysisData, pristine],
    );

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            onErrorSet(err);
            if (!errored && isDefined(val)) {
                console.warn('Save', val);
            }
        },
        [onErrorSet, validate],
    );

    const {
        onValueChange: onAnalyticalStatementChange,
        onValueRemove: onAnalyticalStatementRemove,
    } = useFormArray('analyticalStatements', value.analyticalStatements ?? [], onValueChange);

    const handleAnalyticalStatementAdd = useCallback(
        () => {
            const uuid = randomString();
            const newAnalyticalStatement: PartialForm<AnalyticalStatementType> = {
                uuid,
                // FIXME: add order
                order: 0,
            };
            onValueChange(
                [...(value.analyticalStatements ?? []), newAnalyticalStatement],
                'analyticalStatements' as const,
            );
        },
        [onValueChange, value.analyticalStatements],
    );

    // const [value, setValue] = useState<string | undefined>();
    const [activeTab, setActiveTab] = useState<TabNames>('entries');

    // FIXME: please use new form
    const [filtersValue, setFiltersValue] = useState<FaramValues>({});
    const [activePage, setActivePage] = useState(1);

    // FIXME: these are useless
    const [entriesCount, setEntriesCount] = useState(0);
    const [entries, setEntries] = useState<EntryFieldsMin[]>([]);

    const [
        pendingPillarAnalysis,
        pillarAnalysis,
    ] = useRequest<PillarAnalysisElement>({
        url: `server://projects/${projectId}/analysis/${analysisId}/pillars/${pillarId}/`,
        method: 'GET',
        autoTrigger: true,
        // FIXME: add schema
        // FIXME: add failure
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
        // FIXME: add schema
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

    // const pending = pendingPillarAnalysis || pendingGeoOptions || pendingFramework;

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
                            name={undefined}
                            className={styles.button}
                            variant="primary"
                            disabled={pristine || pendingPillarAnalysis}
                            onClick={handleSubmit}
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
                {breadcrumb(pillarAnalysis?.analysisTitle, pillarAnalysis?.title ?? '')}
            </FullPageHeader>
            <div className={styles.content}>
                {error?.$internal && (
                    <p>
                        {error?.$internal}
                    </p>
                )}
                <div className={styles.inputsContainer}>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'mainStatementLabel')}
                        </Heading>
                        <TextArea
                            name="mainStatement"
                            onChange={onValueChange}
                            value={value.mainStatement}
                            error={error?.fields?.mainStatement}
                            rows={6}
                            disabled={pendingPillarAnalysis}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'infoGapLabel')}
                        </Heading>
                        <TextArea
                            name="informationGap"
                            value={value.informationGap}
                            onChange={onValueChange}
                            error={error?.fields?.informationGap}
                            rows={6}
                            disabled={pendingPillarAnalysis}
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
                    disabled={pendingFramework || pendingGeoOptions}
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
                        {value.analyticalStatements?.map((analyticalStatement, index) => (
                            <AnalyticalStatementInput
                                className={styles.analyticalStatement}
                                key={analyticalStatement.uuid}
                                index={index}
                                value={analyticalStatement}
                                onChange={onAnalyticalStatementChange}
                                onRemove={onAnalyticalStatementRemove}
                                // eslint-disable-next-line max-len
                                error={error?.fields?.analyticalStatements?.members?.[analyticalStatement.uuid]}
                            />
                        ))}
                        <QuickActionButton
                            className={styles.addStatementButton}
                            name={undefined}
                            onClick={handleAnalyticalStatementAdd}
                            title="Add Analytical Statement"
                            variant="primary"
                        >
                            <IoAdd />
                        </QuickActionButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(PillarAnalysis);
