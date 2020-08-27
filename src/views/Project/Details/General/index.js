import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Prompt } from 'react-router-dom';
import { connect } from 'react-redux';
import Faram, {
    requiredCondition,
    dateCondition,
} from '@togglecorp/faram';
import { decodeDate } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import Button from '#rsu/../v2/Action/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DateInput from '#rsci/DateInput';
import TextArea from '#rsci/TextArea';
import TextInput from '#rsci/TextInput';
import modalize from '#rscg/Modalize';

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
    routeUrlSelector,
} from '#redux';

import _ts from '#ts';

import StakeholdersModal from './StakeholdersModal';
import ActivityLog from './ActivityLog';
import Dashboard from './Dashboard';
import requestOptions from './requests';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectLocalData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activityLog: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    changeProjectDetails: PropTypes.func.isRequired,
    setErrorProjectDetails: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    readOnly: PropTypes.bool,
    routeUrl: PropTypes.string.isRequired,

    // Requests Props
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectDetails: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    projectServerData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    unsetProject: PropTypes.func.isRequired,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const StakeholderButton = props => (
    <Button
        buttonType="button-accent"
        iconName="people"
        transparent
        {...props}
    />
);
const ModalButton = modalize(StakeholderButton);

const defaultProps = {
    className: '',
    projectLocalData: {},
    readOnly: false,
};

const mapStateToProps = state => ({
    activityLog: projectActivityLogSelector(state),
    projectLocalData: projectLocalDataSelector(state),
    projectServerData: projectServerDataSelector(state),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectDetails: params => dispatch(setProjectDetailsAction(params)),
    changeProjectDetails: params => dispatch(changeProjectDetailsAction(params)),
    setErrorProjectDetails: params => dispatch(setErrorProjectDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class ProjectDetailsGeneral extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.schema = {
            fields: {
                title: [requiredCondition],
                startDate: [dateCondition],
                endDate: [dateCondition],
                description: [],
                organizations: [],
            },
            validation: ({ startDate, endDate } = {}) => {
                const errors = [];
                if (startDate && endDate && decodeDate(startDate) > decodeDate(endDate)) {
                    // FIXME: use strings
                    errors.push('Start date must be before end date');
                }
                return errors;
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
        const {
            requests: {
                projectGetRequest,
            },
        } = this.props;
        projectGetRequest.do({ isBeingCancelled: true });
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
        const {
            requests: {
                projectPutRequest,
            },
        } = this.props;
        const organizations = projectDetails.organizations || {};
        const newProjectDetails = {
            ...projectDetails,
            leadOrganizations: organizations.leadOrganizations,
            internationalPartners: organizations.internationalPartners,
            donors: organizations.donors,
            nationalPartners: organizations.nationalPartners,
            government: organizations.government,
        };
        projectPutRequest.do({ newProjectDetails });
    }

    renderUnsavedChangesPrompt = () => (
        <Prompt
            message={
                (location) => {
                    const { routeUrl } = this.props;
                    if (location.pathname === routeUrl) {
                        return true;
                    }

                    const {
                        projectLocalData: { pristine },
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
            projectLocalData: {
                faramValues = {},
                faramErrors,
                pristine,
            },
            requests: {
                projectGetRequest,
                projectPutRequest,
            },
        } = this.props;

        const loading = (
            projectGetRequest.pending
            || projectPutRequest.pending
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
                >
                    <div className={styles.inputsContainer}>
                        <header className={styles.header}>
                            <NonFieldErrors
                                faramElement
                                className={styles.nonFieldErrors}
                            />
                            <div className={styles.actionButtons}>
                                <DangerButton
                                    disabled={pristine || readOnly}
                                    onClick={this.handleFaramCancel}
                                    className={styles.button}
                                >
                                    {_ts('project', 'cancelButtonLabel')}
                                </DangerButton>
                                <SuccessButton
                                    className={styles.button}
                                    disabled={pristine || readOnly}
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
                                rows={7}
                                resize="vertical"
                            />
                            <ModalButton
                                className={styles.modalButton}
                                modal={
                                    <StakeholdersModal
                                        faramElementName="organizations"
                                    />
                                }
                            >
                                {_ts('project.detail.general', 'stakeholder')}
                            </ModalButton>
                        </div>
                    </div>
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
