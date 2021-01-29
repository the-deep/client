import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { formatDateToString, reverseRoute } from '@togglecorp/fujs';

import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import FormattedDate from '#rscv/FormattedDate';
import SparkLines from '#rscz/SparkLines';
import Numeral from '#rscv/Numeral';
import Message from '#rscv/Message';
import { pathNames } from '#constants';

import {
    projectDashboardSelector,
    setProjectDashboardDetailsAction,
} from '#redux';

import RegionMap from '#components/geo/RegionMap';
import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectDashboard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    projectDashboard: {},
};

const mapStateToProps = state => ({
    projectDashboard: projectDashboardSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectDashboardDetails: params => dispatch(setProjectDashboardDetailsAction(params)),
});

const emptyList = [];

const requestOptions = {
    projectRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        method: methods.GET,
        url: ({ props }) => `/projects-stat/${props.projectId}/`,
        onSuccess: ({ response, props }) => {
            props.setProjectDashboardDetails({
                project: response,
                projectId: props.projectId,
            });
        },
        extras: {
            schemaName: 'projectStat',
        },
    },
};

const UserItem = ({ user, total }) => {
    const {
        name,
        userId,
    } = user;

    const linkToUser = reverseRoute(pathNames.userProfile, {
        userId,
    });

    return (
        <div className={styles.item} >
            <div className={styles.title}>
                <a href={linkToUser}>
                    {name}
                </a>
            </div>
            <Numeral
                className={styles.value}
                value={user.count}
                precision={0}
            />
            <Numeral
                className={styles.value}
                value={(user.count / total) * 100}
                prefix="("
                suffix="%)"
                precision={0}
            />
        </div>
    );
};

UserItem.propTypes = {
    user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    total: PropTypes.number.isRequired,
};

@RequestCoordinator
@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class ProjectDashboard extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static activityCountSelector = a => a.count;
    static activityDateSelector = a => new Date(a.date).getTime();
    static activityDateModifier = d => _ts(
        'project.general.dashboard',
        'activityDateModifier',
        {
            date: formatDateToString(new Date(d), 'dd-MM-yyyy'),
        },
    );
    static leadsActivityNumberModifier = d => _ts(
        'project.general.dashboard',
        'leadsActivityNumberModifier',
        {
            leads: d,
        },
    );
    static entriesActivityNumberModifier = d => _ts(
        'project.general.dashboard',
        'entriesActivityNumberModifier',
        {
            entries: d,
        },
    );

    static regionKeySelector = r => r.id;
    static userKeySelector = u => u.id;
    static regionLabelSelector = r => r.title;

    constructor(props) {
        super(props);

        this.state = {
            selectedRegion: undefined,
        };
    }

    handleRegionChange = (selectedRegion) => {
        this.setState({ selectedRegion });
    }

    filterSourcers = memoize(topSourcers => topSourcers.filter(sourcer => sourcer.count > 0));

    filterTaggers = memoize(topTaggers => topTaggers.filter(tagger => tagger.count > 0));

    sourcerParams = (key, user) => {
        const {
            requests: {
                projectRequest: {
                    response: {
                        numberOfLeads,
                    } = {},
                } = {},
            },
        } = this.props;

        return ({
            user,
            total: numberOfLeads,
        });
    }

    taggerParams = (key, user) => {
        const {
            requests: {
                projectRequest: {
                    response: {
                        numberOfEntries,
                    } = {},
                } = {},
            },
        } = this.props;

        return ({
            user,
            total: numberOfEntries,
        });
    }

    renderLeadsActivity = () => {
        const {
            requests: {
                projectRequest: {
                    response: {
                        leadsActivity = emptyList,
                    } = {},
                } = {},
            },
        } = this.props;

        return (
            <div className={styles.chart}>
                <h4 className={styles.heading}>
                    {_ts('project.general.dashboard', 'leadsActivityTitle')}
                </h4>
                <SparkLines
                    className={styles.sparkLine}
                    data={leadsActivity}
                    yValueSelector={ProjectDashboard.activityCountSelector}
                    xValueSelector={ProjectDashboard.activityDateSelector}
                    xLabelModifier={ProjectDashboard.activityDateModifier}
                    yLabelModifier={ProjectDashboard.leadsActivityNumberModifier}
                    fill
                />
            </div>
        );
    }

    renderEntriesActivity = () => {
        const {
            requests: {
                projectRequest: {
                    response: {
                        entriesActivity = emptyList,
                    } = {},
                } = {},
            },
        } = this.props;

        return (
            <div className={styles.chart}>
                <h4 className={styles.heading}>
                    {_ts('project.general.dashboard', 'entriesActivityTitle')}
                </h4>
                <SparkLines
                    className={styles.sparkLine}
                    data={entriesActivity}
                    yValueSelector={ProjectDashboard.activityCountSelector}
                    xValueSelector={ProjectDashboard.activityDateSelector}
                    xLabelModifier={ProjectDashboard.activityDateModifier}
                    yLabelModifier={ProjectDashboard.entriesActivityNumberModifier}
                    fill
                />
            </div>
        );
    }

    renderSourcers = () => {
        const { projectDashboard: { topSourcers = emptyList } } = this.props;

        return (
            <div className={styles.sourcersListContainer}>
                <h4 className={styles.heading}>
                    {_ts('project.general.dashboard', 'topSourcersTitle')}
                </h4>
                <ListView
                    className={styles.list}
                    data={this.filterSourcers(topSourcers)}
                    renderer={UserItem}
                    rendererParams={this.sourcerParams}
                    keySelector={ProjectDashboard.userKeySelector}
                />
            </div>
        );
    }

    renderTaggers = () => {
        const { projectDashboard: { topTaggers = emptyList } } = this.props;

        return (
            <div className={styles.taggersListContainer}>
                <h4 className={styles.heading}>
                    {_ts('project.general.dashboard', 'topTaggersTitle')}
                </h4>
                <ListView
                    className={styles.list}
                    data={this.filterTaggers(topTaggers)}
                    renderer={UserItem}
                    rendererParams={this.taggerParams}
                    keySelector={ProjectDashboard.userKeySelector}
                />
            </div>
        );
    }

    renderBasicInfo = () => {
        const { projectDashboard: {
            createdAt,
            createdByName,
            status,
            isPrivate,
            numberOfLeads,
            numberOfEntries,
            numberOfUsers,
        } } = this.props;

        const projectVisibility = isPrivate
            ? _ts('project.general.dashboard', 'privateVisibilityTitle')
            : _ts('project.general.dashboard', 'publicVisibilityTitle');

        return (
            <div className={styles.basicInfo}>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'projectStatusTitle')}
                    </div>
                    <div className={styles.stringValue}>
                        {status}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'projectVisibility')}
                    </div>
                    <div className={styles.stringValue}>
                        {projectVisibility}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'createdByTitle')}
                    </div>
                    <div className={styles.stringValue}>
                        {createdByName}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'createdAtTitle')}
                    </div>
                    <FormattedDate
                        className={styles.dateValue}
                        date={createdAt}
                        mode="dd-MM-yyyy"
                    />
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'totalLeadsTitle')}
                    </div>
                    <Numeral
                        className={styles.numericValue}
                        value={numberOfLeads}
                        precision={0}
                    />
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'totalEntriesTitle')}
                    </div>
                    <Numeral
                        className={styles.numericValue}
                        value={numberOfEntries}
                        precision={0}
                    />
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'totalUsersTitle')}
                    </div>
                    <Numeral
                        className={styles.numericValue}
                        value={numberOfUsers}
                        precision={0}
                    />
                </div>
            </div>
        );
    }

    renderMetadata = () => {
        const BasicInfo = this.renderBasicInfo;
        return (
            <div className={styles.metadata}>
                <BasicInfo />
                <div className={styles.stats}>
                    <div className={styles.activityChart}>
                        {this.renderLeadsActivity()}
                        {this.renderEntriesActivity()}
                    </div>
                    <div className={styles.activityPercentages}>
                        {this.renderSourcers()}
                        {this.renderTaggers()}
                    </div>
                </div>
            </div>
        );
    }

    renderMap = () => {
        const {
            projectDashboard: {
                regions = emptyList,
            },
        } = this.props;

        if (regions.length === 0) {
            return (
                <div className={styles.mapContainer}>
                    <Message>
                        {_ts('project.general.dashboard', 'noRegionForProject')}
                    </Message>
                </div>
            );
        }

        const selectedRegion = this.state.selectedRegion || regions[0].id;

        return (
            <div className={styles.mapContainer}>
                <RegionMap
                    className={styles.map}
                    regionId={selectedRegion}
                />
                <SelectInput
                    className={styles.regionSelectInput}
                    options={regions}
                    keySelector={ProjectDashboard.regionKeySelector}
                    labelSelector={ProjectDashboard.regionLabelSelector}
                    value={selectedRegion}
                    onChange={this.handleRegionChange}
                    showLabel={false}
                    showHintAndError={false}
                    hideClearButton
                />
            </div>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            requests: {
                projectRequest: { pending: projectRequestPending },
            },
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.projectDashboard,
            'project-dashboard',
        );

        const Metadata = this.renderMetadata;
        const Map = this.renderMap;

        return (
            <div className={className}>
                { projectRequestPending ? (
                    <LoadingAnimation />
                ) : (
                    <React.Fragment>
                        <Metadata />
                        <Map />
                    </React.Fragment>
                )}
            </div>
        );
    }
}
