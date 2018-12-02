import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import List from '#rscv/List';
import FormattedDate from '#rscv/FormattedDate';
import SparkLines from '#rscz/SparkLines';
import Numeral from '#rscv/Numeral';
import Message from '#rscv/Message';
import { formatDate } from '#rsu/date';

import {
    projectDashboardSelector,
    setProjectDashboardDetailsAction,
} from '#redux';

import RegionMap from '#components/RegionMap';
import { RequestCoordinator, RequestClient, requestMethods } from '#request';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectDashboard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectRequest: PropTypes.shape({
        pending: PropTypes.bool,
        response: PropTypes.object,
    }).isRequired,
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

const emptyObject = {};
const emptyList = [];

// TODO: Move to common utils
// eslint-disable-next-line no-underscore-dangle
const _cs = (...names) => names.join(' ');

const requests = {
    projectRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        method: requestMethods.GET,
        url: ({ props }) => `/projects/${props.projectId}/dashboard/`,
        onSuccess: ({ response, props }) => {
            props.setProjectDashboardDetails({
                project: response,
                projectId: props.projectId,
            });
        },
    },
};

const UserItem = ({ user, total }) => (
    <div className={styles.user} >
        <div className={styles.name}>
            {user.name}
        </div>
        <Numeral
            value={(user.count / total) * 100}
            suffix="%"
            precision={0}
        />
    </div>
);

UserItem.propTypes = {
    user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    total: PropTypes.number.isRequired,
};

@RequestCoordinator
@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class ProjectDashboard extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static activityCountSelector = a => a.count;
    static activityDateSelector = a => new Date(a.date).getTime();
    static activityDateModifier = d => _ts(
        'project.general.dashboard',
        'activityDateModifier',
        {
            date: formatDate(new Date(d), 'dd-MM-yyyy'),
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

    getClassName = () => _cs(
        this.props.className,
        'project-dashboard',
        styles.projectDashboard,
    )

    getProjectRequestResponse = () => (
        (this.props.projectRequest || emptyObject).response || emptyObject
    )

    handleRegionChange = (selectedRegion) => {
        this.setState({ selectedRegion });
    }

    sourcerParams = (key, user) => {
        const {
            projectRequest: {
                response: {
                    numberOfLeads,
                } = emptyObject,
            } = emptyObject,
        } = this.props;

        return ({
            user,
            total: numberOfLeads,
        });
    }

    taggerParams = (key, user) => {
        const {
            projectRequest: {
                response: {
                    numberOfEntries,
                } = emptyObject,
            } = emptyObject,
        } = this.props;

        return ({
            user,
            total: numberOfEntries,
        });
    }

    renderLeadsActivity = () => {
        const {
            projectRequest: {
                response: {
                    leadsActivity = emptyList,
                } = emptyObject,
            } = emptyObject,
        } = this.props;

        return (
            <div className={styles.chart}>
                <h4>
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
            projectRequest: {
                response: {
                    entriesActivity = emptyList,
                } = emptyObject,
            } = emptyObject,
        } = this.props;

        return (
            <div className={styles.chart}>
                <h4>
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
            <div className={styles.userTable}>
                <h4>
                    {_ts('project.general.dashboard', 'topSourcersTitle')}
                </h4>
                <List
                    data={topSourcers}
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
            <div className={styles.userTable}>
                <h4>
                    {_ts('project.general.dashboard', 'topTaggersTitle')}
                </h4>
                <List
                    data={topTaggers}
                    renderer={UserItem}
                    rendererParams={this.taggerParams}
                    keySelector={ProjectDashboard.userKeySelector}
                />
            </div>
        );
    }

    renderInfo = () => {
        const { projectDashboard: project } = this.props;

        return (
            <div className={styles.info}>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'projectStatusTitle')}
                    </div>
                    <div className={styles.value}>
                        {project.status}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'createdByTitle')}
                    </div>
                    <div className={styles.value}>
                        {project.createdBy}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'createdAtTitle')}
                    </div>
                    <FormattedDate
                        className={styles.value}
                        date={project.createdAt}
                        mode="dd-MM-yyyy"
                    />
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'totalLeadsTitle')}
                    </div>
                    <div className={styles.value}>
                        {project.numberOfLeads}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'totalEntriesTitle')}
                    </div>
                    <div className={styles.value}>
                        {project.numberOfEntries}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.label}>
                        {_ts('project.general.dashboard', 'totalUsersTitle')}
                    </div>
                    <div className={styles.value}>
                        {project.numberOfUsers}
                    </div>
                </div>
            </div>
        );
    }

    renderMetadata = () => (
        <div className={_cs(styles.row, styles.metadata)}>
            {this.renderInfo()}
            <div className={styles.rightSection}>
                <div className={styles.topSection}>
                    {this.renderLeadsActivity()}
                    {this.renderEntriesActivity()}
                </div>
                <div className={styles.bottomSection}>
                    {this.renderSourcers()}
                    {this.renderTaggers()}
                </div>
            </div>
        </div>
    )

    renderMap = () => {
        const { projectDashboard: { regions = emptyList } } = this.props;

        if (regions.length === 0) {
            return (
                <div className={_cs(styles.row, styles.map)}>
                    <Message>
                        {_ts('project.general.dashboard', 'noRegionForProject')}
                    </Message>
                </div>
            );
        }

        const selectedRegion = this.state.selectedRegion || regions[0].id;

        return (
            <div className={_cs(styles.row, styles.map)}>
                <RegionMap regionId={selectedRegion} />
                <SelectInput
                    className={styles.regionSelectInput}
                    options={regions}
                    keySelector={ProjectDashboard.regionKeySelector}
                    labelSelector={ProjectDashboard.regionLabelSelector}
                    value={selectedRegion}
                    onChange={this.handleRegionChange}
                    showHintAndError={false}
                    hideClearButton
                />
            </div>
        );
    }

    render() {
        const className = this.getClassName();
        const Metadata = this.renderMetadata;
        const Map = this.renderMap;

        if (this.props.projectRequest.pending) {
            return (
                <LoadingAnimation className={className} />
            );
        }

        return (
            <div className={className}>
                <Metadata />
                <Map />
            </div>
        );
    }
}
