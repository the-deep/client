import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import BoundError from '#rs/components/General/BoundError';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Table from '#rs/components/View/Table';
import ForceDirectedGraphView from '#rs/components/Visualization/ForceDirectedGraphView';

import {
    reverseRoute,
    groupList,
    compareString,
    compareNumber,
} from '#rs/utils/common';

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

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class ClusterViz extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            createClusterPending: true,
            clusterDataPending: true,
        };
    }

    componentWillMount() {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
        this.startRequestForInitCluster();
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject } = this.props;
        if (activeProject !== nextProps.activeProject) {
            this.stopRequestForInitCluster();
            this.stopRequestForClusterData();
            this.startRequestForInitCluster(activeProject, 5);
        }
    }

    componentWillUnmount() {
        this.stopRequestForInitCluster();
        this.stopRequestForClusterData();
    }

    getMaxNode = data => (
        data.reduce((previous, current) => (
            current.score > previous.socre ? current : previous
        )))

    clusterTableExtractor = row => row.value;

    startRequestForInitCluster = () => {
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

    stopRequestForInitCluster = () => {
        if (this.createClusterRequest) {
            this.createClusterRequest.stop();
        }
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

    headers = [
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

    render() {
        const {
            clusterDataPending,
            createClusterPending,
        } = this.state;

        const {
            className,
            activeProject,
            projectClusterData,
        } = this.props;

        const {
            clusterTableExtractor,
            headers,
        } = this;

        const clusters = projectClusterData.clusterData || [];

        const clusterGroup = groupList(clusters, d => d.cluster);

        const nodes = clusters.map(cluster => (
            { id: cluster.value, group: cluster.cluster }
        ));

        const maxNodes = Object.entries(clusterGroup).map(values => (
            { id: values[0], node: this.getMaxNode(values[1]) }
        ));

        const links = [].concat(...Object.entries(clusterGroup).map((values) => {
            const target = maxNodes.find(node => node.id === values[0]);
            const source = values[1].filter(node => target.node.value !== node.value);
            return source.map(node => (
                { source: node.value, target: target.node.value, value: 1 }
            ));
        }));

        return (
            <div className={`${styles.cluster} ${className}`}>
                <header className={styles.header}>
                    {_ts('clusterViz', 'clusterVizTitle')}
                </header>
                <div className={styles.container}>
                    {
                        (createClusterPending || clusterDataPending) &&
                        <LoadingAnimation />
                    }
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraph}
                        data={{ nodes, links }}
                        idAccessor={d => d.id}
                        useVoronoi={false}
                        groupAccessor={d => d.group}
                        valuAccessor={d => d.value}
                    />
                    <div className={styles.tables}>
                        {
                            Object.entries(clusterGroup).map(values => (
                                <div
                                    key={`cluster-${values[0]}}`}
                                >
                                    <header className={styles.header}>
                                        cluster-{values[0]}
                                    </header>
                                    <Table
                                        key={`table-${values[0]}`}
                                        className={styles.table}
                                        data={values[1]}
                                        headers={headers}
                                        keyExtractor={clusterTableExtractor}
                                    />
                                </div>
                            ))
                        }
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
