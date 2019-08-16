import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareString,
    compareDate,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Page from '#rscv/Page';
import { FgRestBuilder } from '#rsu/rest';
import Table from '#rscv/Table';
import FormattedDate from '#rscv/FormattedDate';
import LoadingAnimation from '#rscv/LoadingAnimation';

import BackLink from '#components/general/BackLink';
import {
    createUrlForExport,
    createParamsForGet,
    createUrlForExportsOfProject,

    transformResponseErrorToFormError,
} from '#rest';
import {
    userExportsListSelector,
    setUserExportsAction,
    setUserExportAction,

    projectIdFromRouteSelector,
} from '#redux';
import { pathNames } from '#constants';
import { mimeTypeToIconMap } from '#entities/lead';
import schema from '#schema';
import notify from '#notify';
import _ts from '#ts';
import ExportPreview from '#components/other/ExportPreview';

import styles from './styles.scss';

const propTypes = {
    userExports: PropTypes.array.isRequired, //eslint-disable-line
    setUserExports: PropTypes.func.isRequired,
    setUserExport: PropTypes.func.isRequired,
    projectId: PropTypes.number,
};

const defaultProps = {
    userExports: [],
    projectId: undefined,
};

const mapStateToProps = state => ({
    userExports: userExportsListSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserExports: params => dispatch(setUserExportsAction(params)),
    setUserExport: params => dispatch(setUserExportAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class UserExports extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static tableKeyExtractor = d => d.id;

    constructor(props) {
        super(props);

        this.state = {
            selectedExport: 0,
            pendingExports: true,
        };

        this.exportsTableHeader = [
            {
                key: 'mime-type',
                label: _ts('export', 'documentTypeHeaderLabel'),
                order: 1,
                sortable: true,
                comparator: (a, b) => (
                    compareString(a.mimeType, b.mimeType) ||
                    compareString(a.title, b.title)
                ),
                modifier: (row) => {
                    const icon = mimeTypeToIconMap[row.mimeType] || 'documentText';
                    const url = row.file;
                    return (
                        <div className="icon-wrapper">
                            <a href={url} target="_blank" rel="noopener noreferrer">
                                <Icon name={icon} />
                            </a>
                        </div>
                    );
                },
            },
            {
                key: 'exportedAt',
                label: _ts('export', 'exportedAtHeaderLabel'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareDate(a.exportedAt, b.exportedAt),
                modifier: row => (
                    <FormattedDate
                        date={row.exportedAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'title',
                label: _ts('export', 'exportTitleHeaderLabel'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'status',
                label: _ts('export', 'statusHeaderLabel'),
                order: 4,
                sortable: true,
                comparator: (a, b) => (
                    compareString(a.status, b.status)
                ),
                modifier: (row) => {
                    if (row.status === 'pending') {
                        return _ts('export', 'pendingStatusLabel');
                    } else if (row.status === 'started') {
                        return _ts('export', 'startedStatusLabel');
                    } else if (row.status === 'failure') {
                        return _ts('export', 'errorStatusLabel');
                    } else if (row.status === 'success') {
                        return _ts('export', 'completedStatusLabel');
                    }
                    return '';
                },
            },
            {
                key: 'type',
                label: _ts('export', 'exportTypeHeaderLabel'),
                order: 5,
                sortable: true,
                comparator: (a, b) => (
                    compareString(a.type, b.type) || compareString(a.title, b.title)
                ),
            },
            {
                key: 'file',
                label: _ts('export', 'exportDownloadHeaderLabel'),
                order: 6,
                modifier: (row) => {
                    if (row.status === 'started' || row.status === 'pending') {
                        return (
                            <div className={styles.loadingAnimation}>
                                <LoadingAnimation />
                            </div>
                        );
                    } else if (row.status === 'failure' || !row.file) {
                        return (
                            <div className="file-error">
                                <Icon name="error" />
                            </div>
                        );
                    }
                    return (
                        <a
                            href={row.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-download"
                        >
                            <Icon name="download" />
                        </a>
                    );
                },
            },
        ];
        this.defaultSort = {
            key: 'exportedAt',
            order: 'dsc',
        };
    }

    componentWillMount() {
        const { projectId } = this.props;
        this.userExportsRequest = this.createUserExportsRequest(projectId);
        this.userExportsRequest.start();

        const { userExports } = this.props;
        this.exportPollRequests = [];
        userExports.forEach((e) => {
            if (e.pending) {
                const userPollRequest = this.createExportPollRequest(e.id);
                userPollRequest.start();
                this.exportPollRequests.push(userPollRequest);
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        const { userExports: oldExports, projectId: oldProjectId } = this.props;
        const { userExports: newExports, projectId: newProjectId } = nextProps;

        if (oldExports !== newExports) {
            if (this.exportPollRequests) {
                this.exportPollRequests.forEach((p) => {
                    p.stop();
                });
            }

            this.exportPollRequests = [];
            newExports.forEach((e) => {
                if (e.pending) {
                    const userPollRequest = this.createExportPollRequest(e.id);
                    userPollRequest.start();
                    this.exportPollRequests.push(userPollRequest);
                }
            });
        }

        if (oldProjectId !== newProjectId) {
            if (this.userExportsRequest) {
                this.userExportsRequest.stop();
            }
            this.userExportsRequest = this.createUserExportsRequest(newProjectId);
            this.userExportsRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.userExportsRequest) {
            this.userExportsRequest.stop();
        }

        if (this.exportPollRequests) {
            this.exportPollRequests.forEach((p) => {
                p.stop();
            });
        }
    }

    createUserExportsRequest = (projectId) => {
        const userExportsRequest = new FgRestBuilder()
            .url(createUrlForExportsOfProject(projectId))
            .params(() => createParamsForGet())
            .preLoad(() => {
                this.setState({ pendingExports: true });
            })
            .postLoad(() => {
                this.setState({ pendingExports: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userExportsGetResponse');
                    this.props.setUserExports({
                        exports: response.results,
                        projectId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('export', 'userExportsTitle'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('export', 'userExportsTitle'),
                    type: notify.type.ERROR,
                    message: _ts('export', 'userExportsFataMessage'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return userExportsRequest;
    };

    createExportPollRequest = (exportId) => {
        const userExportsRequest = new FgRestBuilder()
            .url(createUrlForExport(exportId))
            .params(() => createParamsForGet())
            .pollTime(2000)
            .maxPollAttempts(200)
            .shouldPoll(response => response.pending === true)
            .success((response) => {
                try {
                    schema.validate(response, 'export');
                    if (!response.pending) {
                        this.props.setUserExport({
                            userExport: response,
                        });
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('export', 'userExportsTitle'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('export', 'userExportsTitle'),
                    type: notify.type.ERROR,
                    message: _ts('export', 'userExportsFataMessage'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return userExportsRequest;
    };

    handleRowClick = (rowKey) => {
        this.setState({ selectedExport: rowKey });
    }

    render() {
        const { userExports, projectId } = this.props;
        const { selectedExport, pendingExports } = this.state;

        return (
            <Page
                className={styles.userExports}
                headerClassName={styles.header}
                header={
                    <React.Fragment>
                        <BackLink
                            className={styles.backLink}
                            defaultLink={reverseRoute(pathNames.export, { projectId })}
                        />
                        <h2 className={styles.heading}>
                            {_ts('export', 'userExportsHeader')}
                        </h2>
                    </React.Fragment>
                }
                mainContentClassName={styles.mainContent}
                mainContent={
                    <React.Fragment>
                        { pendingExports && <LoadingAnimation /> }
                        <div className={styles.tableContainer}>
                            <Table
                                className={styles.table}
                                data={userExports || emptyList}
                                headers={this.exportsTableHeader}
                                keySelector={UserExports.tableKeyExtractor}
                                highlightRowKey={selectedExport}
                                onBodyClick={this.handleRowClick}
                                defaultSort={this.defaultSort}
                            />
                        </div>
                        <ExportPreview
                            key={selectedExport}
                            className={styles.preview}
                            exportId={selectedExport}
                        />
                    </React.Fragment>
                }
            />
        );
    }
}
