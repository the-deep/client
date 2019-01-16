import PropTypes from 'prop-types';
import React from 'react';
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
import InternalGallery from '#components/viewer/InternalGallery';
import ExternalGallery from '#components/viewer/ExternalGallery';
import TabularBook from '#components/other/TabularBook';

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
            isTabularCapable: true,
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
        this.handleFieldsChange({ tabularBook });
    }

    handleTabularModalClose = () => {
        this.setState({
            showTabularModal: false,
            tabularMimeType: undefined,
        });
    }

    handleTabularButtonClick = (mimeType) => {
        this.setState({
            showTabularModal: true,
            tabularMimeType: mimeType,
        });
    }

    handleTabularBookDelete = () => {
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

                const webInfoToValueMap = {
                    date: 'publishedOn',
                    source: 'source',
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
                            <InternalGallery
                                className={styles.galleryFile}
                                galleryId={values.attachment && values.attachment.id}
                                notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                                showUrl
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
            tabularMode,
            tabularMimeType,
            showTabularModal,
            isTabularCapable,
            isUrlValid,
            pendingExtraction,
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
                        closeOnEscape
                    >
                        {
                            tabularBook ? (
                                <TabularBook
                                    className={className}
                                    bookId={tabularBook}
                                    projectId={projectId}
                                    onDelete={this.handleTabularBookDelete}
                                    setSaveTabularFunction={this.setSaveTabularFunction}
                                    onEdited={this.handleFieldsChange}
                                    onCancel={this.handleTabularModalClose}
                                />
                            ) : (
                                <LeadTabular
                                    className={className}
                                    mimeType={tabularMimeType}
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
                            onTabularButtonClick={this.handleTabularButtonClick}
                            {...otherProps}
                        />
                    }
                    bottomChild={
                        showLeadPreview && (
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
