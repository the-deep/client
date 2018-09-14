import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Prompt } from 'react-router-dom';
import { connect } from 'react-redux';

import DangerButton from '#rsca/Button/DangerButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DateInput from '#rsci/DateInput';
import TextArea from '#rsci/TextArea';
import TextInput from '#rsci/TextInput';

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

import ProjectGetRequest from '../../requests/ProjectGetRequest';
import ProjectPutRequest from '../../requests/ProjectPutRequest';
import styles from './styles.scss';

const propTypes = {
    projectLocalData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    projectLocalData: {},
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
export default class ProjectGeneral extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingProjectGet: false,
            pendingProjectPut: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                startDate: [dateCondition],
                endDate: [dateCondition],
                description: [],
            },
        };

        const {
            setProjectDetails,
            projectServerData,
            setErrorProjectDetails,
        } = this.props;

        const setState = d => this.setState(d);
        this.projectRequest = new ProjectGetRequest({
            setState,
            setProjectDetails,
            projectServerData,
        });
        this.projectPutRequest = new ProjectPutRequest({
            setState,
            setProjectDetails,
            setErrorProjectDetails,
        });
    }

    componentDidMount() {
        const { projectId } = this.props;

        this.projectRequest.init(projectId);
        this.projectRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { projectId: newProjectId } = nextProps;
        const { projectId: oldProjectId } = this.props;

        if (newProjectId !== oldProjectId) {
            this.projectRequest.init(newProjectId);
            this.projectRequest.start();
        }
    }

    componentWillUnmount() {
        this.projectRequest.stop();
        this.projectPutRequest.stop();
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

    renderUnsavedChangesPrompt = () => (
        <Prompt
            message={
                (location) => {
                    const {
                        projectLocalData: {
                            pristine,
                        },
                    } = this.props;

                    if (pristine) {
                        return true;
                    }

                    return _ts('common', 'youHaveUnsavedChanges');
                }
            }
        />
    )

    render() {
        const {
            projectLocalData: {
                faramValues = {},
                faramErrors,
                pristine,
            },
        } = this.props;

        const {
            pendingProjectGet,
            pendingProjectPut,
        } = this.state;

        const loading = pendingProjectGet || pendingProjectPut;
        const UnsavedChangesPrompt = this.renderUnsavedChangesPrompt;

        return (
            <React.Fragment>
                <Faram
                    className={styles.projectGeneral}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={loading}
                >
                    { loading && <LoadingAnimation /> }
                    <div className={styles.visualizations}>
                        Visualizations
                    </div>
                    <div className={styles.inputsContainer}>
                        <header className={styles.header}>
                            <NonFieldErrors
                                faramElement
                                className={styles.nonFieldErrors}
                            />
                            <div className={styles.actionButtons}>
                                <DangerButton
                                    disabled={loading || pristine}
                                    onClick={this.handleFaramCancel}
                                    className={styles.button}
                                >
                                    {_ts('project', 'cancelButtonLabel')}
                                </DangerButton>
                                <SuccessButton
                                    className={styles.button}
                                    disabled={loading || pristine}
                                    type="submit"
                                >
                                    {_ts('project', 'saveButtonLabel')}
                                </SuccessButton>
                            </div>
                        </header>
                        <div className={styles.content}>
                            <TextInput
                                label={_ts('project.general', 'projectNameLabel')}
                                faramElementName="title"
                                placeholder={_ts('project.general', 'projectNamePlaceholder')}
                                className={styles.name}
                            />
                            <DateInput
                                label={_ts('project.general', 'projectStartDateLabel')}
                                faramElementName="startDate"
                                placeholder={_ts('project.general', 'projectStartDatePlaceholder')}
                                className={styles.startDate}
                            />
                            <DateInput
                                label={_ts('project.general', 'projectEndDateLabel')}
                                faramElementName="endDate"
                                placeholder={_ts('project.general', 'projectEndDatePlaceholder')}
                                className={styles.endDate}
                            />
                            <TextArea
                                label={_ts('project.general', 'projectDescriptionLabel')}
                                faramElementName="description"
                                placeholder={_ts('project.general', 'projectDescriptionPlaceholder')}
                                className={styles.description}
                                rows={3}
                            />
                        </div>
                    </div>
                </Faram>
                <UnsavedChangesPrompt />
            </React.Fragment>
        );
    }
}
