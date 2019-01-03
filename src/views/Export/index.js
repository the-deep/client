import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    isFalsy,
    listToMap,
    compareString,
    compareDate,
} from '#rsu/common';
import { getFiltersForRequest } from '#entities/lead';
import update from '#rsu/immutable-update';
import { FgRestBuilder } from '#rsu/rest';
import AccentButton from '#rsca/Button/AccentButton';
import Table from '#rscv/Table';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';

import ExportPreview from '#components/other/ExportPreview';
import {
    createUrlForProject,
    createUrlForAnalysisFramework,

    createParamsForGet,
    createUrlForLeadsOfProject,

    transformResponseErrorToFormError,
} from '#rest';
import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
    leadPageFilterSelector,
    setAnalysisFrameworkAction,
    setProjectAction,
} from '#redux';
import { iconNames } from '#constants';
import notify from '#notify';
import schema from '#schema';

import _ts from '#ts';
import FilterLeadsForm from '../Leads/FilterLeadsForm';
import FilterEntriesForm from '../Entries/FilterEntriesForm';

import ExportHeader from './ExportHeader';
import ExportTypePane from './ExportTypePane';
import styles from './styles.scss';

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
    analysisFramework: analysisFrameworkForProjectSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    filters: leadPageFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
});

const propTypes = {
    setProject: PropTypes.func.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

@connect(mapStateToProps, mapDispatchToProps)
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static exportButtonKeyExtractor = d => d.key;
    static leadKeyExtractor = d => d.id

    constructor(props) {
        super(props);

        // TABLE component
        this.headers = [
            {
                key: 'select',
                label: _ts('export', 'selectLabel'),
                order: 1,
                sortable: false,
                modifier: (d) => {
                    const key = Export.leadKeyExtractor(d);
                    const iconName = d.selected ?
                        iconNames.checkbox : iconNames.checkboxOutlineBlank;

                    return (
                        <AccentButton
                            title={d.selected ? 'Unselect' : 'Select'}
                            onClick={() => this.handleSelectLeadChange(key, !d.selected)}
                            smallVerticalPadding
                            transparent
                            iconName={iconName}
                        />
                    );
                },
            },
            {
                key: 'title',
                label: _ts('export', 'titleLabel'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: _ts('export', 'createdAtLabel'),
                order: 3,
                sortable: true,
                comparator: (a, b) => (
                    compareDate(a.createdAt, b.createdAt) ||
                    compareString(a.title, b.title)
                ),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
        ];

        this.defaultSort = {
            key: 'createdAt',
            order: 'dsc',
        };

        this.state = {
            activeExportTypeKey: 'word',
            previewId: undefined,
            reportStructure: undefined,
            decoupledEntries: true,

            selectedLeads: {},
            pendingLeads: true,
            pendingAf: true,
        };
    }

    componentWillMount() {
        const { projectId, filters } = this.props;
        this.leadRequest = this.createRequestForProjectLeads({
            activeProject: projectId,
            filters,
        });
        this.leadRequest.start();

        this.projectRequest = this.createRequestForProject(projectId);
        this.projectRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            filters: newFilters,
            projectId: newActiveProject,
        } = nextProps;
        const {
            filters: oldFilters,
            projectId: oldActiveProject,
        } = this.props;

        if (newFilters !== oldFilters || newActiveProject !== oldActiveProject) {
            if (this.leadRequest) {
                this.leadRequest.stop();
            }
            this.leadRequest = this.createRequestForProjectLeads({
                activeProject: newActiveProject,
                filters: newFilters,
            });
            this.leadRequest.start();
        }

        if (oldActiveProject !== newActiveProject) {
            if (this.projectRequest) {
                this.projectRequest.stop();
            }
            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }

            this.setState({ pendingAf: true });

            this.projectRequest = this.createRequestForProject(newActiveProject);
            this.projectRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.leadRequest) {
            this.leadRequest.stop();
        }
        if (this.projectRequest) {
            this.projectRequest.stop();
        }
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
    }

    setSelectedLeads = (response) => {
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

    createRequestForProject = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ pendingAf: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({ project: response });

                    if (isFalsy(response.analysisFramework)) {
                        console.error('There is no analysis framework');
                        this.setState({ pendingAf: false });
                    } else {
                        this.analysisFrameworkRequest = this.createRequestForAnalysisFramework(
                            response.analysisFramework,
                        );
                        this.analysisFrameworkRequest.start();
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingAf: false });
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('export', 'projectLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                this.setState({ pendingAf: false });
                notify.send({
                    title: _ts('export', 'projectLabel'),
                    type: notify.type.ERROR,
                    message: _ts('export', 'cantLoadProject'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return projectRequest;
    };

    createRequestForAnalysisFramework = (analysisFrameworkId) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(createParamsForGet)
            .delay(0)
            .preLoad(() => {
                this.setState({ pendingAf: true });
            })
            .postLoad(() => {
                this.setState({ pendingAf: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({ analysisFramework: response });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.warn(response);
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('export', 'afLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('export', 'afLabel'),
                    type: notify.type.ERROR,
                    message: _ts('export', 'cantLoadAf'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return analysisFrameworkRequest;
    }

    createRequestForProjectLeads = ({ activeProject, filters }) => {
        const sanitizedFilters = getFiltersForRequest(filters);
        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            fields: ['id', 'title', 'created_at'],
            ...sanitizedFilters,
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ pendingLeads: true });
            })
            .postLoad(() => {
                this.setState({ pendingLeads: false });
            })
            .success((response) => {
                // FIXME: write schema
                this.setSelectedLeads(response);
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('export', 'leadsLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('export', 'leadsLabel'),
                    type: notify.type.ERROR,
                    message: _ts('export', 'cantLoadLeads'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return leadRequest;
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
        console.warn(newSelectedLeads, newLeads);
    }

    handleReportStructureChange = (value) => {
        this.setState({ reportStructure: value });
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
            decoupledEntries,
            selectedLeads,
            leads = [],

            pendingLeads,
            pendingAf,
        } = this.state;

        const {
            analysisFramework,
            entriesFilters,
            projectId,
        } = this.props;

        return (
            <div className={styles.export}>
                <ExportHeader
                    projectId={projectId}
                    entriesFilters={entriesFilters}
                    className={styles.header}
                    activeExportTypeKey={activeExportTypeKey}
                    selectedLeads={selectedLeads}
                    reportStructure={reportStructure}
                    decoupledEntries={decoupledEntries}
                    onPreview={this.handlePreview}
                    pending={pendingLeads || pendingAf}
                />
                <div className={styles.mainContent}>
                    <section className={styles.filters} >
                        <div className={styles.entryFilters}>
                            <h4 className={styles.heading}>
                                {_ts('export', 'entryAttributesLabel')}
                            </h4>
                            <FilterEntriesForm
                                applyOnChange
                                pending={pendingAf}
                                filters={(analysisFramework || {}).filters}
                            />
                        </div>
                        <div className={styles.leadFilters}>
                            <div className={styles.leadAttributes}>
                                <h4 className={styles.heading}>
                                    {_ts('export', 'leadAttributesLabel')}
                                </h4>
                                <FilterLeadsForm />
                            </div>
                            <div className={styles.leadsTableContainer}>
                                { pendingLeads && <LoadingAnimation /> }
                                <Table
                                    className={styles.leadsTable}
                                    data={leads}
                                    headers={this.headers}
                                    defaultSort={this.defaultSort}
                                    keySelector={Export.leadKeyExtractor}
                                />
                            </div>
                        </div>
                    </section>
                    <ExportTypePane
                        activeExportTypeKey={activeExportTypeKey}
                        reportStructure={reportStructure}
                        decoupledEntries={decoupledEntries}
                        onExportTypeChange={this.handleExportTypeSelectButtonClick}
                        onReportStructureChange={this.handleReportStructureChange}
                        onDecoupledEntriesChange={this.handleDecoupledEntriesChange}
                        analysisFramework={analysisFramework}
                    />
                    <ExportPreview
                        className={styles.preview}
                        exportId={previewId}
                    />
                </div>
            </div>
        );
    }
}
