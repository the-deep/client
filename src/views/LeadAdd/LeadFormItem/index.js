import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import Message from '#rscv/Message';
import Modal from '#rscv/Modal';
import { FgRestBuilder } from '#rsu/rest';
import {
    requiredCondition,
    urlCondition,
} from '#rscg/Faram';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ResizableV from '#rscv/Resizable/ResizableV';
import update from '#rsu/immutable-update';

import { RequestCoordinator } from '#request';
import {
    InternalGallery,
    ExternalGallery,
} from '#components/DeepGallery';
import TabularBook from '#components/TabularBook';

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

@RequestCoordinator
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
            tabularMode: false,
            pendingExtraction: false,
            showAddLeadGroupModal: false,
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

    setTabularMode = (mimeType) => {
        this.setState({ tabularMode: true, tabularMimeType: mimeType });
    }

    setTabularBook = (tabularBook) => {
        this.handleFieldsChange({ tabularBook });
    }

    unsetTabularMode = () => {
        this.setState({ tabularMode: false, tabularMimeType: undefined });
    }

    unsetTabularBook = () => {
        this.handleFieldsChange({ tabularBook: undefined });
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
                // FIXME: use ravl
                const webInfo = response;

                const leadValues = leadAccessor.getFaramValues(this.props.lead);
                const leadFieldErrors = leadAccessor.getFaramErrors(this.props.lead);

                const values = { ...leadValues };
                const formFieldErrors = { ...leadFieldErrors };

                // if (webInfo.project) {
                //     values.project = [webInfo.project];
                //     formFieldErrors.project = undefined;
                // }
                if (webInfo.date) {
                    values.publishedOn = webInfo.date;
                    formFieldErrors.publishedOn = undefined;
                }
                if (webInfo.source) {
                    values.source = webInfo.source;
                    formFieldErrors.source = undefined;
                }
                if (webInfo.website) {
                    values.website = webInfo.website;
                    formFieldErrors.website = undefined;
                }
                if (webInfo.title) {
                    values.title = webInfo.title;
                    formFieldErrors.title = undefined;
                }
                if (webInfo.url) {
                    values.url = webInfo.url;
                    formFieldErrors.url = undefined;
                }

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

    handleFieldsChange = (fields = {}) => {
        const { lead: { faramValues = {}, faramErrors } = {} } = this.props;
        const newFaramValues = {
            ...faramValues,
            ...fields,
        };
        this.handleFormChange(newFaramValues, faramErrors);
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

        // If we have tabular, first trigger preLoad of lead,
        // save the tabular data and then save actual lead.
        // Triggering preLoad is a hack to set pending state of
        // corresponsing lead before doing actual leadSaveRequest.
    }

    handleFormChange = (faramValues, faramErrors) => {
        const {
            leadKey: leadId,
            addLeadViewLeadChange,
        } = this.props;

        addLeadViewLeadChange({
            leadId,
            faramValues,
            faramErrors,
            uiState: { pristine: false, serverError: false },
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
    }) => {
        const type = leadAccessor.getType(lead);
        const values = leadAccessor.getFaramValues(lead);

        switch (type) {
            case LEAD_TYPE.text:
                return null;
            case LEAD_TYPE.website:
                return (
                    <div className={className} >
                        {
                            values.url ? (
                                <ExternalGallery
                                    className={styles.galleryFile}
                                    url={values.url}
                                    onTabularClick={this.setTabularMode}
                                    showTabular={!this.state.tabularMode}
                                    showUrl
                                />
                            ) : (
                                <Message className={className}>
                                    {_ts('addLeads', 'sourcePreview')}
                                </Message>
                            )
                        }
                    </div>
                );
            default:
                return (
                    <div className={className} >
                        {
                            values.attachment ? (
                                <InternalGallery
                                    className={styles.galleryFile}
                                    galleryId={values.attachment && values.attachment.id}
                                    notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                                    onTabularClick={this.setTabularMode}
                                    showTabular={!this.state.tabularMode}
                                    showUrl
                                />
                            ) : (
                                <Message>
                                    {_ts('addLeads', 'previewNotAvailable')}
                                </Message>
                            )
                        }
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
            tabularMode,
            tabularMimeType,
        } = this.state;

        const LeadPreview = this.renderLeadPreview;

        const {
            faramValues: {
                project: projectId,
                sourceType,
                tabularBook,
            } = {},
        } = lead;
        const type = leadAccessor.getType(lead);
        const disableResize = type === LEAD_TYPE.text;
        const pending = isFormLoading || this.state.pendingExtraction;

        const className = `
            ${styles.right}
            ${!active ? styles.hidden : ''}
        `;

        const resizableClassName = `
            ${styles.resizable}
            ${sourceType === 'text' ? styles.textLead : ''}
        `;

        return (
            <div className={className}>
                { pending && <LoadingAnimation /> }
                <ResizableV
                    className={resizableClassName}
                    topContainerClassName={styles.top}
                    bottomContainerClassName={styles.bottom}
                    disabled={disableResize}
                    topChild={
                        <Fragment>
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
                                isExtractionDisabled={!this.state.isUrlValid}
                                onExtractClick={this.handleExtractClick}
                                {...otherProps}
                            />
                            { showAddLeadGroupModal &&
                                <AddLeadGroup
                                    onModalClose={this.handleAddLeadGroupModalClose}
                                    onLeadGroupAdd={this.handleLeadGroupAdd}
                                    projectId={projectId}
                                />
                            }
                            { tabularMode &&
                                <Modal
                                    className={styles.tabularModal}
                                    onClose={this.unsetTabularMode}
                                    closeOnEscape
                                >
                                    {
                                        tabularBook ? (
                                            <TabularBook
                                                className={className}
                                                bookId={tabularBook}
                                                projectId={projectId}
                                                onDelete={this.unsetTabularBook}
                                                setSaveTabularFunction={
                                                    this.setSaveTabularFunction
                                                }
                                                onEdited={this.handleFieldsChange}
                                                onCancel={this.unsetTabularMode}
                                                showDelete
                                            />
                                        ) : (
                                            <LeadTabular
                                                className={className}
                                                mimeType={tabularMimeType}
                                                setTabularBook={this.setTabularBook}
                                                onCancel={this.unsetTabularMode}
                                                lead={lead}
                                            />
                                        )
                                    }
                                </Modal>
                            }
                        </Fragment>
                    }
                    bottomChild={
                        active && !hidePreview && sourceType !== 'text' && (
                            <LeadPreview
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
