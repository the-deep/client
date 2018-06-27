import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import BoundError from '#rs/components/General/BoundError';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Table from '#rs/components/View/Table';
import List from '#rs/components/View/List';
import ForceDirectedGraph from '#rs/components/Visualization/ForceDirectedGraph';
import wrapViz from '#rs/components/Visualization/VizWrapper';

import {
    reverseRoute,
    mapToList,
    groupList,
    compareString,
    compareNumber,
} from '#rs/utils/common';

import VizError from '#components/VizError';
import AppError from '#components/AppError';

import _ts from '#ts';

import {
    forceDirectedDataSelector,
    projectClusterDataSelector,
    projectIdFromRouteSelector,
    setProjectClusterDataAction,
} from '#redux';
import { pathNames } from '#constants/';

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

    static getTableKey = data => data.id;
    static clusterTableExtractor = row => row.value;

    static calculateNodesAndLinks = (projectClusterData) => {
        const clusters = projectClusterData.clusterData || [];

        const clusterGroup = groupList(clusters, d => d.cluster);

        const nodes = clusters.map(cluster => ({
            id: cluster.value,
            group: cluster.cluster,
        }));

        const maxNodes = Object.entries(clusterGroup)
            .map(([key, value]) => ({
                id: key,
                node: ClusterViz.getMaxNode(value),
            }));

        const mappingFn = ([key, value]) => {
            const target = maxNodes.find(node => node.id === key) || {};
            const source = value.filter(node => (target.node || {}).value !== node.value);
            return source.map(node => ({
                source: node.value,
                target: target.node.value,
                value: 1,
            }));
        };

        // NOTE: Unflatten array using Array.concat(...arrayOfArray)
        const links = [].concat(...Object.entries(clusterGroup).map(mappingFn));

        const clusterGroupList = mapToList(
            clusterGroup,
            (data, key) => ({ id: key, clusters: data }),
        );
        return { nodesAndLinks: { links, nodes }, clusterGroupList };
    }

    constructor(props) {
        super(props);
        this.state = {
            createClusterPending: true,
            clusterDataPending: true,
        };
        this.headers = [
            {
                key: 'value',
                label: _ts('clusterViz', 'tableValueLabel'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.value, b.value),
            },
            {
                key: 'score',
                label: _ts('clusterViz', 'tableScoreLabel'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareNumber(a.score, b.score),
            },
        ];
    }

    componentWillMount() {
        this.startRequestForInitCluster();

        const { nodesAndLinks, clusterGroupList } = ClusterViz.calculateNodesAndLinks(
            this.props.projectClusterData,
        );
        this.nodesAndLinks = nodesAndLinks;
        this.clusterGroupList = clusterGroupList;
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
            this.startRequestForInitCluster(newActiveProject, 5);
        }
        if (newProjectClusterData !== oldProjectClusterData) {
            const { nodesAndLinks, clusterGroupList } = ClusterViz.calculateNodesAndLinks(
                newProjectClusterData,
            );
            this.nodesAndLinks = nodesAndLinks;
            this.clusterGroupList = clusterGroupList;
        }
    }

    componentWillUnmount() {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
    }

    startRequestForInitCluster = () => {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
        const { activeProject } = this.props;
        const { stopRequestForClusterData, startRequestForClusterData } = this;

        const noOfClusters = 5;

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

    renderTable = (key, value) => (
        <div
            key={key}
        >
            <header className={styles.tableHeader}>
                <h3>cluster-{key}</h3>
            </header>
            <Table
                key={`table-${key}`}
                data={value.clusters}
                headers={this.headers}
                keyExtractor={ClusterViz.clusterTableExtractor}
            />
        </div>
    )

    render() {
        const {
            createClusterPending,
            clusterDataPending,
        } = this.state;

        const {
            className,
            activeProject,
        } = this.props;

        return (
            <div className={`${styles.cluster} ${className}`}>
                <header className={styles.header}>
                    <h2> {_ts('clusterViz', 'clusterVizTitle')} </h2>
                </header>
                <div className={styles.container}>
                    {
                        (createClusterPending || clusterDataPending) &&
                        <LoadingAnimation />
                    }
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraph}
                        data={this.nodesAndLinks}
                        idAccessor={ClusterViz.idAccessor}
                        useVoronoi={false}
                        groupAccessor={ClusterViz.groupAccessor}
                        valueAccessor={ClusterViz.valueAccessor}
                    />
                    <div className={styles.tableContainer}>
                        <List
                            data={this.clusterGroupList}
                            keyExtractor={ClusterViz.getTableKey}
                            modifier={this.renderTable}
                        />
                    </div>
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
