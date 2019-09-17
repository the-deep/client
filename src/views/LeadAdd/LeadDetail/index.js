import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    formatDateToString,
    isDefined,
    isFalsyString,
    isTruthy,
    listToMap,
    unique,
} from '@togglecorp/fujs';
import Faram, {
    FaramInputElement,
    accumulateDifferentialErrors,
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';
import produce from 'immer';

import Button from '#rsca/Button';
import Modalize from '#rscg/Modalize';
import DateInput from '#rsci/DateInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SelectInput from '#rsci/SelectInput';
import TextArea from '#rsci/TextArea';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import BasicSelectInput from '#rsu/../v2/Input/BasicSelectInput';

import {
    RequestClient,
    RequestCoordinator,
    requestMethods,
} from '#request';

import Cloak from '#components/general/Cloak';
import AddOrganizationModal from '#components/other/AddOrganizationModal';
import InternalGallery from '#components/viewer/InternalGallery';

import _ts from '#ts';

import {
    ATTACHMENT_TYPES,
    LEAD_TYPE,
    isLeadFormDisabled,
    isLeadFormLoading,
    leadFaramErrorsSelector,
    leadFaramValuesSelector,
    leadIdSelector,
    leadKeySelector,
    leadSourceTypeSelector,
} from '../utils';

import AddLeadGroup from './AddLeadGroup';
import ApplyAll, { ExtractThis } from './ApplyAll';

import schema from './faramSchema';
import styles from './styles.scss';


const FaramBasicSelectInput = FaramInputElement(BasicSelectInput);
const ModalButton = Modalize(Button);

const propTypes = {
    className: PropTypes.string,
    activeUserId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    projects: PropTypes.array,

    bulkActionDisabled: PropTypes.bool,

    onChange: PropTypes.func.isRequired,
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,

    // onLeadSave: PropTypes.func.isRequired,
    // onLeadRemove: PropTypes.func.isRequired,
    // onLeadExport: PropTypes.func.isRequired,

    leadState: PropTypes.string.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    webInfoRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leadOptionsRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    organizationsRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    className: undefined,
    bulkActionDisabled: false,

    projects: [],
};


const idSelector = item => item.id;

const keySelector = item => item.key;

const labelSelector = item => item.value;

const titleSelector = item => item.title;

const displayNameSelector = item => item.displayName;

function fillExtraInfo(values, leadOptions, activeUserId) {
    const newValues = produce(values, (safeValues) => {
        if (!safeValues.assignee) {
            // eslint-disable-next-line no-param-reassign
            safeValues.assignee = activeUserId;
        } else {
            const memberMapping = listToMap(
                leadOptions.members,
                member => member.id,
                () => true,
            );
            if (!memberMapping[safeValues.assignee]) {
                // eslint-disable-next-line no-param-reassign
                safeValues.assignee = undefined;
            }
        }

        if (
            !safeValues.confidentiality
            && leadOptions.confidentiality
            && leadOptions.confidentiality.length > 0
        ) {
            // eslint-disable-next-line no-param-reassign
            safeValues.confidentiality = leadOptions.confidentiality[0].key;
        }

        if (!safeValues.publishedOn) {
            const now = new Date();
            // eslint-disable-next-line no-param-reassign
            safeValues.publishedOn = formatDateToString(now, 'yyyy-MM-dd');
        }
    });
    return newValues;
}

function fillWebInfo(values, webInfo) {
    const newValues = produce(values, (safeValues) => {
        if ((!safeValues.project || safeValues.project.length <= 0) && webInfo.project) {
            // eslint-disable-next-line no-param-reassign
            safeValues.project = [webInfo.project];
        }
        if (!safeValues.date && webInfo.date) {
            // eslint-disable-next-line no-param-reassign
            safeValues.publishedOn = webInfo.date;
        }
        if (!safeValues.website && webInfo.website) {
            // eslint-disable-next-line no-param-reassign
            safeValues.website = webInfo.website;
        }
        if (!safeValues.title && webInfo.title) {
            // eslint-disable-next-line no-param-reassign
            safeValues.title = webInfo.title;
        }
        if (!safeValues.url && webInfo.url) {
            // eslint-disable-next-line no-param-reassign
            safeValues.url = webInfo.url;
        }
        if (!safeValues.source && webInfo.source) {
            // eslint-disable-next-line no-param-reassign
            safeValues.source = webInfo.source.id;
        }
        if (!safeValues.author && webInfo.author) {
            // eslint-disable-next-line no-param-reassign
            safeValues.author = webInfo.author.id;
        }
    });
    return newValues;
}

function isUrlValid(url) {
    return (requiredCondition(url).ok && urlCondition(url).ok);
}

function mergeLists(foo, bar) {
    return unique(
        [
            ...foo,
            ...bar,
        ],
        item => item.id,
    );
}

const requests = {
    webInfoRequest: {
        url: '/web-info-extract/',
        body: ({ params: { url } }) => ({ url }),
        method: requestMethods.POST,
        onSuccess: ({ params, response }) => {
            params.handleWebInfoFill(response);
        },
        // schemaName: 'webInfo',
    },

    leadOptionsRequest: {
        url: '/lead-options/',
        method: requestMethods.POST,

        body: ({ props: { lead } }) => {
            const inputValues = leadFaramValuesSelector(lead);
            return {
                projects: [inputValues.project],
                leadGroups: [], // this will not fetch any leadGroups
                organizations: unique(
                    [
                        inputValues.source,
                        inputValues.author,
                    ].filter(isDefined),
                    id => id,
                ),
            };
        },
        onSuccess: ({ params, response }) => {
            params.handleExtraInfoFill(response);
        },
        onMount: ({ props: { lead } }) => {
            const initialProject = leadFaramValuesSelector(lead).project;
            return isDefined(initialProject);
        },
        onPropsChanged: {
            lead: ({
                prevProps: { lead: oldLead },
                props: { lead: newLead },
            }) => {
                const oldProject = leadFaramValuesSelector(oldLead).project;
                const newProject = leadFaramValuesSelector(newLead).project;

                return newProject !== oldProject && isDefined(newProject);
            },
        },
        // schemaName: 'leadOptions',
    },

    organizationsRequest: {
        url: '/organizations/',
        query: ({ params }) => ({
            search: params.searchText,
            // limit: 30,
        }),
        method: requestMethods.GET,
        onSuccess: ({ params, response }) => {
            params.setSearchedOrganizations(response.results);
        },
        options: {
            delay: 300,
        },
    },
};

class LeadForm extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddLeadGroupModal: false,

            searchedOrganizations: [],
            // Organizations filled by web-info-extract and lead-options
            organizations: [],
        };

        const {
            leadOptionsRequest,
        } = this.props;

        leadOptionsRequest.setDefaultParams({
            handleExtraInfoFill: this.handleExtraInfoFill,
        });
    }

    setSearchedOrganizations = (searchedOrganizations) => {
        this.setState({ searchedOrganizations });
    }

    setOrganizations = (organizations) => {
        this.setState({ organizations });
    }

    shouldHideLeadGroupInput = () => {
        const {
            lead,
            projects,
        } = this.props;
        const values = leadFaramValuesSelector(lead);
        const { project: projectId } = values;
        const project = projects.find(p => idSelector(p) === projectId);
        return !project || !project.assessmentTemplate;
    };

    handleAddLeadGroupClick = () => {
        this.setState({ showAddLeadGroupModal: true });
    }

    handleAddLeadGroupModalClose = () => {
        this.setState({ showAddLeadGroupModal: false });
    }

    handleExtractClick = () => {
        const { lead } = this.props;
        const values = leadFaramValuesSelector(lead);
        const { url } = values;

        this.props.webInfoRequest.do({
            url,
            handleWebInfoFill: this.handleWebInfoFill,
        });
    }

    handleApplyAllClick = (attrName) => {
        const {
            onApplyAllClick,
            lead,
        } = this.props;

        const key = leadKeySelector(lead);
        const values = leadFaramValuesSelector(lead);
        const attrValue = values[attrName];
        onApplyAllClick(key, values, attrName, attrValue);
    }

    handleApplyAllBelowClick = (attrName) => {
        const {
            onApplyAllBelowClick,
            lead,
        } = this.props;

        const key = leadKeySelector(lead);
        const values = leadFaramValuesSelector(lead);
        const attrValue = values[attrName];
        onApplyAllBelowClick(key, values, attrName, attrValue);
    }

    handleFaramChange = (faramValues, faramErrors) => {
        const {
            lead,
            onChange,
        } = this.props;

        const key = leadKeySelector(lead);

        // Clear lead-group if project has changed
        const oldFaramValues = leadFaramValuesSelector(lead);
        if (
            !faramValues.project
            || (oldFaramValues.project && oldFaramValues.project !== faramValues.project)
        ) {
            onChange({
                leadKey: key,
                faramValues: { ...faramValues, leadGroup: undefined },
                faramErrors,
            });
        } else {
            onChange({
                leadKey: key,
                faramValues,
                faramErrors,
            });
        }
    }

    // private
    handleLeadValueChange = (newValues) => {
        const {
            lead,
            onChange,
        } = this.props;
        const values = leadFaramValuesSelector(lead);

        if (newValues !== values) {
            const key = leadKeySelector(lead);
            const errors = leadFaramErrorsSelector(lead);

            const newErrors = accumulateDifferentialErrors(
                values,
                newValues,
                errors,
                schema,
            );

            onChange({
                leadKey: key,
                faramValues: newValues,
                faramErrors: newErrors,
            });
        }
    }

    handleExtraInfoFill = (leadOptions) => {
        const {
            lead,
            activeUserId,
        } = this.props;

        const { organizations } = leadOptions;

        if (organizations.length > 0) {
            this.setState(state => ({
                organizations: mergeLists(state.organizations, organizations),
            }));
        }

        const values = leadFaramValuesSelector(lead);
        const newValues = fillExtraInfo(values, leadOptions, activeUserId);
        this.handleLeadValueChange(newValues);
    }

    handleWebInfoFill = (webInfo) => {
        const {
            lead,
        } = this.props;

        const newOrgs = [];
        if (webInfo.source) {
            newOrgs.push(webInfo.source);
        }
        if (webInfo.author) {
            newOrgs.push(webInfo.author);
        }
        if (newOrgs.length > 0) {
            this.setState(state => ({
                organizations: mergeLists(state.organizations, newOrgs),
            }));
        }

        const values = leadFaramValuesSelector(lead);
        const newValues = fillWebInfo(values, webInfo);
        this.handleLeadValueChange(newValues);
    }

    handlePublisherAdd = (organization) => {
        const {
            lead,
        } = this.props;

        this.setState(state => ({
            organizations: mergeLists(state.organizations, [organization]),
        }));

        const values = leadFaramValuesSelector(lead);
        const newValues = {
            ...values,
            source: organization.id,
        };
        this.handleLeadValueChange(newValues);
    }

    handleAuthorAdd = (organization) => {
        this.setState(state => ({
            organizations: mergeLists(state.organizations, [organization]),
        }));

        const { lead } = this.props;
        const values = leadFaramValuesSelector(lead);
        const newValues = {
            ...values,
            author: organization.id,
        };
        this.handleLeadValueChange(newValues);
    }

    handleSameAsPublisherButtonClick = () => {
        const {
            lead,
        } = this.props;

        const values = leadFaramValuesSelector(lead);

        const newValues = produce(values, (safeValues) => {
            const {
                source,
                author,
            } = values;
            if (source !== author) {
                // eslint-disable-next-line no-param-reassign
                safeValues.author = source;
            }
        });

        this.handleLeadValueChange(newValues);
    }

    handleLeadGroupAdd = (leadGroup) => {
        const {
            lead,
        } = this.props;

        const values = leadFaramValuesSelector(lead);
        const newValues = produce(values, (safeValues) => {
            // eslint-disable-next-line no-param-reassign
            safeValues.leadGroup = leadGroup.id;
        });

        this.handleLeadValueChange(newValues);
    }

    handleOrganizationSearchValueChange = (searchText) => {
        const {
            organizationsRequest,
        } = this.props;

        if (isFalsyString(searchText)) {
            organizationsRequest.abort();
            this.setSearchedOrganizations([]);
        } else {
            organizationsRequest.do({
                searchText,
                setSearchedOrganizations: this.setSearchedOrganizations,
            });
        }
    }

    render() {
        const {
            className: classNameFromProps,
            lead,
            leadState,

            projects,

            bulkActionDisabled,

            webInfoRequest: {
                pending: webInfoRequestPending,
                response: {
                    sourceRaw: suggestedSourceTitle,
                    source,
                    authorRaw: suggestedAuthorTitle,
                    author,
                } = {},
            } = {},
            leadOptionsRequest: {
                pending: leadOptionsPending,
                response: leadOptions = {},
            } = {},
            organizationsRequest: {
                pending: pendingSearchedOrganizations,
            } = {},

        } = this.props;
        const {
            showAddLeadGroupModal,
            searchedOrganizations,
            organizations,
        } = this.state;

        const values = leadFaramValuesSelector(lead);
        const serverId = leadIdSelector(lead);
        const type = leadSourceTypeSelector(lead);
        const errors = leadFaramErrorsSelector(lead);

        const {
            project: projectId,
            url,

            sourceRaw: oldSourceTitle,
            authorRaw: oldAuthorTitle,
        } = values;

        const pending = (
            isLeadFormLoading(leadState)
            || leadOptionsPending
        );
        const formDisabled = (
            isLeadFormDisabled(leadState)
            || pending
            || webInfoRequestPending
        );
        const extractionDisabled = (
            isLeadFormDisabled(leadState)
            || !isUrlValid(url)
            || webInfoRequestPending
        );
        const projectIsSelected = isTruthy(projectId);

        const isApplyAllDisabled = formDisabled || bulkActionDisabled;

        let sourceHint;
        if (oldSourceTitle) {
            sourceHint = `Previously: ${oldSourceTitle}`;
        } else if (!source) {
            sourceHint = `Suggestion: ${suggestedSourceTitle}`;
        }

        let authorHint;
        if (oldAuthorTitle) {
            authorHint = `Previously: ${oldAuthorTitle}`;
        } else if (!author) {
            authorHint = `Suggestion: ${suggestedAuthorTitle}`;
        }

        return (
            <Faram
                // TODO: STYLING the faram doesn't take full height and loading-animation is offset
                className={_cs(classNameFromProps, styles.addLeadForm)}
                onChange={this.handleFaramChange}
                schema={schema}
                value={values}
                error={errors}
                disabled={formDisabled}
            >
                { pending && <LoadingAnimation /> }
                <header className={styles.header}>
                    <NonFieldErrors faramElement />
                </header>
                { type === LEAD_TYPE.website && (
                    <React.Fragment>
                        <ExtractThis
                            key="url"
                            className={styles.url}
                            disabled={formDisabled || extractionDisabled}
                            onClick={this.handleExtractClick}
                        >
                            <TextInput
                                faramElementName="url"
                                label={_ts('addLeads', 'urlLabel')}
                                placeholder={_ts('addLeads', 'urlPlaceholderLabel')}
                                autoFocus
                            />
                        </ExtractThis>
                        <TextInput
                            faramElementName="website"
                            key="website"
                            label={_ts('addLeads', 'websiteLabel')}
                            placeholder={_ts('addLeads', 'urlPlaceholderLabel')}
                            className={styles.website}
                        />
                    </React.Fragment>
                ) }
                { type === LEAD_TYPE.text && (
                    <TextArea
                        faramElementName="text"
                        label={_ts('addLeads', 'textLabel')}
                        placeholder={_ts('addLeads', 'textareaPlaceholderLabel')}
                        rows="3"
                        className={styles.text}
                        autoFocus
                    />
                ) }
                <SelectInput
                    faramElementName="project"
                    keySelector={idSelector}
                    label={_ts('addLeads', 'projectLabel')}
                    labelSelector={titleSelector}
                    options={projects}
                    placeholder={_ts('addLeads', 'projectPlaceholderLabel')}
                    className={styles.project}
                    disabled={formDisabled || !!serverId}
                />

                <Cloak
                    // TODO: STYLING when cloaked
                    hide={this.shouldHideLeadGroupInput}
                    render={
                        <div className={styles.leadGroupContainer}>
                            <ApplyAll
                                className={styles.leadGroup}
                                disabled={isApplyAllDisabled}
                                identifierName="leadGroup"
                                onApplyAllClick={this.handleApplyAllClick}
                                onApplyAllBelowClick={this.handleApplyAllBelowClick}
                            >
                                <SelectInput
                                    faramElementName="leadGroup"
                                    keySelector={keySelector}
                                    label={_ts('addLeads', 'leadGroupLabel')}
                                    labelSelector={labelSelector}
                                    options={leadOptions.leadGroup}
                                    placeholder={_ts('addLeads', 'selectInputPlaceholderLabel')}
                                />
                            </ApplyAll>
                            <Button
                                onClick={this.handleAddLeadGroupClick}
                                iconName="add"
                                transparent
                                disabled={!projectIsSelected}
                            />
                        </div>
                    }
                />
                { showAddLeadGroupModal && (
                    <AddLeadGroup
                        onModalClose={this.handleAddLeadGroupModalClose}
                        onLeadGroupAdd={this.handleLeadGroupAdd}
                        projectId={projectId}
                    />
                ) }
                <TextInput
                    className={styles.title}
                    faramElementName="title"
                    label={_ts('addLeads', 'titleLabel')}
                    placeholder={_ts('addLeads', 'titlePlaceHolderLabel')}
                />

                <ApplyAll
                    className={styles.source}
                    disabled={isApplyAllDisabled}
                    identifierName="source"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                    extraButtons={
                        <ModalButton
                            className={styles.smallButton}
                            title="Add Publisher"
                            iconName="addPerson"
                            transparent
                            modal={
                                <AddOrganizationModal
                                    loadOrganizationList
                                    onOrganizationAdd={this.handlePublisherAdd}
                                />
                            }
                        />
                    }
                >
                    <FaramBasicSelectInput
                        faramElementName="source"
                        label={_ts('addLeads', 'publisherLabel')}
                        options={organizations}
                        keySelector={idSelector}
                        labelSelector={titleSelector}
                        disabled={leadOptionsPending || formDisabled || !projectIsSelected}
                        hint={sourceHint}

                        searchOptions={searchedOrganizations}
                        searchOptionsPending={pendingSearchedOrganizations}
                        onOptionsChange={this.setOrganizations}
                        onSearchValueChange={this.handleOrganizationSearchValueChange}
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.source}
                    disabled={isApplyAllDisabled}
                    identifierName="author"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                    extraButtons={
                        <React.Fragment>
                            <Button
                                className={styles.smallButton}
                                iconName="copyOutline"
                                transparent
                                title={_ts('addLeads', 'sameAsPublisherButtonTitle')}
                                onClick={this.handleSameAsPublisherButtonClick}
                            />
                            <ModalButton
                                className={styles.smallButton}
                                title="Add Author"
                                iconName="addPerson"
                                transparent
                                modal={
                                    <AddOrganizationModal
                                        loadOrganizationList
                                        onOrganizationAdd={this.handleAuthorAdd}
                                    />
                                }
                            />
                        </React.Fragment>
                    }
                >
                    <FaramBasicSelectInput
                        faramElementName="author"
                        label={_ts('addLeads', 'authorLabel')}

                        options={organizations}
                        keySelector={idSelector}
                        labelSelector={titleSelector}
                        disabled={leadOptionsPending || formDisabled || !projectIsSelected}
                        hint={authorHint}

                        searchOptions={searchedOrganizations}
                        searchOptionsPending={pendingSearchedOrganizations}
                        onOptionsChange={this.setOrganizations}
                        onSearchValueChange={this.handleOrganizationSearchValueChange}
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.confidentiality}
                    disabled={isApplyAllDisabled}
                    identifierName="confidentiality"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <SelectInput
                        faramElementName="confidentiality"
                        keySelector={keySelector}
                        label={_ts('addLeads', 'confidentialityLabel')}
                        labelSelector={labelSelector}
                        options={leadOptions.confidentiality}
                        placeholder={_ts('addLeads', 'selectInputPlaceholderLabel')}
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.user}
                    disabled={isApplyAllDisabled}
                    identifierName="assignee"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <SelectInput
                        faramElementName="assignee"
                        keySelector={idSelector}
                        label={_ts('addLeads', 'assigneeLabel')}
                        labelSelector={displayNameSelector}
                        options={leadOptions.members}
                        placeholder={_ts('addLeads', 'selectInputPlaceholderLabel')}
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.date}
                    disabled={isApplyAllDisabled}
                    identifierName="publishedOn"
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
                    ATTACHMENT_TYPES.indexOf(type) !== -1 && (
                        <div className={styles.fileTitle}>
                            { values.attachment &&
                                <InternalGallery
                                    onlyFileName
                                    galleryId={values.attachment.id}
                                />
                            }
                        </div>
                    )
                }
            </Faram>
        );
    }
}

export default RequestCoordinator(
    RequestClient(requests)(
        LeadForm,
    ),
);
