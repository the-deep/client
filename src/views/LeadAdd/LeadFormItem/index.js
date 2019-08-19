import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

import Message from '#rscv/Message';
import Modal from '#rscv/Modal';
import { FgRestBuilder } from '#rsu/rest';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ResizableV from '#rscv/Resizable/ResizableV';
import update from '#rsu/immutable-update';

import ExternalGallery from '#components/viewer/ExternalGallery';
import TabularBook from '#components/other/TabularBook';
import Attachment from '#components/viewer/Attachment';

import {
    addLeadViewLeadChangeAction,
    addLeadViewCopyAllBelowAction,
    addLeadViewCopyAllAction,
    addLeadViewHidePreviewSelector,
} from '#redux';
import {
    LEAD_TYPE,
    leadAccessor,
} from '#entities/lead';
import {
    urlForWebInfo,
    createParamsForWebInfo,
} from '#rest';
import _ts from '#ts';

import LeadForm from './LeadForm';
import AddLeadGroup from './AddLeadGroup';
import LeadTabular from './LeadTabular';
import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool.isRequired,
    leadKey: PropTypes.string.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    isFormLoading: PropTypes.bool.isRequired,
    onFormSubmitFailure: PropTypes.func.isRequired,
    onFormSubmitSuccess: PropTypes.func.isRequired,

    addLeadViewLeadChange: PropTypes.func.isRequired,

    addLeadViewCopyAllBelow: PropTypes.func.isRequired,
    addLeadViewCopyAll: PropTypes.func.isRequired,

    hidePreview: PropTypes.bool,

    setSubmitter: PropTypes.func,
};
const defaultProps = {
    hidePreview: false,
    setSubmitter: undefined,
};

const mapStateToProps = state => ({
    hidePreview: addLeadViewHidePreviewSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewCopyAllBelow: params => dispatch(addLeadViewCopyAllBelowAction(params)),
    addLeadViewCopyAll: params => dispatch(addLeadViewCopyAllAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class LeadFormItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isUrlValid = url => (requiredCondition(url).ok && urlCondition(url).ok)

    constructor(props) {
        super(props);

        const lead = leadAccessor.getFaramValues(this.props.lead);
        const isUrlValid = LeadFormItem.isUrlValid(lead.url);

        this.state = {
            isUrlValid,
            showTabularModal: false,
            pendingExtraction: false,
            showAddLeadGroupModal: false,
            isTabularCapable: true,
            tabularChangeKey: 1,
        };

        if (props.setSubmitter) {
            props.setSubmitter({
                start: this.start,
                stop: this.stop,
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        const oldLead = leadAccessor.getFaramValues(this.props.lead);
        const newLead = leadAccessor.getFaramValues(nextProps.lead);
        if (newLead.url !== oldLead.url) {
            const isUrlValid = LeadFormItem.isUrlValid(newLead.url);
            this.setState({ isUrlValid });
        }
    }

    componentWillUnmount() {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
        if (this.webInfoExtractRequest) {
            this.webInfoExtractRequest.stop();
        }
        if (this.props.setSubmitter) {
            this.props.setSubmitter(undefined);
        }
    }

    setSubmitLeadFormFunction = (func) => {
        this.submitLeadForm = func;
    }

    handleTabularBookSet = (tabularBook) => {
        // NOTE: tabuarBook need not be sent to server
        this.handleFieldsChange({ tabularBook }, true);
    }

    handleTabularModalClose = () => {
        const { tabularChangeKey } = this.state;

        this.setState({
            showTabularModal: false,
            tabularFileType: undefined,
            tabularChangeKey: tabularChangeKey + 1,
        });
    }

    handleTabularButtonClick = (response) => {
        const {
            fileType,
        } = response;

        this.setState({
            showTabularModal: true,
            tabularFileType: fileType,
        });
    }

    handleTabularBookDelete = () => {
        // NOTE: tabuarBook need not be sent to server
        this.handleFieldsChange({ tabularBook: undefined }, true);
        this.handleTabularModalClose();
    }

    createWebInfoExtractRequest = (url) => {
        const request = new FgRestBuilder()
            .url(urlForWebInfo)
            .params(createParamsForWebInfo({ url }))
            .preLoad(() => {
                this.setState({ pendingExtraction: true });
            })
            .postLoad(() => {
                this.setState({ pendingExtraction: false });
            })
            .success((response) => {
                // FIXME: use schema validation
                const webInfo = response;

                const leadValues = leadAccessor.getFaramValues(this.props.lead);
                const leadFieldErrors = leadAccessor.getFaramErrors(this.props.lead);

                const values = { ...leadValues };
                const formFieldErrors = { ...leadFieldErrors };

                const webInfoToValueMap = {
                    date: 'publishedOn',
                    source: 'source',
                    author: 'author',
                    website: 'website',
                    title: 'title',
                    url: 'url',
                };

                const webInfoKeys = Object.keys(webInfoToValueMap);
                webInfoKeys.forEach((key) => {
                    if (webInfo[key]) {
                        const valueKey = webInfoToValueMap[key];
                        values[valueKey] = webInfo[key];
                        formFieldErrors[valueKey] = undefined;
                    }
                });


                this.props.addLeadViewLeadChange({
                    leadId: this.props.leadKey,
                    faramValues: values,
                    faramErrors: {},
                    uiState: { pristine: false, serverError: false },
                });
            })
            .build();
        return request;
    }

    handleExtractClick = () => {
        if (this.webInfoExtractRequest) {
            this.webInfoExtractRequest.stop();
        }

        const lead = leadAccessor.getFaramValues(this.props.lead);
        this.webInfoExtractRequest = this.createWebInfoExtractRequest(lead.url);
        this.webInfoExtractRequest.start();
    }

    handleFieldsChange = (fields = {}, ignorePristineChange) => {
        const { lead: { faramValues = {}, faramErrors } = {} } = this.props;
        const newFaramValues = {
            ...faramValues,
            ...fields,
        };
        this.handleFormChange(newFaramValues, faramErrors, undefined, ignorePristineChange);
    }

    handleFormSuccess = (newValues) => {
        const {
            lead,
            onFormSubmitSuccess,
        } = this.props;
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
        this.leadSaveRequest = onFormSubmitSuccess(lead, newValues);
        this.leadSaveRequest.start();
    }

    handleFormChange = (faramValues, faramErrors, faramInfo, ignorePristineChange) => {
        const {
            leadKey: leadId,
            addLeadViewLeadChange,
        } = this.props;

        addLeadViewLeadChange({
            leadId,
            faramValues,
            faramErrors,
            uiState: ignorePristineChange ? undefined : { pristine: false, serverError: false },
        });
    }

    handleFormFailure = (faramErrors) => {
        const {
            leadKey: leadId,
            addLeadViewLeadChange,
            onFormSubmitFailure,
        } = this.props;

        addLeadViewLeadChange({
            leadId,
            faramErrors,
            uiState: { pristine: true, serverError: false },
        });

        onFormSubmitFailure(leadId);
    }

    handleAddLeadGroupClick = () => {
        this.setState({ showAddLeadGroupModal: true });
    }

    handleAddLeadGroupModalClose = () => {
        this.setState({ showAddLeadGroupModal: false });
    }

    handleLeadGroupAdd = (newLeadGroup) => {
        const {
            lead = {},
            leadKey: leadId,
            addLeadViewLeadChange,
        } = this.props;

        const settings = {
            faramErrors: {
                $internal: { $set: undefined },
                leadGroup: { $set: undefined },
            },
            faramValues: {
                leadGroup: { $set: newLeadGroup.key },
            },
        };
        const newLeadData = update(lead, settings);

        const {
            faramErrors,
            faramValues,
        } = newLeadData;

        addLeadViewLeadChange({
            leadId,
            faramValues,
            faramErrors,
            uiState: { pristine: false, serverError: false },
        });
    }

    handleApplyAllClick = (applyAttribute) => {
        const {
            leadKey,
            addLeadViewCopyAll,
        } = this.props;
        addLeadViewCopyAll({ leadId: leadKey, attrName: applyAttribute });
    }

    handleApplyAllBelowClick = (applyAttribute) => {
        const {
            leadKey,
            addLeadViewCopyAllBelow,
        } = this.props;
        addLeadViewCopyAllBelow({ leadId: leadKey, attrName: applyAttribute });
    }

    // CO-ORDINATOR

    start = () => {
        const {
            onFormSubmitFailure,
            leadKey,
        } = this.props;

        if (this.submitLeadForm) {
            const submittable = this.submitLeadForm();
            if (!submittable) {
                onFormSubmitFailure(leadKey);
            }
        }
    }

    stop = () => {
        // Cleanup not required
        // noop
    }

    // RENDER

    renderLeadPreview = ({
        lead,
        className,
        key,
    }) => {
        const type = leadAccessor.getType(lead);
        const values = leadAccessor.getFaramValues(lead);
        const {
            faramValues: {
                project: projectId,
            } = {},
        } = lead;

        switch (type) {
            case LEAD_TYPE.text:
                return null;
            case LEAD_TYPE.website:
                return (
                    <div className={className} >
                        { values.url ? (
                            <ExternalGallery
                                className={styles.galleryFile}
                                url={values.url}
                                showUrl
                            />
                        ) : (
                            <Message className={className}>
                                {_ts('addLeads', 'sourcePreview')}
                            </Message>
                        ) }
                    </div>
                );
            default:
                return (
                    <div className={className} >
                        { values.attachment ? (
                            <Attachment
                                key={key}
                                attachment={values.attachment}
                                title={values.title}
                                tabularBook={values.tabularBook}
                                className={styles.galleryFile}
                                projectId={projectId}
                                onTabularButtonClick={this.handleTabularButtonClick}
                            />
                        ) : (
                            <Message>
                                {_ts('addLeads', 'previewNotAvailable')}
                            </Message>
                        ) }
                    </div>
                );
        }
    }

    render() {
        const {
            active,
            lead = {},
            isFormLoading,
            leadKey, // eslint-disable-line no-unused-vars
            onFormSubmitFailure, // eslint-disable-line no-unused-vars
            onFormSubmitSuccess, // eslint-disable-line no-unused-vars
            addLeadViewLeadChange, // eslint-disable-line no-unused-vars
            addLeadViewCopyAllBelow, // eslint-disable-line no-unused-vars
            addLeadViewCopyAll, // eslint-disable-line no-unused-vars
            hidePreview,
            ...otherProps
        } = this.props;

        const {
            showAddLeadGroupModal,
            showTabularModal,
            tabularFileType,
            isTabularCapable,
            isUrlValid,
            pendingExtraction,
            tabularChangeKey,
        } = this.state;

        const LeadPreview = this.renderLeadPreview;

        const {
            faramValues: {
                title,
                project: projectId,
                sourceType,
                tabularBook,
                attachment: {
                    id: attachmentId,
                } = {},
            } = {},
        } = lead;

        const type = leadAccessor.getType(lead);
        const disableResize = type === LEAD_TYPE.text;
        const pending = isFormLoading || pendingExtraction;

        const className = `
            ${styles.right}
            ${!active ? styles.hidden : ''}
        `;

        const resizableClassName = `
            ${styles.resizable}
            ${sourceType === 'text' ? styles.textLead : ''}
        `;

        const showLeadPreview = active && !hidePreview && sourceType !== 'text';

        return (
            <div className={className}>
                { pending && <LoadingAnimation /> }
                { showAddLeadGroupModal && (
                    <AddLeadGroup
                        onModalClose={this.handleAddLeadGroupModalClose}
                        onLeadGroupAdd={this.handleLeadGroupAdd}
                        projectId={projectId}
                    />
                ) }
                { showTabularModal && (
                    <Modal
                        className={styles.tabularModal}
                        onClose={this.handleTabularModalClose}
                    >
                        {
                            tabularBook || tabularFileType !== 'csv' ? (
                                <TabularBook
                                    leadTitle={title}
                                    className={styles.tabularBook}
                                    bookId={tabularBook}
                                    projectId={projectId}
                                    onDelete={this.handleTabularBookDelete}
                                    onCancel={this.handleTabularModalClose}
                                    fileId={attachmentId}
                                    fileType={tabularFileType}
                                    onTabularBookCreate={this.handleTabularBookSet}
                                />
                            ) : (
                                <LeadTabular
                                    className={styles.leadTabular}
                                    fileType={tabularFileType}
                                    setTabularBook={this.handleTabularBookSet}
                                    onCancel={this.handleTabularModalClose}
                                    lead={lead}
                                />
                            )
                        }
                    </Modal>
                ) }
                <ResizableV
                    className={resizableClassName}
                    topContainerClassName={styles.top}
                    bottomContainerClassName={styles.bottom}
                    disabled={disableResize}
                    topChild={
                        <LeadForm
                            setSubmitFunction={this.setSubmitLeadFormFunction}
                            lead={lead}
                            projectId={projectId}
                            onChange={this.handleFormChange}
                            onFailure={this.handleFormFailure}
                            onSuccess={this.handleFormSuccess}
                            onApplyAllClick={this.handleApplyAllClick}
                            onApplyAllBelowClick={this.handleApplyAllBelowClick}
                            onAddLeadGroupClick={this.handleAddLeadGroupClick}
                            isExtractionDisabled={!isUrlValid}
                            onExtractClick={this.handleExtractClick}
                            isTabularCapable={isTabularCapable}
                            {...otherProps}
                        />
                    }
                    bottomChild={
                        showLeadPreview && (
                            <LeadPreview
                                key={tabularChangeKey}
                                lead={lead}
                                className={styles.leadPreview}
                            />
                        )
                    }
                />
            </div>
        );
    }
}
