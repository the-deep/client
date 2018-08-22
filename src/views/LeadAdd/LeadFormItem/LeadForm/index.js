import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import Button from '#rsca/Button';
import DateInput from '#rsci/DateInput';
import Faram, {
    requiredCondition,
    urlCondition,
    dateCondition,
} from '#rscg/Faram';
import HiddenInput from '#rsci/HiddenInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SelectInput from '#rsci/SelectInput';
import TextArea from '#rsci/TextArea';
import TextInput from '#rsci/TextInput';
import FormattedDate from '#rscv/FormattedDate';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    LEAD_TYPE,
    ATTACHMENT_TYPES,
    leadAccessor,
} from '#entities/lead';
import { InternalGallery } from '#components/DeepGallery';
import Cloak from '#components/Cloak';
import {
    activeUserSelector,
    projectDetailsSelector,
} from '#redux';
import { iconNames } from '#constants';
import _ts from '#ts';

import ApplyAll, { ExtractThis } from './ApplyAll';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,

    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    lead: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    leadOptions: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    onSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,
    onAddLeadGroupClick: PropTypes.func.isRequired,

    isSaveDisabled: PropTypes.bool.isRequired,
    isFormDisabled: PropTypes.bool.isRequired,
    isFormLoading: PropTypes.bool.isRequired,
    isBulkActionDisabled: PropTypes.bool.isRequired,

    isExtractionDisabled: PropTypes.bool.isRequired,
    isExtractionLoading: PropTypes.bool.isRequired,
    onExtractClick: PropTypes.func.isRequired,

    setSubmitFunction: PropTypes.func,
};

const defaultProps = {
    className: '',
    setSubmitFunction: undefined,
};

const mapStateToProps = (state, props) => ({
    activeUser: activeUserSelector(state),
    projectDetails: projectDetailsSelector(state, props),
});

@connect(mapStateToProps)
export default class LeadForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = d => (d || {}).key
    static labelSelector = d => (d || {}).value

    static setDefaultValues = (leadOptions, lead, activeUser, onChange) => {
        const values = leadAccessor.getFaramValues(lead);
        const activeUserId = activeUser.userId;

        const newValues = { ...values };
        let valuesChanged = false;

        if (
            !values.confidentiality &&
            leadOptions && leadOptions.confidentiality && leadOptions.confidentiality.length > 0
        ) {
            newValues.confidentiality = LeadForm.keySelector(leadOptions.confidentiality[0]);
            valuesChanged = true;
        }

        if (
            (!values.assignee || values.assignee.length === 0) &&
            leadOptions && leadOptions.assignee && leadOptions.assignee.length > 0 &&
            leadOptions.assignee.find(user => LeadForm.keySelector(user) === activeUserId)
        ) {
            newValues.assignee = activeUserId;
            valuesChanged = true;
        }

        // FIXME: don't use this, use utils by dahal
        if (!values.publishedOn) {
            const now = new Date();
            newValues.publishedOn = FormattedDate.format(now, 'yyyy-MM-dd');
            valuesChanged = true;
        }

        if (valuesChanged) {
            onChange(newValues);
        }
    }

    static getSchemaForLead = (type) => {
        switch (type) {
            case LEAD_TYPE.file:
            case LEAD_TYPE.dropbox:
            case LEAD_TYPE.drive:
                return {
                    fields: {
                        title: [requiredCondition],
                        source: [requiredCondition],
                        confidentiality: [requiredCondition],
                        assignee: [requiredCondition],
                        publishedOn: [requiredCondition, dateCondition],
                        sourceType: [requiredCondition],
                        project: [requiredCondition],
                        leadGroup: [],

                        attachment: [requiredCondition],
                    },
                };
            case LEAD_TYPE.website:
                return {
                    fields: {
                        title: [requiredCondition],
                        source: [requiredCondition],
                        confidentiality: [requiredCondition],
                        assignee: [requiredCondition],
                        publishedOn: [requiredCondition, dateCondition],
                        sourceType: [requiredCondition],
                        project: [requiredCondition],
                        leadGroup: [],

                        url: [requiredCondition, urlCondition],
                        website: [requiredCondition],
                    },
                };
            case LEAD_TYPE.text:
                return {
                    fields: {
                        title: [requiredCondition],
                        source: [requiredCondition],
                        confidentiality: [requiredCondition],
                        assignee: [requiredCondition],
                        publishedOn: [requiredCondition, dateCondition],
                        sourceType: [requiredCondition],
                        project: [requiredCondition],
                        leadGroup: [],

                        text: [requiredCondition],
                    },
                };
            default:
                return {
                    fields: {},
                };
        }
    }

    constructor(props) {
        super(props);

        const { lead } = props;
        const leadType = leadAccessor.getType(lead);
        this.schema = LeadForm.getSchemaForLead(leadType);

        if (props.setSubmitFunction) {
            props.setSubmitFunction(this.submit);
        }
    }

    componentDidMount() {
        const { leadOptions, lead, activeUser, onChange } = this.props;
        LeadForm.setDefaultValues(leadOptions, lead, activeUser, onChange);
    }

    componentWillReceiveProps(nextProps) {
        const { leadOptions: oldLeadOptions } = this.props;
        if (nextProps.leadOptions !== oldLeadOptions) {
            const { leadOptions, lead, activeUser, onChange } = nextProps;
            LeadForm.setDefaultValues(leadOptions, lead, activeUser, onChange);
        }
    }

    componentWillUnmount() {
        if (this.props.setSubmitFunction) {
            this.props.setSubmitFunction(undefined);
        }
    }

    setSubmitFormFunction = (func) => {
        this.submitForm = func;
    }

    handleApplyAllClick = attrName => this.props.onApplyAllClick(attrName);

    handleApplyAllBelowClick = attrName => this.props.onApplyAllBelowClick(attrName);

    handleAddLeadGroupClick = () => this.props.onAddLeadGroupClick();

    submit = () => {
        if (this.submitForm && !this.props.isSaveDisabled) {
            this.submitForm();
            return true;
        }
        return false;
    }

    render() {
        const {
            className,
            lead,

            leadOptions = {},
            onChange,
            onFailure,
            onSuccess,
            isFormDisabled,
            isFormLoading,
            isBulkActionDisabled,

            isExtractionDisabled,
            isExtractionLoading,
            onExtractClick,
            projectDetails,
        } = this.props;

        const values = leadAccessor.getFaramValues(lead);
        const type = leadAccessor.getType(lead);
        const errors = leadAccessor.getFaramErrors(lead);

        const isApplyAllDisabled = isFormDisabled || isBulkActionDisabled;

        return (
            <Faram
                setSubmitFunction={this.setSubmitFormFunction}
                className={`${styles.addLeadForm} ${className}`}
                onChange={onChange}
                onValidationFailure={onFailure}
                onValidationSuccess={onSuccess}
                schema={this.schema}
                value={values}
                error={errors}
                disabled={isFormDisabled}
            >
                {
                    (isFormLoading || isExtractionLoading) && <LoadingAnimation />
                }
                <header className={styles.header}>
                    <NonFieldErrors faramElement />
                </header>
                <HiddenInput faramElementName="sourceType" />
                {
                    type === LEAD_TYPE.website && [
                        <ExtractThis
                            key="url"
                            className={styles.url}
                            disabled={isFormDisabled || isExtractionDisabled}
                            onClick={onExtractClick}
                        >
                            <TextInput
                                faramElementName="url"
                                label={_ts('addLeads', 'urlLabel')}
                                placeholder={_ts('addLeads', 'urlPlaceholderLabel')}
                                autoFocus
                            />
                        </ExtractThis>,
                        <TextInput
                            faramElementName="website"
                            key="website"
                            label={_ts('addLeads', 'websiteLabel')}
                            placeholder={_ts('addLeads', 'urlPlaceholderLabel')}
                            className={styles.website}
                        />,
                    ]
                }
                {
                    type === LEAD_TYPE.text &&
                        <TextArea
                            faramElementName="text"
                            label={_ts('addLeads', 'textLabel')}
                            placeholder={_ts('addLeads', 'textareaPlaceholderLabel')}
                            rows="3"
                            className={styles.text}
                            autoFocus
                        />
                }
                {/* TODO: change from disabled to readonly */}
                <SelectInput
                    disabled
                    formoverrides={['disabled']}
                    faramElementName="project"
                    keySelector={LeadForm.keySelector}
                    label={_ts('addLeads', 'projectLabel')}
                    labelSelector={LeadForm.labelSelector}
                    options={leadOptions.project}
                    placeholder={_ts('addLeads', 'projectPlaceholderLabel')}
                    showHintAndError
                    showLabel
                    className={styles.project}
                />

                <Cloak
                    hide={() => !projectDetails.assessmentTemplate}
                    render={({ disabled }) => (
                        <div className={styles.leadGroupContainer}>
                            <ApplyAll
                                className={styles.leadGroup}
                                disabled={isApplyAllDisabled}
                                identiferName="leadGroup"
                                onApplyAllClick={this.handleApplyAllClick}
                                onApplyAllBelowClick={this.handleApplyAllBelowClick}
                            >
                                <SelectInput
                                    faramElementName="leadGroup"
                                    keySelector={LeadForm.keySelector}
                                    label={_ts('addLeads', 'leadGroupLabel')}
                                    labelSelector={LeadForm.labelSelector}
                                    options={leadOptions.leadGroup}
                                    placeholder={_ts('addLeads', 'selectInputPlaceholderLabel')}
                                    showHintAndError
                                    showLabel
                                />
                            </ApplyAll>
                            <Button
                                onClick={this.handleAddLeadGroupClick}
                                iconName={iconNames.add}
                                transparent
                                disabled={disabled}
                            />
                        </div>
                    )}
                    renderOnCloak={() => <div className={styles.leadGroupContainer} />}
                />

                <TextInput
                    className={styles.title}
                    faramElementName="title"
                    label={_ts('addLeads', 'titleLabel')}
                    placeholder={_ts('addLeads', 'titlePlaceHolderLabel')}
                />
                <ApplyAll
                    className={styles.source}
                    disabled={isApplyAllDisabled}
                    identiferName="source"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <TextInput
                        faramElementName="source"
                        label={_ts('addLeads', 'publisherLabel')}
                        placeholder={_ts('addLeads', 'publisherPlaceHolderLabel')}
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.confidentiality}
                    disabled={isApplyAllDisabled}
                    identiferName="confidentiality"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <SelectInput
                        faramElementName="confidentiality"
                        keySelector={LeadForm.keySelector}
                        label={_ts('addLeads', 'confidentialityLabel')}
                        labelSelector={LeadForm.labelSelector}
                        options={leadOptions.confidentiality}
                        placeholder={_ts('addLeads', 'selectInputPlaceholderLabel')}
                        showHintAndError
                        showLabel
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.user}
                    disabled={isApplyAllDisabled}
                    identiferName="assignee"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <SelectInput
                        faramElementName="assignee"
                        keySelector={LeadForm.keySelector}
                        label={_ts('addLeads', 'assigneeLabel')}
                        labelSelector={LeadForm.labelSelector}
                        options={leadOptions.assignee}
                        placeholder={_ts('addLeads', 'selectInputPlaceholderLabel')}
                        showHintAndError
                        showLabel
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.date}
                    disabled={isApplyAllDisabled}
                    identiferName="publishedOn"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <DateInput
                        faramElementName="publishedOn"
                        label={_ts('addLeads', 'datePublishedLabel')}
                        placeholder={_ts('addLeads', 'datePublishedPlaceholderLabel')}
                    />
                </ApplyAll>

                {
                    // one of drive, dropbox, or file
                    ATTACHMENT_TYPES.indexOf(type) !== -1 && (
                        <Fragment>
                            <div className={styles.fileTitle}>
                                {
                                    values.attachment && (
                                        <InternalGallery
                                            onlyFileName
                                            galleryId={values.attachment.id}
                                        />
                                    )
                                }
                            </div>
                            <HiddenInput
                                faramElementName="attachment"
                                value={values.attachment || ''}
                            />
                        </Fragment>
                    )
                }
            </Faram>
        );
    }
}
