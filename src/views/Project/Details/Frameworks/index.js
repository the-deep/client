import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import Message from '#rscv/Message';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    analysisFrameworkListSelector,
    projectDetailsSelector,

    setAnalysisFrameworksAction,
} from '#redux';
import _ts from '#ts';

import FrameworkDetail from './FrameworkDetail';
import styles from './styles.scss';

import FrameworkListGetRequest from './requests/FrameworkListGetRequest';
import FrameworkList from './FrameworkList';

const propTypes = {
    frameworkList: PropTypes.arrayOf(PropTypes.object).isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    setFrameworkList: PropTypes.func.isRequired,
};

const defaultProps = {
    frameworkList: [],
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    frameworkList: analysisFrameworkListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setFrameworkList: params => dispatch(setAnalysisFrameworksAction(params)),
});

const requestForFrameworkList = memoize((projectId, frameworkListRequest) => {
    frameworkListRequest
        .init()
        .start();
});

const getActiveFrameworkId = memoize((
    activeFrameworkIdFromProject,
    frameworkList,
    activeFrameworkIdFromState,
) => {
    if (activeFrameworkIdFromState) {
        const previouslyActiveFrameworkIndex = frameworkList.findIndex(
            f => f.id === activeFrameworkIdFromState,
        );

        if (previouslyActiveFrameworkIndex !== -1) {
            return activeFrameworkIdFromState;
        }
    }

    let activeFrameworkId;
    if (activeFrameworkIdFromProject) {
        activeFrameworkId = activeFrameworkIdFromProject;
    } else {
        activeFrameworkId = frameworkList.length > 0 ?
            frameworkList[0].id : undefined;
    }

    return activeFrameworkId;
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingFrameworkList: false,
            activeFrameworkId: undefined,
        };

        this.frameworkListRequest = new FrameworkListGetRequest({
            setState: d => this.setState(d),
            setFrameworkList: this.props.setFrameworkList,
        });
    }


    componentWillUnmount() {
        this.frameworkListRequest.stop();
    }

    setActiveFramework = (id) => {
        this.setState({ activeFrameworkId: id });
    }

    handleFrameworkClick = (id) => {
        this.setActiveFramework(id);
    }

    renderActiveFrameworkDetails = ({ activeFrameworkId }) => {
        const { frameworkList } = this.props;

        if (frameworkList.length === 0) {
            return (
                <Message className={styles.noFrameworkMessage}>
                    { _ts('project', 'noAfText') }
                </Message>
            );
        }

        return (
            <FrameworkDetail
                className={styles.details}
                frameworkId={activeFrameworkId}
                setActiveFramework={this.setActiveFramework}
            />
        );
    }

    render() {
        const {
            pendingFrameworkList,
            activeFrameworkId: activeFrameworkIdFromState,
        } = this.state;

        const {
            frameworkList,
            projectDetails: {
                analysisFramework: selectedFrameworkId,
            },
            projectId,
        } = this.props;

        requestForFrameworkList(projectId, this.frameworkListRequest);

        const activeFrameworkId = getActiveFrameworkId(
            selectedFrameworkId,
            frameworkList,
            activeFrameworkIdFromState,
        );

        const ActiveFrameworkDetails = this.renderActiveFrameworkDetails;

        return (
            <div className={styles.projectAnalysisFramework}>
                <FrameworkList
                    className={styles.frameworkList}
                    onClick={this.handleFrameworkClick}
                    activeFrameworkId={activeFrameworkId}
                    selectedFrameworkId={selectedFrameworkId}
                    frameworkList={frameworkList}
                    projectId={projectId}
                    setActiveFramework={this.setActiveFramework}
                />
                { pendingFrameworkList ? (
                    <LoadingAnimation large />
                ) : (
                    <ActiveFrameworkDetails
                        activeFrameworkId={activeFrameworkId}
                    />
                )}
            </div>
        );
    }
}
