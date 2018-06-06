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
    mapToList,
    compareString,
    compareNumber,
} from '#rs/utils/common';

import AppError from '#components/AppError';
import _ts from '#ts';

import {
    projectDetailsSelector,
    forceDirectedDataSelector,
} from '#redux';
import { pathNames } from '#constants/';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
    }).isRequired,
    forcedDirectedData: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: projectDetailsSelector(state),
    forcedDirectedData: forceDirectedDataSelector(state),
});

@BoundError(AppError)
@connect(mapStateToProps)
export default class Clustering extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keyExtractor = data => data.title;

    state = {
        forcedDirectedDataPending: false,
    }

    headers = [
        {
            key: 'title',
            label: _ts('cluster', 'titleLabel'),
            order: 1,
            sortable: true,
            comparator: (a, b) => compareString(a.title, b.title),
        },
        {
            key: 'group',
            label: _ts('cluster', 'groupLabel'),
            order: 2,
            sortable: true,
            comparator: (a, b) => compareNumber(a.group, b.group),
        },
    ];

    render() {
        const {
            forcedDirectedDataPending,
        } = this.state;

        const {
            activeProject,
            forcedDirectedData,
        } = this.props;

        return (
            <div className={styles.cluster}>
                <header className={styles.header}>
                    Clustering
                </header>
                <div className={styles.container}>
                    {
                        forcedDirectedDataPending &&
                        <LoadingAnimation />
                    }
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraph}
                        data={forcedDirectedData}
                        idAccessor={d => d.id}
                        groupAccessor={d => d.group}
                        valuAccessor={d => d.value}
                    />
                    <Table
                        className={styles.table}
                        data={forcedDirectedData.nodes}
                        headers={this.headers}
                        keyExtractor={Clustering.keyExtractor}
                    />
                </div>
                <footer className={styles.footer}>
                    <Link
                        className={styles.link}
                        to={reverseRoute(pathNames.leads, { projectId: activeProject.id })}
                        replace
                    >
                        { _ts('cluster', 'showTable')}
                    </Link>
                </footer>
            </div>
        );
    }
}
