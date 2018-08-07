import React, {
    PureComponent,
    Fragment,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Message from '#rscv/Message';
import BoundError from '#rscg/BoundError';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import Table from '#rscv/Table';
import FormattedDate from '#rscv/FormattedDate';
import ForceDirectedGraph from '#rscz/NewForceDirectedGraph';
import wrapViz from '#rscz/VizWrapper';

import {
    reverseRoute,
    mapToList,
    groupList,
} from '#rsu/common';
import Cloak from '#components/Cloak';

import VizError from '#components/VizError';
import AppError from '#components/AppError';

import _ts from '#ts';

import {
    forceDirectedDataSelector,
    projectClusterDataSelector,
    projectIdFromRouteSelector,
    setProjectClusterDataAction,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';

import ProjectClusterDataRequest from './requests/ProjectClusterDataRequest';
import InitProjectClusterRequest from './requests/InitProjectClusterRequest';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    projectClusterData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectClusterData: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: projectIdFromRouteSelector(state),
    forcedDirectedData: forceDirectedDataSelector(state),
    projectClusterData: projectClusterDataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectClusterData: params => dispatch(setProjectClusterDataAction(params)),
});

const ForceDirectedGraphView = BoundError(VizError)(wrapViz(ForceDirectedGraph));

const noOfClusters = 5;

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class ClusterViz extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getMaxNode = data => data.reduce((previous, current) => (
        current.score > previous.score ? current : previous
    ))

    static idAccessor = d => d.id;
    static groupAccessor = d => d.group;
    static valueAccessor = d => d.value;
    static labelAccessor = d => d.title;

    static getTableKey = data => data.id;
    static leadsTableKeyExtractor = row => row.id;

    static calculateNodesAndLinks = (projectClusterData) => {
        const keywords = projectClusterData.keywords || [];
        const documents = projectClusterData.documents || [];

        const keywordGroup = groupList(keywords, d => d.cluster);

        const documentGroup = Object.keys(documents).map(key => (
            documents[key].map(doc => (
                { ...doc, group: key }
            ))
        ));
        const nodes = [].concat(...documentGroup);

        const max = Object.entries(documents)
            .map(([key, value]) => ({
                group: key,
                node: value[0] || {},
            }));

        const mappingFn = ([key, value]) => {
            const target = max.find(node => node.group === key) || {};
            const source = value.filter(node => (target.node || {}).id !== node.id);

            return source.map(node => ({
                source: node.id,
                target: target.node.id,
                value: 1,
            }));
        };

        // NOTE: Unflatten array using Array.concat(...arrayOfArray)
        const links = [].concat(...Object.entries(documentGroup).map(mappingFn));
        const clusterGroupList = mapToList(
            keywordGroup,
            (data, key) => (
                {
                    id: key,
                    clusters: data,
                    documents: documents[key],
                }
            ),
        );

        return { nodesAndLinks: { links, nodes }, clusterGroupList };
    }

    constructor(props) {
        super(props);
        this.state = {
            clusterSize: 5,
            createClusterPending: true,
            clusterDataPending: true,
            highlightClusterId: undefined,
            highlightTableId: undefined,
            createClusterFailure: false,
            clusterDataFailure: false,
        };

        this.leadsTableHeader = [
            {
                key: 'title',
                label: _ts('clusterViz', 'leadsTableTitle'),
                order: 1,
            },
            {
                key: 'createdAt',
                label: _ts('clusterViz', 'leadsTableCreatedAt'),
                order: 2,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'actions',
                label: _ts('clusterViz', 'leadsTableActions'),
                order: 3,
                modifier: (row) => {
                    const editEntries = reverseRoute(
                        pathNames.editEntries,
                        {
                            projectId: this.props.activeProject,
                            leadId: row.id,
                        },
                    );
                    return (
                        <Cloak
                            hide={({ hasAnalysisFramework }) => !hasAnalysisFramework}
                            render={({ disabled }) => (
                                <Link
                                    className={`${styles.addEntryLink} link ${disabled ? styles.disabled : ''}`}
                                    title={_ts('clusterViz', 'addEntryFromLeadButtonTitle')}
                                    to={editEntries}
                                    disabled={disabled}
                                >
                                    <i className={iconNames.forward} />
                                </Link>
                            )}
                        />
                    );
                },
            },
        ];

        this.container = React.createRef();
    }

    componentWillMount() {
        const { activeProject } = this.props;
        this.startRequestForInitCluster(activeProject);

        const { nodesAndLinks, clusterGroupList } = ClusterViz.calculateNodesAndLinks(
            this.props.projectClusterData,
        );
        this.nodesAndLinks = nodesAndLinks;
        this.clusterGroupList = clusterGroupList;
        this.noOfClusters = clusterGroupList.length;
        this.noOfLeads = clusterGroupList
            .map(cluster => cluster.documents.length)
            .reduce((sum, val) => sum + val, 0);
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject: newActiveProject,
            projectClusterData: newProjectClusterData,
        } = nextProps;
        const {
            activeProject: oldActiveProject,
            projectClusterData: oldProjectClusterData,
        } = this.props;

        if (newActiveProject !== oldActiveProject) {
            this.clearState();
            this.startRequestForInitCluster(newActiveProject);
        }
        if (newProjectClusterData !== oldProjectClusterData) {
            const { nodesAndLinks, clusterGroupList } = ClusterViz.calculateNodesAndLinks(
                newProjectClusterData,
            );
            this.nodesAndLinks = nodesAndLinks;
            this.clusterGroupList = clusterGroupList;
        }
    }

    componentDidUpdate() {
        const { current: container } = this.container;

        const activeClusterDetails = container.getElementsByClassName(styles.activeCluster);
        if (activeClusterDetails.length > 0) {
            activeClusterDetails[0].scrollIntoView({
                behaviour: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
        }
    }

    componentWillUnmount() {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
    }

    getClusterDetailClassName = (isActive) => {
        const classNames = [
            styles.clusterDetail,
        ];

        if (isActive) {
            classNames.push(styles.activeCluster);
        }

        return classNames.join(' ');
    }

    clearState = () => {
        this.setState({
            clusterSize: 5,
            createClusterPending: true,
            clusterDataPending: true,
            highlightClusterId: undefined,
            highlightTableId: undefined,
            createClusterFailure: false,
            clusterDataFailure: false,
        });
    }

    handleClusterSizeChange = (value) => {
        this.setState({ clusterSize: Number(value) });
    }

    startRequestForInitCluster = (activeProject) => {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
        const { stopRequestForClusterData, startRequestForClusterData } = this;

        const createClusterRequest = new InitProjectClusterRequest({
            stopRequestForClusterData,
            startRequestForClusterData,
            setState: params => this.setState(params),
        });
        this.createClusterRequest = createClusterRequest.create(activeProject, noOfClusters);
        this.createClusterRequest.start();
    }

    startRequestForClusterData = (modelId, projectId) => {
        if (modelId) {
            const clusterDataRequest = new ProjectClusterDataRequest({
                setProjectClusterData: this.props.setProjectClusterData,
                setState: params => this.setState(params),
            });
            this.clusterDataRequest = clusterDataRequest.create(modelId, projectId);
            this.clusterDataRequest.start();
        }
    }

    stopRequestForClusterData = () => {
        if (this.clusterDataRequest) {
            this.clusterDataRequest.stop();
        }
    }

    stopRequestForInitCluster = () => {
        if (this.createClusterRequest) {
            this.createClusterRequest.stop();
        }
    }

    handleMouseOver = (d) => {
        this.setState({
            activeCluster: d,
            highlightTableId: d.id,
        });
    }

    handleMouseOut = () => {
        this.setState({
            activeCluster: undefined,
            highlightTableId: undefined,
        });
    }

    handleTableHover = (rowKey) => {
        this.setState({ highlightClusterId: rowKey });
    }

    handleTableHoverOut = () => {
        this.setState({
            highlightClusterId: undefined,
            highlightTableId: undefined,
        });
    }

    renderKeyword = (_, cluster) => {
        const {
            value: keyword,
        } = cluster;

        return (
            // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
            <div
                key={keyword}
                className={styles.keyword}
            >
                { keyword }
            </div>
        );
    }

    renderClusterDetail = (key, data) => {
        const {
            activeCluster,
            highlightTableId,
        } = this.state;

        const isActive = activeCluster && String(activeCluster.group) === String(data.id);

        const className = this.getClusterDetailClassName(isActive);
        const clusterIndex = Number(key) + 1;

        const {
            clusters,
            documents,
        } = data;

        const leadsCount = documents.length;

        const headingText = _ts(
            'clusterViz',
            'clusterHeader',
            { clusterIndex },
        );

        const leadsCountText = _ts(
            'clusterViz',
            'leadsCount',
            {
                leadsCount: (
                    <div className={styles.number}>
                        {leadsCount}
                    </div>
                ),
            },
        );

        const leadsEmptyComponent = () => (
            <div className={styles.leadsEmpty}>
                -
            </div>
        );

        const handleHover = (rowKey) => {
            const hoverLead = documents.find(d => d.id === rowKey) || {};
            const highlightClusterId = `${hoverLead.id}-${data.id}`;

            this.setState({
                highlightClusterId,
                highlightTableId: rowKey,
            });
        };

        return (
            <div
                className={className}
                key={key}
            >
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        { headingText }
                    </h3>
                    <div className={styles.leadsCount}>
                        { leadsCountText }
                    </div>
                </header>
                <div className={styles.keywordList}>
                    <h5 className={styles.heading}>
                        {_ts('clusterViz', 'keywordsTitle')}
                    </h5>
                    <ListView
                        data={clusters}
                        className={styles.keywords}
                        modifier={this.renderKeyword}
                    />
                </div>
                <div className={styles.leadList}>
                    <h5 className={styles.heading}>
                        {_ts('clusterViz', 'leadsTitle')}
                    </h5>
                    <Table
                        className={styles.leadsTable}
                        data={documents}
                        headers={this.leadsTableHeader}
                        onBodyHover={handleHover}
                        onBodyHoverOut={this.handleTableHoverOut}
                        highlightRowKey={highlightTableId}
                        keyExtractor={ClusterViz.leadsTableKeyExtractor}
                        emptyComponent={leadsEmptyComponent}
                    />
                </div>
            </div>
        );
    }

    renderErrorMessage = () => {
        const {
            createClusterFailure,
            clusterDataFailure,
        } = this.state;

        return (
            <Fragment>
                {
                    createClusterFailure && (
                        <Message>
                            {_ts('clusterViz', 'createClusterFailure')}
                        </Message>
                    )
                }
                {
                    clusterDataFailure && (
                        <Message>
                            {_ts('clusterViz', 'clusterDataFailure')}
                        </Message>
                    )
                }
            </Fragment>
        );
    }

    render() {
        const {
            clusterSize,
            createClusterFailure,
            clusterDataFailure,
            createClusterPending,
            clusterDataPending,
            highlightClusterId,
        } = this.state;

        const {
            className: classNameFromProps,
            activeProject,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.cluster}
        `;

        const graphHeaderText = _ts(
            'clusterViz',
            'clusterTitle',
            {
                noOfClusters: this.noOfClusters,
                noOfLeads: this.noOfLeads,
            },
        );
        const loading = createClusterPending || clusterDataPending;
        const failure = createClusterFailure || clusterDataFailure;

        return (
            <div
                ref={this.container}
                className={className}
            >
                {
                    !failure &&
                    loading &&
                    <LoadingAnimation />
                }
                <header className={styles.header}>
                    <h2>{_ts('clusterViz', 'clusterVizTitle')}</h2>
                </header>
                { this.renderErrorMessage() }
                <div className={styles.container}>
                    {
                        !failure &&
                        <Fragment>
                            { /* eslint-disable-next-line max-len */ }
                            { /* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */ }
                            <ForceDirectedGraphView
                                className={styles.forcedDirectedGraph}
                                data={this.nodesAndLinks}
                                idAccessor={ClusterViz.idAccessor}
                                groupAccessor={ClusterViz.groupAccessor}
                                valueAccessor={ClusterViz.valueAccessor}
                                labelAccessor={ClusterViz.labelAccessor}
                                highlightClusterId={highlightClusterId}
                                useVoronoi
                                headerText={graphHeaderText}
                                onMouseOver={this.handleMouseOver}
                                onMouseOut={this.handleMouseOut}
                                clusterSize={clusterSize}
                                onClusterSizeChange={this.handleClusterSizeChange}
                            />
                            <ListView
                                className={styles.clusterDetails}
                                data={this.clusterGroupList}
                                keyExtractor={ClusterViz.getTableKey}
                                modifier={this.renderClusterDetail}
                            />
                        </Fragment>
                    }
                </div>
                <footer className={styles.footer}>
                    <Link
                        className={styles.link}
                        to={reverseRoute(pathNames.leads, { projectId: activeProject })}
                        replace
                    >
                        { _ts('clusterViz', 'showTable')}
                    </Link>
                </footer>
            </div>
        );
    }
}
