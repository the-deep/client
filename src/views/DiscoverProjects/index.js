import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import BoundError from '#rs/components/General/BoundError';

import {
    discoverProjectsProjectListSelector,
    setDiscoverProjectsProjectListAction,
// eslint-disable-next-line
} from '#redux';

import AppError from '#components/AppError';
import styles from './styles.scss';
import ProjectListRequest from './requests/ProjectListRequest';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    projectList: PropTypes.array.isRequired,
    setProjectList: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    projectList: discoverProjectsProjectListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectList: params => dispatch(setDiscoverProjectsProjectListAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.projectListRequest = new ProjectListRequest({
            setState: d => this.setState(d),
            setProjectList: props.setProjectList,
        });
    }

    componentDidMount() {
        this.projectListRequest.create();
        this.projectListRequest.start();
    }

    componentWillUnmount() {
        this.projectListRequest.stop();
    }

    render() {
        const { projectList } = this.props;
        console.warn('project list', projectList);

        return (
            <div className={styles.discoverProjects}>
                Discover projects
            </div>
        );
    }
}
