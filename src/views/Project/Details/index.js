import PropTypes from 'prop-types';
import React, {
    Fragment,
} from 'react';
import { connect } from 'react-redux';

import NonFieldErrors from '#rsci/NonFieldErrors';
import FixedTabs from '#rscv/FixedTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import DangerButton from '#rsca/Button/DangerButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import {
    projectLocalDataSelector,
    projectServerDataSelector,
    setProjectDetailsAction,
    changeProjectDetailsAction,
    setErrorProjectDetailsAction,
} from '#redux';

import Faram, {
    requiredCondition,
    dateCondition,
} from '#rscg/Faram';

import _ts from '#ts';

import General from './General';
import Regions from './Regions';
import Frameworks from './Frameworks';
import CategoryEditors from './CategoryEditors';
import styles from './styles.scss';

import ProjectGetRequest from '../requests/ProjectGetRequest';
import ProjectPutRequest from '../requests/ProjectPutRequest';

const propTypes = {
    className: PropTypes.string,
    projectServerData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectLocalData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    pristine: PropTypes.bool,
    projectId: PropTypes.number,
    setProjectDetails: PropTypes.func.isRequired,
    changeProjectDetails: PropTypes.func.isRequired,
    setErrorProjectDetails: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectServerData: {},
    projectLocalData: {},
    pristine: true,
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    projectLocalData: projectLocalDataSelector(state, props),
    projectServerData: projectServerDataSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProjectDetails: params => dispatch(setProjectDetailsAction(params)),
    changeProjectDetails: params => dispatch(changeProjectDetailsAction(params)),
    setErrorProjectDetails: params => dispatch(setErrorProjectDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            projectGetPending: false,
            projectPutPending: false,
        };

        this.routes = {
            general: 'General',
            regions: 'Regions',
            frameworks: 'Framework',
            categoryEditors: 'Category Editor',
        };

        this.defaultHash = 'general';

        this.views = {
            general: {
                component: () => (
                    <General
                        className={styles.content}
                        pending={this.state.projectGetPending || this.state.projectPutPending}
                    />
                ),
            },
            regions: {
                component: () => (
                    <Regions
                        className={styles.content}
                        projectId={this.props.projectId}
                    />
                ),
            },
            frameworks: {
                component: () => (
                    <Frameworks
                        className={styles.content}
                        projectId={this.props.projectId}
                    />
                ),
            },
            categoryEditors: {
                component: () => (
                    <CategoryEditors
                        className={styles.content}
                        projectId={this.props.projectId}
                    />
                ),
            },
        };

        this.titles = {
            general: _ts('project', 'generalDetailsLabel'),
            regions: _ts('project', 'regionsLabel'),
            frameworks: _ts('project', 'analysisFrameworkLabel'),
            categoryEditors: _ts('project', 'categoryEditorLabel'),
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                startDate: [dateCondition],
                endDate: [dateCondition],
                description: [],
                regions: [],
                userGroups: [],
                memberships: [],
            },
        };

        this.projectRequest = new ProjectGetRequest({
            setState: params => this.setState(params),
            setProjectDetails: this.props.setProjectDetails,
            projectServerData: this.props.projectServerData,
        });

        this.projectPutRequest = new ProjectPutRequest({
            setState: params => this.setState(params),
            setProjectDetails: this.props.setProjectDetails,
            setErrorProjectDetails: this.props.setErrorProjectDetails,
        });
    }

    componentDidMount() {
        const { projectId } = this.props;
        this.projectRequest.init(projectId);
        this.projectRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectId: newProjectId,
        } = nextProps;

        const {
            projectId: oldProjectId,
        } = this.props;


        if (newProjectId !== oldProjectId) {
            this.projectRequest.init(newProjectId);
            this.projectRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.projectRequest) {
            this.projectRequest.stop();
        }
        if (this.projectPutRequest) {
            this.projectPutRequest.stop();
        }
    }

    handleFaramChange = (faramValues, faramErrors) => {
        const {
            projectId,
            changeProjectDetails,
        } = this.props;

        changeProjectDetails({
            faramValues,
            faramErrors,
            projectId,
        });
    }

    handleFaramCancel = () => {
        const { projectId } = this.props;
        const isBeingCancelled = true;
        this.projectRequest.init(projectId, isBeingCancelled);
        this.projectRequest.start();
    }

    handleValidationFailure = (faramErrors) => {
        const {
            projectId,
            setErrorProjectDetails,
        } = this.props;

        setErrorProjectDetails({
            faramErrors,
            projectId,
        });
    }

    handleValidationSuccess = (projectDetails) => {
        const { projectId } = this.props;
        this.projectPutRequest.init(projectDetails, projectId);
        this.projectPutRequest.start();
    }

    render() {
        const { className } = this.props;
        const {
            faramValues = {},
            faramErrors,
            pristine,
        } = this.props.projectLocalData;

        const {
            projectGetPending,
            projectPutPending,
        } = this.state;

        const loading = projectGetPending || projectPutPending;
        const { role } = faramValues;

        const projectDetailsStyle = [
            className,
            styles.details,
        ].join(' ');

        return (
            role === 'admin' ? (
                <div className={projectDetailsStyle}>
                    <Faram
                        className={styles.projectForm}
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleValidationFailure}
                        onValidationSuccess={this.handleValidationSuccess}
                        schema={this.schema}
                        value={faramValues}
                        error={faramErrors}
                        disabled={loading}
                    >
                        <NonFieldErrors faramElement />
                        <div className={styles.actionButtons}>
                            <DangerButton
                                disabled={loading || pristine}
                                onClick={this.handleFaramCancel}
                            >
                                {_ts('project', 'cancelButtonLabel')}
                            </DangerButton>
                            <SuccessButton
                                disabled={loading || pristine}
                                type="submit"
                            >
                                {_ts('project', 'saveButtonLabel')}
                            </SuccessButton>
                        </div>
                        <Fragment>
                            <header className={styles.header}>
                                <FixedTabs
                                    defaultHash={this.defaultHash}
                                    replaceHistory
                                    useHash
                                    tabs={this.routes}
                                />
                            </header>
                            <MultiViewContainer
                                useHash
                                views={this.views}
                            />
                        </Fragment>
                    </Faram>
                </div>
            ) : (
                <p className={styles.forbiddenText}>
                    {_ts('project', 'forbiddenText')}
                </p>
            )
        );
    }
}
