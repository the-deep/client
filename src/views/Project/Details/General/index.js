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
import ActivityLog from '#components/ActivityLog';
import Cloak from '#components/Cloak';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';

import {
    projectActivityLogSelector,
    projectLocalDataSelector,
    projectServerDataSelector,
    setProjectDetailsAction,
    changeProjectDetailsAction,
    setErrorProjectDetailsAction,
    projectDetailsSelector,
    unsetProjectDetailsAction,
    currentUserProjectsSelector,
} from '#redux';

import Faram, {
    requiredCondition,
    dateCondition,
} from '#rscg/Faram';

import { iconNames } from '#constants';
import _ts from '#ts';

import requests from './requests';
import Dashboard from './Dashboard';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectDetail: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectLocalData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activityLog: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    changeProjectDetails: PropTypes.func.isRequired,
    setErrorProjectDetails: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    readOnly: PropTypes.bool,

    // Requests Props
    // eslint-disable-next-line react/no-unused-prop-types
    userProjects: PropTypes.array.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectDetails: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    projectServerData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    unsetProject: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    projectGetRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    projectPutRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    projectDeleteRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
    projectLocalData: {},
    readOnly: false,
};

const mapStateToProps = state => ({
    userProjects: currentUserProjectsSelector(state),
    activityLog: projectActivityLogSelector(state),
    projectLocalData: projectLocalDataSelector(state),
    projectServerData: projectServerDataSelector(state),
    projectDetail: projectDetailsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectDetails: params => dispatch(setProjectDetailsAction(params)),
    changeProjectDetails: params => dispatch(changeProjectDetailsAction(params)),
    setErrorProjectDetails: params => dispatch(setErrorProjectDetailsAction(params)),
    unsetProject: params => dispatch(unsetProjectDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class ProjectDetailsGeneral extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideProjectDeleteButton = ({ setupPermissions }) => !setupPermissions.delete;

    constructor(props) {
        super(props);

        this.schema = {
            fields: {
                title: [requiredCondition],
                startDate: [dateCondition],
                endDate: [dateCondition],
                description: [],
            },
        };
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
        this.props.projectGetRequest.do({ isBeingCancelled: true });
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
        this.props.projectPutRequest.do({ projectDetails });
    }

    handleProjectDelete = () => {
        this.props.projectDeleteRequest.do({
            projectId: this.props.projectId,
        });
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
            readOnly,
            className: classNameFromProps,
            activityLog,
            projectId,
            projectDetail,
            projectLocalData: {
                faramValues = {},
                faramErrors,
                pristine,
            },
            projectGetRequest,
            projectPutRequest,
            projectDeleteRequest,
        } = this.props;

        const loading = (
            projectGetRequest.pending
            || projectPutRequest.pending
            || projectDeleteRequest.pending
        );
        const UnsavedChangesPrompt = this.renderUnsavedChangesPrompt;

        const className = `
            ${classNameFromProps}
            ${styles.general}
        `;

        if (loading) {
            return <LoadingAnimation className={className} />;
        }

        return (
            <div className={className}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    readOnly={readOnly}
                    disabled={loading}
                >
                    <div className={styles.inputsContainer}>
                        <header className={styles.header}>
                            <NonFieldErrors
                                faramElement
                                className={styles.nonFieldErrors}
                            />
                            <div className={styles.actionButtons}>
                                <DangerButton
                                    disabled={loading || pristine || readOnly}
                                    onClick={this.handleFaramCancel}
                                    className={styles.button}
                                >
                                    {_ts('project', 'cancelButtonLabel')}
                                </DangerButton>
                                <SuccessButton
                                    className={styles.button}
                                    disabled={loading || pristine || readOnly}
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
                    <Cloak
                        hide={ProjectDetailsGeneral.shouldHideProjectDeleteButton}
                        render={
                            <div className={styles.bottomContainer}>
                                <span className={`${styles.info} ${iconNames.info}`} />
                                <span className={styles.infoText}>
                                    {_ts('project', 'projectDeleteInfoText')}
                                </span>
                                <DangerConfirmButton
                                    iconName={iconNames.delete}
                                    onClick={this.handleProjectDelete}
                                    confirmationTitle="Warning!"
                                    confirmationMessage={_ts('project', 'deleteConfirmMessage', {
                                        title: <strong>{projectDetail.title}</strong>,
                                    })}
                                    challengeLabel={_ts('project', 'deleteConfirmLabel')}
                                    challengePlaceholder={_ts('project', 'deleteConfirmPlaceholder')}
                                    challengeValue={projectDetail.title}
                                    className={styles.deleteButton}
                                >
                                    {_ts('project', 'deleteButtonTitle')}
                                </DangerConfirmButton>
                            </div>
                        }
                    />
                </Faram>
                <Dashboard
                    className={styles.dashboard}
                    projectId={projectId}
                />
                <ActivityLog
                    log={activityLog}
                    className={styles.activityLog}
                />
                <UnsavedChangesPrompt />
            </div>
        );
    }
}
