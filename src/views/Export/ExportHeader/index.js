import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import AccentButton from '#rsca/Button/AccentButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import { processEntryFilters } from '#entities/entries';
import Cloak from '#components/general/Cloak';
import {
    pathNames,
    viewsAcl,
} from '#constants';
import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

const emptyList = [];

const createReportStructureForExport = nodes => nodes
    .filter(node => node.selected)
    .map(node => (
        node.nodes ? {
            id: node.key,
            levels: createReportStructureForExport(node.nodes),
        } : {
            id: node.key,
        }
    ));

const createReportStructureLevelForExport = (nodes) => {
    const a = nodes
        .filter(node => node.selected)
        .map(node => (
            node.nodes ? {
                id: node.key,
                title: node.title,
                sublevels: createReportStructureLevelForExport(node.nodes),
            } : {
                id: node.key,
                title: node.title,
            }
        ));

    return a;
};

const propTypes = {
    className: PropTypes.string,
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selectedLeads: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onPreview: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    reportStructure: undefined,
    selectedLeads: {},
    entriesFilters: {},
    geoOptions: {},
};

const EXPORT_TYPE = {
    assessmentExport: 'assessment-export',
    entriesExport: 'entries-export',
    entriesPreview: 'entries-preview',
};

const requestOptions = {
    exportStatusGet: {
        method: methods.GET,
        url: ({ props: { projectId } }) => `/projects/${projectId}/export-status/`,
        onSuccess: ({ response, params: { handleExportStatus } }) => {
            const { tabularPendingFieldsCount: fieldsCount } = response;
            handleExportStatus(fieldsCount);
        },
        onFailure: () => {
            // No action needed on failure
        },
        onFatal: () => {
            // No action needed on fatal
        },
        extras: {
            schemaName: 'exportStatusGetResponse',
        },
    },
    exportRequest: {
        url: '/export-trigger/',
        method: methods.POST,
        body: ({ params: { filters } }) => ({ filters }),
        onSuccess: ({
            params: {
                onSuccess,
                setExportClass,
            },
            response: { exportTriggered },
        }) => {
            onSuccess(exportTriggered);
            setExportClass(undefined);
        },
    },
};

@RequestCoordinator
@RequestClient(requestOptions)
export default class ExportHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            exportPending: false,
            exportItem: 'entry',
            isPreview: false,
            exportClass: undefined,
            exportStatus: false,
            exportStatusCount: 0,
        };
    }

    setExportClass = (exportClass) => {
        this.setState({ exportClass });
    }

    export = () => {
        // Let's start by collecting the filters
        const {
            exportItem,
            isPreview,
        } = this.state;

        const {
            projectId,
            entriesFilters,
            activeExportTypeKey,
            selectedLeads,
            reportStructure,
            decoupledEntries,
            analysisFramework,
            geoOptions,
            requests: {
                exportRequest,
            },
        } = this.props;

        const isWord = activeExportTypeKey === 'word';
        const isPdf = activeExportTypeKey === 'pdf';

        const exportType = (
            (exportItem === 'assessment' && 'excel')
            || ((isWord || isPdf) && 'report')
            || activeExportTypeKey
        );

        const exportClass = (
            (isPreview && EXPORT_TYPE.entriesPreview)
            || (exportItem === 'entry' && EXPORT_TYPE.entriesExport)
            || (exportItem === 'assessement' && EXPORT_TYPE.assessmentExport)
            || undefined
        );

        // NOTE: structure and level depict the same thing but are different in structure
        // levels require the sublevels to be named sublevels whereas struture requires
        // sublevels to be names levels
        // This cannot be fixed immediately in server as it requires migration
        const report_levels = createReportStructureLevelForExport(reportStructure || emptyList)
            .map(node => ({
                id: node.id,
                levels: node.sublevels,
            }));

        const otherFilters = {
            project: projectId,
            lead: Object.keys(selectedLeads).filter(l => selectedLeads[l]),

            export_type: exportType,
            // for excel
            decoupled: decoupledEntries,
            // for pdf or word
            report_structure: createReportStructureForExport(reportStructure || emptyList),
            report_levels,
            // differentiate between pdf or word
            pdf: isPdf,

            // entry or assessment
            export_item: exportItem,

            // temporary or permanent
            is_preview: isPreview,
        };

        const processedFilters = processEntryFilters(
            entriesFilters,
            analysisFramework,
            geoOptions,
        );

        const filters = [
            ...Object.entries(otherFilters),
            ...processedFilters,
        ];

        this.setState({ exportClass });

        exportRequest.do({
            filters,
            onSuccess: this.handleSuccess,
            setExportClass: this.setExportClass,
        });
    }

    handleExport = () => {
        const {
            requests: {
                exportStatusGet,
            },
        } = this.props;

        exportStatusGet.do({ handleExportStatus: this.handleExportStatus });

        this.setState({ exportItem: 'entry' }, this.export);
    }

    handleSuccess = (exportId) => {
        const {
            exportStatus,
            exportItem,
            isPreview,
        } = this.state;

        if (isPreview) {
            const { onPreview } = this.props;

            this.setState({ isPreview: false }, () => {
                onPreview(exportId);
            });
        } else if (exportStatus) {
            this.setState({ exportSuccess: true });
        } else if (exportItem === 'entry') {
            notify.send({
                title: _ts('export', 'headerExport'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'exportStartedNotifyMessage'),
                duration: 15000,
            });
        } else if (exportItem === 'assessment') {
            notify.send({
                title: _ts('export', 'headerExport'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'exportStartedNotifyMessage'),
                duration: 15000,
            });
        }
    }

    handleExportStatus = (exportStatusCount) => {
        this.setState({
            exportStatusCount,
            exportStatus: exportStatusCount.length > 0,
        });
    }

    handleModalClose = () => {
        const { exportSuccess } = this.state;

        this.setState({
            exportStatus: false,
            exportStatusCount: 0,
        });

        if (exportSuccess) {
            notify.send({
                title: _ts('export', 'headerExport'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'exportStartedNotifyMessage'),
                duration: 15000,
            });
        }
    }

    handleAssessmentExportClick = () => {
        this.setState({ exportItem: 'assessment' }, this.export);
    }

    handlePreview = () => {
        const {
            requests: {
                exportStatusGet,
            },
        } = this.props;

        exportStatusGet.do({ handleExportStatus: this.handleExportStatus });
        this.setState({
            isPreview: true,
            exportItem: 'entry',
        }, this.export);
    }

    render() {
        const {
            projectId,
            className,
            pending,
        } = this.props;

        const {
            exportStatus,
            exportStatusCount,
            exportPending,
            exportClass,
        } = this.state;

        return (
            <header className={_cs(styles.header, className)}>
                <h2>
                    {_ts('export', 'headerExport')}
                </h2>
                <div className={styles.actionButtons}>
                    <Link
                        to={reverseRoute(pathNames.userExports, { projectId })}
                        className={styles.link}
                    >
                        {_ts('export', 'viewAllExportsButtonLabel')}
                    </Link>
                    <Button
                        className={styles.button}
                        onClick={this.handlePreview}
                        disabled={pending || exportPending}
                        pending={exportClass === EXPORT_TYPE.entriesPreview}
                    >
                        {_ts('export', 'showPreviewButtonLabel')}
                    </Button>
                    <Cloak
                        // NOTE: this is temporary, will be moved to new page
                        {...viewsAcl.arys}
                        render={
                            <AccentButton
                                className={styles.button}
                                onClick={this.handleAssessmentExportClick}
                                disabled={pending || exportPending}
                                pending={exportClass === EXPORT_TYPE.assessmentExport}
                            >
                                {_ts('export', 'startAssessmentExportButtonLabel')}
                            </AccentButton>
                        }
                    />
                    <PrimaryButton
                        className={styles.button}
                        onClick={this.handleExport}
                        disabled={pending || exportPending}
                        pending={exportClass === EXPORT_TYPE.entriesExport}
                    >
                        {_ts('export', 'startExportButtonLabel')}
                    </PrimaryButton>
                </div>
                {exportStatus &&
                    <Modal>
                        <ModalHeader title={_ts('export', 'exportStatusTitle')} />
                        <ModalBody>
                            {_ts('export', 'exportImageGnerationPending', { count: exportStatusCount })}
                        </ModalBody>
                        <ModalFooter>
                            <PrimaryButton
                                onClick={this.handleModalClose}
                            >
                                {_ts('export', 'continueButtonLabel')}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </header>
        );
    }
}
