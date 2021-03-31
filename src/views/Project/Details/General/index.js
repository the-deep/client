import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Prompt } from 'react-router-dom';
import { connect } from 'react-redux';
import Faram, {
    requiredCondition,
    dateCondition,
} from '@togglecorp/faram';
import {
    decodeDate,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import ListView from '#rscv/List/ListView';
import DangerButton from '#rsca/Button/DangerButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DateInput from '#rsci/DateInput';
import TextArea from '#rsci/TextArea';
import TextInput from '#rsci/TextInput';
import Message from '#rscv/Message';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';
import { organizationTitleSelector } from '#entities/organization';

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

import AddStakeholdersButton from './AddStakeholdersButton';
import ActivityLog from './ActivityLog';
import Dashboard from './Dashboard';
import requestOptions from './requests';
import styles from './styles.scss';

const EmptyComponent = ({ readOnly }) => (
    <Message>
        {readOnly
            ? _ts('project.detail.stakeholders', 'emptyReadOnlyMessage')
            : _ts('project.detail.stakeholders', 'emptyListMessage')
        }
    </Message>
);

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
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

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

const organizationFieldKeySelector = d => d.faramElementName;

const emptyList = [];
const fields = [
    {
        label: _ts('project.detail.stakeholders', 'leadOrganization'),
        faramElementName: 'lead_organization',
    },
    {
        label: _ts('project.detail.stakeholders', 'internationalPartner'),
        faramElementName: 'international_partner',
    },
    {
        label: _ts('project.detail.stakeholders', 'nationalPartner'),
        faramElementName: 'national_partner',
    },
    {
        label: _ts('project.detail.stakeholders', 'donor'),
        faramElementName: 'donor',
    },
    {
        label: _ts('project.detail.stakeholders', 'government'),
        faramElementName: 'government',
    },
];

const fieldsMap = listToMap(fields, d => d.faramElementName, d => d.label);

function OrganizationDetails({
    logo,
    title,
}) {
    return (
        <div className={styles.organizationDetails}>
            <div className={styles.logoContainer}>
                { logo ? (
                    <img
                        className={styles.img}
                        alt={title}
                        src={logo}
                    />
                ) : (
                    <Icon
                        className={styles.icon}
                        name="userGroup"
                    />
                )}
            </div>
            <div className={styles.title}>
                { title }
            </div>
        </div>
    );
}

const organizationDetailsKeySelector = d => d.organization;
const organizationDetailsRendererParams = (_, d) => ({
    logo: d.organizationDetails.logo,
    title: organizationTitleSelector(d.organizationDetails),
});

function OrganizationList(p) {
    const { data } = p;

    if (data.length === 0) {
        return null;
    }

    return (
        <div className={styles.organizationList}>
            <header className={styles.header}>
                <h4 className={styles.heading}>
                    { fieldsMap[data[0].organizationType] }
                </h4>
            </header>
            <ListView
                className={styles.content}
                data={data}
                renderer={OrganizationDetails}
                keySelector={organizationDetailsKeySelector}
                rendererParams={organizationDetailsRendererParams}
            />
        </div>
    );
}

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
        projectPutRequest.do({ projectDetails });
    }

    organizationListRendererParams = (key) => {
        const { projectLocalData: { faramValues: { organizations = [] } } } = this.props;
        const values = listToGroupList(
            organizations,
            o => o.organizationType,
            o => o,
        );

        const value = values[key] || emptyList;

        return { data: value };
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
                            <div className={styles.generalInputs}>
                                <TextInput
                                    label={_ts('project.general', 'projectNameLabel')}
                                    faramElementName="title"
                                    placeholder={_ts('project.general', 'projectNamePlaceholder')}
                                    className={styles.name}
                                />
                                <div className={styles.dateInput}>
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
                                </div>
                                <TextArea
                                    label={_ts('project.general', 'projectDescriptionLabel')}
                                    faramElementName="description"
                                    placeholder={_ts('project.general', 'projectDescriptionPlaceholder')}
                                    className={styles.description}
                                    rows={5}
                                    resize="vertical"
                                />
                            </div>
                            <div className={styles.stakeholders}>
                                <header className={styles.header}>
                                    <h3 className={styles.heading}>
                                        {_ts('project.detail.general', 'projectStakeholdersHeading')}
                                    </h3>
                                    <div className={styles.actions}>
                                        <AddStakeholdersButton
                                            disabled={readOnly}
                                        />
                                    </div>
                                </header>
                                {faramValues?.organizations?.length > 0 ? (
                                    <ListView
                                        className={styles.content}
                                        data={fields}
                                        rendererParams={this.organizationListRendererParams}
                                        renderer={OrganizationList}
                                        keySelector={organizationFieldKeySelector}
                                    />
                                ) : (
                                    <div className={styles.emptyContent}>
                                        <EmptyComponent
                                            readOnly={readOnly}
                                        />
                                    </div>
                                )}
                            </div>
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
