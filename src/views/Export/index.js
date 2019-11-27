import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import { listToMap } from '@togglecorp/fujs';

import Page from '#rscv/Page';
import update from '#rsu/immutable-update';
import ExportPreview from '#components/other/ExportPreview';
import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
    leadPageFilterSelector,
    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    geoOptionsForProjectSelector,
    activeProjectRoleSelector,
} from '#redux';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';
import FilterLeadsForm from '#components/other/FilterLeadsForm';
import _ts from '#ts';

import FilterEntriesForm from '../Entries/FilterEntriesForm';

import ExportHeader from './ExportHeader';
import LeadsTable from './LeadsTable';
import ExportTypePane from './ExportTypePane';
import requestOptions from './request';
import styles from './styles.scss';

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
    analysisFramework: analysisFrameworkForProjectSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    filters: leadPageFilterSelector(state),
    geoOptions: geoOptionsForProjectSelector(state),
    projectRole: activeProjectRoleSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    setAnalysisFramework: PropTypes.func.isRequired,
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    setGeoOptions: PropTypes.func.isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    projectRole: {},
    geoOptions: {},
};

const SECTOR_FIRST = 'sectorFirst';
const DIMENSION_FIRST = 'dimensionFirst';

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static exportButtonKeyExtractor = d => d.key;
    static leadKeyExtractor = d => d.id

    // NOTE: This function generates dimension first level
    static transformMatrix2dLevels = ({
        sectors: widgetSec,
        dimensions: widgetDim,
    } = {}) => {
        const dimensionFirstLevels = widgetDim.map((d) => {
            const subDims = d.subdimensions;

            const sublevels = subDims.map((sd) => {
                const sectors = widgetSec.map(s => ({
                    id: `${s.id}-${d.id}-${sd.id}`,
                    title: s.title,
                }));
                return ({
                    id: `${d.id}-${sd.id}`,
                    title: sd.title,
                    sublevels: sectors,
                });
            });

            return ({
                id: d.id,
                title: d.title,
                sublevels,
            });
        });

        return dimensionFirstLevels;
    }

    constructor(props) {
        super(props);

        const {
            requests: { leadsGetRequest },
            analysisFramework,
        } = this.props;

        leadsGetRequest.setDefaultParams({
            setLeads: this.handleSelectedLeadsSet,
        });

        const reportStructure = this.createReportStructure(
            analysisFramework,
            SECTOR_FIRST,
        );

        this.state = {
            activeExportTypeKey: 'word',
            previewId: undefined,
            decoupledEntries: true,

            reportStructure,
            reportStructureVariant: SECTOR_FIRST,

            selectedLeads: {},
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectId: newActiveProject,
            analysisFramework: newAnalysisFramework,
        } = nextProps;
        const {
            projectId: oldActiveProject,
            analysisFramework: oldAnalysisFramework,
        } = this.props;

        if (oldActiveProject !== newActiveProject) {
            // Reset everything
            this.setState({
                activeExportTypeKey: 'word',
                previewId: undefined,
                reportStructure: undefined,
                decoupledEntries: true,

                selectedLeads: {},
            });
        }
        if (newAnalysisFramework !== oldAnalysisFramework) {
            const { reportStructureVariant } = this.state;
            this.setState({
                reportStructure: this.createReportStructure(
                    newAnalysisFramework,
                    reportStructureVariant,
                ),
            });
        }
    }

    handleSelectedLeadsSet = (response) => {
        const selectedLeads = listToMap(response.results, d => d.id, () => true);

        const leads = [];
        (response.results || []).forEach((l) => {
            leads.push({
                selected: true,
                ...l,
            });
        });

        this.setState({
            leads,
            selectedLeads,
        });
    }

    handleSelectLeadChange = (key, value) => {
        const {
            leads,
            selectedLeads,
        } = this.state;

        const rowIndex = leads.findIndex(d => d.id === key);

        const leadsSettings = {
            [rowIndex]: {
                selected: { $set: value },
            },
        };

        const settings = {
            [key]: {
                $set: value,
            },
        };
        const newSelectedLeads = update(selectedLeads, settings);
        const newLeads = update(leads, leadsSettings);

        this.setState({
            selectedLeads: newSelectedLeads,
            leads: newLeads,
        });
    }

    handleSelectAllLeads = (selectAll) => {
        const {
            leads: leadsFromState = [],
        } = this.state;

        const selectedLeads = listToMap(
            leadsFromState,
            d => d.id,
            () => selectAll,
        );

        const leads = leadsFromState.map(l => ({
            ...l,
            selected: selectAll,
        }));

        this.setState({
            leads,
            selectedLeads,
        });
    }

    createReportStructure = memoize((analysisFramework, reportStructureVariant) => {
        if (!analysisFramework) {
            return undefined;
        }

        const { exportables, widgets } = analysisFramework;
        if (!exportables || !widgets) {
            return undefined;
        }

        const nodes = [];
        exportables.forEach((exportable) => {
            const levels = exportable.data && exportable.data.report &&
                exportable.data.report.levels;
            const widget = widgets.find(w => w.key === exportable.widgetKey);

            if (!levels || !widget) {
                return;
            }

            if (widget.widgetId === 'matrix2dWidget' && reportStructureVariant === DIMENSION_FIRST) {
                if (!widget.properties) {
                    return;
                }
                const newLevels = Export.transformMatrix2dLevels(widget.properties.data);
                nodes.push({
                    title: widget.title,
                    key: String(exportable.id),
                    selected: true,
                    draggable: true,
                    nodes: ExportTypePane.mapReportLevelsToNodes(newLevels),
                });
            } else {
                nodes.push({
                    title: widget.title,
                    key: String(exportable.id),
                    selected: true,
                    draggable: true,
                    nodes: ExportTypePane.mapReportLevelsToNodes(levels),
                });
            }
        });

        nodes.push({
            title: _ts('export', 'uncategorizedTitle'),
            key: 'uncategorized',
            selected: true,
            draggable: true,
        });

        return nodes;
    })

    handleReportStructureChange = (value) => {
        this.setState({ reportStructure: value });
    }

    handleReportStructureVariantChange = (value) => {
        const { analysisFramework } = this.props;

        this.setState({
            reportStructureVariant: value,
            reportStructure: this.createReportStructure(
                analysisFramework,
                value,
            ),
        });
    }

    handleDecoupledEntriesChange = (value) => {
        this.setState({ decoupledEntries: value });
    }

    handleExportTypeSelectButtonClick = (key) => {
        this.setState({ activeExportTypeKey: key });
    }

    handlePreview = (exportId) => {
        this.setState({ previewId: exportId });
    }

    render() {
        const {
            previewId,
            activeExportTypeKey,
            reportStructure,
            reportStructureVariant,
            decoupledEntries,
            selectedLeads,
            leads = [],
        } = this.state;

        const {
            analysisFramework = {},
            entriesFilters,
            projectId,
            geoOptions,
            projectRole: {
                exportPermissions: {
                    create_only_unprotected: filterOnlyUnprotected,
                } = {},
            },
            requests: {
                leadsGetRequest: { pending: pendingLeads },
                analysisFrameworkRequest: { pending: pendingAf },
                geoOptionsRequest: { pending: pendingGeoOptions },
            },
        } = this.props;

        const { filters } = analysisFramework;

        return (
            <Page
                className={styles.export}
                header={
                    <ExportHeader
                        projectId={projectId}
                        entriesFilters={entriesFilters}
                        activeExportTypeKey={activeExportTypeKey}
                        selectedLeads={selectedLeads}
                        reportStructure={reportStructure}
                        decoupledEntries={decoupledEntries}
                        onPreview={this.handlePreview}
                        pending={pendingLeads || pendingAf || pendingGeoOptions}
                        analysisFramework={analysisFramework}
                        geoOptions={geoOptions}
                    />
                }
                mainContentClassName={styles.mainContent}
                mainContent={
                    <React.Fragment>
                        <section className={styles.filters} >
                            <div className={styles.leadFilters}>
                                <div className={styles.leadAttributes}>
                                    <h4 className={styles.heading}>
                                        {_ts('export', 'leadAttributesLabel')}
                                    </h4>
                                    <FilterLeadsForm
                                        className={styles.leadsFilterForm}
                                        filterOnlyUnprotected={filterOnlyUnprotected}
                                    />
                                </div>
                                <LeadsTable
                                    className={styles.leadsTable}
                                    pending={pendingLeads}
                                    leads={leads}
                                    onSelectLeadChange={this.handleSelectLeadChange}
                                    onSelectAllClick={this.handleSelectAllLeads}
                                />
                            </div>
                            <div className={styles.entryFilters}>
                                <h4 className={styles.heading}>
                                    {_ts('export', 'entryAttributesLabel')}
                                </h4>
                                <FilterEntriesForm
                                    applyOnChange
                                    pending={pendingAf || pendingGeoOptions}
                                    filters={filters}
                                    geoOptions={geoOptions}
                                />
                            </div>
                        </section>
                        <ExportTypePane
                            activeExportTypeKey={activeExportTypeKey}
                            reportStructure={reportStructure}
                            reportStructureVariant={reportStructureVariant}
                            decoupledEntries={decoupledEntries}
                            onExportTypeChange={this.handleExportTypeSelectButtonClick}
                            onReportStructureChange={this.handleReportStructureChange}
                            onReportStructureVariantChange={this.handleReportStructureVariantChange}
                            onDecoupledEntriesChange={this.handleDecoupledEntriesChange}
                            analysisFramework={analysisFramework}
                        />
                        <ExportPreview
                            className={styles.preview}
                            exportId={previewId}
                        />
                    </React.Fragment>
                }
            />
        );
    }
}
