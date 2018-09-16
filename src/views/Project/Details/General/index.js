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

import ProjectGetRequest from './requests/ProjectGetRequest';
import ProjectPutRequest from './requests/ProjectPutRequest';
import Dashboard from './Dashboard';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectLocalData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    changeProjectDetails: PropTypes.func.isRequired,
    setProjectDetails: PropTypes.func.isRequired,
    projectServerData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setErrorProjectDetails: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    projectLocalData: {},
    disabled: false,
};

const mapStateToProps = state => ({
    projectLocalData: projectLocalDataSelector(state),
    projectServerData: projectServerDataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectDetails: params => dispatch(setProjectDetailsAction(params)),
    changeProjectDetails: params => dispatch(changeProjectDetailsAction(params)),
    setErrorProjectDetails: params => dispatch(setErrorProjectDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectDetailsGeneral extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingProjectGet: true,
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
            setErrorProjectDetails,
        } = this.props;

        const setState = d => this.setState(d);
        this.projectGetRequest = new ProjectGetRequest({
            setState,
            setProjectDetails,
        });
        this.projectPutRequest = new ProjectPutRequest({
            setState,
            setProjectDetails,
            setErrorProjectDetails,
        });
    }

    componentDidMount() {
        const {
            projectId,
            projectServerData,
        } = this.props;

        this.projectGetRequest
            .init(projectId, projectServerData)
            .start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectId: newProjectId,
            projectServerData: newProjectServerData,
        } = nextProps;
        const { projectId: oldProjectId } = this.props;

        if (newProjectId !== oldProjectId) {
            this.setState({ pendingProjectGet: true });
            this.projectGetRequest
                .init(newProjectId, newProjectServerData)
                .start();
        }
    }

    componentWillUnmount() {
        this.projectGetRequest.stop();
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
        const {
            projectId,
            projectServerData,
        } = this.props;

        const isBeingCancelled = true;
        this.projectGetRequest
            .init(projectId, projectServerData, isBeingCancelled)
            .start();
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
                () => {
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
            disabled,
            className: classNameFromProps,
            projectId,
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

        const className = `
            ${classNameFromProps}
            ${styles.general}
        `;

        if (loading) {
            return <LoadingAnimation className={className} />;
        }

        return (
            <React.Fragment>
                <Faram
                    className={className}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={loading || disabled}
                >
                    <Dashboard
                        className={styles.dashboard}
                        projectId={projectId}
                    />
                    <div className={styles.inputsContainer}>
                        <header className={styles.header}>
                            <NonFieldErrors
                                faramElement
                                className={styles.nonFieldErrors}
                            />
                            <div className={styles.actionButtons}>
                                <DangerButton
                                    disabled={loading || pristine || disabled}
                                    onClick={this.handleFaramCancel}
                                    className={styles.button}
                                >
                                    {_ts('project', 'cancelButtonLabel')}
                                </DangerButton>
                                <SuccessButton
                                    className={styles.button}
                                    disabled={loading || pristine || disabled}
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
