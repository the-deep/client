import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    isDefined,
    isFalsyString,
    isTruthy,
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
import AccentButton from '#rsca/Button/AccentButton';
import DangerButton from '#rsca/Button/DangerButton';
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
    methods,
} from '#request';

import Cloak from '#components/general/Cloak';
import ExtraFunctionsOnHover from '#components/general/ExtraFunctionOnHover';
import AddOrganizationModal from '#components/other/AddOrganizationModal';
import InternalGallery from '#components/viewer/InternalGallery';
import { organizationTitleSelector } from '#entities/organization';
import Message from '#rscv/Message';

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
import EmmStats from './EmmStats';

import schema from './faramSchema';
import styles from './styles.scss';

const PublisherEmptyComponent = () => (
    <Message>
        {_ts('addLeads', 'searchInputEmptyText', { title: 'publisher' })}
    </Message>
);

const AuthorEmptyComponent = () => (
    <Message>
        {_ts('addLeads', 'searchInputEmptyText', { title: 'author' })}
    </Message>
);

const FaramBasicSelectInput = FaramInputElement(BasicSelectInput);
const ModalButton = Modalize(Button);

const propTypes = {
    className: PropTypes.string,
    // activeUserId: PropTypes.number.isRequired,
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
    requests: PropTypes.object.isRequired,
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

/*
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
*/

function fillWebInfo(values, webInfo) {
    const newValues = produce(values, (safeValues) => {
        if ((!safeValues.project || safeValues.project.length <= 0) && webInfo.project) {
            // eslint-disable-next-line no-param-reassign
            safeValues.project = [webInfo.project];
        }
        if (webInfo.date) {
            // eslint-disable-next-line no-param-reassign
            safeValues.publishedOn = webInfo.date;
        }
        if (webInfo.website) {
            // eslint-disable-next-line no-param-reassign
            safeValues.website = webInfo.website;
        }
        if (webInfo.title) {
            // eslint-disable-next-line no-param-reassign
            safeValues.title = webInfo.title;
        }
        if (webInfo.url) {
            // eslint-disable-next-line no-param-reassign
            safeValues.url = webInfo.url;
        }
        if (webInfo.source) {
            // eslint-disable-next-line no-param-reassign
            safeValues.source = webInfo.source.id;
        }
        if (webInfo.author) {
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

const requestOptions = {
    webInfoRequest: {
        url: '/v2/web-info-extract/',
        body: ({ params: { url } }) => ({ url }),
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            params.handleWebInfoFill(response);
        },
        // extras: {
        //     schemaName: 'webInfo',
        // },
    },

    leadOptionsRequest: {
        url: '/lead-options/',
        method: methods.POST,

        options: {
            delay: 1000,
        },

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
        // extras: {
        //     schemaName: 'leadOptions',
        // },
    },

    organizationsRequest: {
        url: '/organizations/',
        query: ({ params }) => ({
            search: params.searchText,
            // limit: 30,
        }),
        method: methods.GET,
        onSuccess: ({ params, response }) => {
            params.setSearchedOrganizations(response.results);
        },
        options: {
            delay: 300,
        },
    },
};

class LeadDetail extends React.PureComponent {
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
            requests: {
                leadOptionsRequest,
            },
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

        const {
            requests: {
                webInfoRequest,
            },
        } = this.props;
        webInfoRequest.do({
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
        const { organizations } = leadOptions;

        if (organizations.length > 0) {
            this.setState(state => ({
                organizations: mergeLists(state.organizations, organizations),
            }));
        }

        /*
        const {
            lead,
            activeUserId,
        } = this.props;

        const values = leadFaramValuesSelector(lead);
        const newValues = fillExtraInfo(values, leadOptions, activeUserId);
        this.handleLeadValueChange(newValues);
        */
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

    handleAutoFormatTitleButton = () => {
        const { lead } = this.props;

        const values = leadFaramValuesSelector(lead);
        const newValues = produce(values, (safeValues) => {
            const {
                title,
            } = values;
            if (!isFalsyString(title)) {
                // eslint-disable-next-line no-param-reassign
                safeValues.title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
            }
        });

        this.handleLeadValueChange(newValues);
    }

    handleRemoveExtensionFromTitle = () => {
        const { lead } = this.props;

        const values = leadFaramValuesSelector(lead);
        const newValues = produce(values, (safeValues) => {
            const {
                title,
            } = values;
            if (!isFalsyString(title)) {
                // eslint-disable-next-line no-param-reassign
                safeValues.title = title.replace(/\.[^/.]+$/, '');
            }
        });

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
            requests: {
                organizationsRequest,
            },
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

            requests: {
                webInfoRequest: {
                    pending: webInfoRequestPending,
                    response: {
                        sourceRaw,
                        source,
                        authorRaw,
                        author,
                    } = {},
                },
                leadOptionsRequest: {
                    pending: leadOptionsPending,
                    response: leadOptions = {},
                },
                organizationsRequest: {
                    pending: pendingSearchedOrganizations,
                },
            },
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

            // NOTE: these values are set by connectors
            sourceSuggestion,
            authorSuggestion,

            emmEntities,
            emmTriggers,
        } = values;

        const suggestedSourceTitle = sourceSuggestion || sourceRaw;
        const suggestedAuthorTitle = authorSuggestion || authorRaw;

        const pending = (
            isLeadFormLoading(leadState)
            || leadOptionsPending
            || webInfoRequestPending
        );
        const formDisabled = (
            isLeadFormDisabled(leadState)
            || pending
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
            sourceHint = _ts('addLeads', 'previousOrganization', { organization: oldSourceTitle });
        } else if (!source && suggestedSourceTitle) {
            sourceHint = _ts('addLeads', 'suggestedOrganization', { organization: suggestedSourceTitle });
        }

        let authorHint;
        if (oldAuthorTitle) {
            authorHint = _ts('addLeads', 'previousOrganization', { organization: oldAuthorTitle });
        } else if (!author && suggestedAuthorTitle) {
            authorHint = _ts('addLeads', 'suggestedOrganization', { organization: suggestedAuthorTitle });
        }

        return (
            <div
                // TODO: STYLING the faram doesn't take full height and loading-animation is offset
                className={_cs(classNameFromProps, styles.leadItem)}
            >
                { pending && <LoadingAnimation /> }
                <Faram
                    className={styles.addLeadForm}
                    onChange={this.handleFaramChange}
                    schema={schema}
                    value={values}
                    error={errors}
                    disabled={formDisabled}
                >
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
                            <ApplyAll
                                className={styles.leadGroup}
                                disabled={isApplyAllDisabled}
                                identifierName="leadGroup"
                                onApplyAllClick={this.handleApplyAllClick}
                                onApplyAllBelowClick={this.handleApplyAllBelowClick}
                                extraButtons={
                                    <Button
                                        className={styles.smallButton}
                                        onClick={this.handleAddLeadGroupClick}
                                        iconName="add"
                                        transparent
                                        disabled={!projectIsSelected}
                                    />
                                }
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
                        }
                        renderOnHide={
                            <div className={styles.leadGroup} />
                        }
                    />
                    { showAddLeadGroupModal && (
                        <AddLeadGroup
                            onModalClose={this.handleAddLeadGroupModalClose}
                            onLeadGroupAdd={this.handleLeadGroupAdd}
                            projectId={projectId}
                        />
                    ) }
                    <ExtraFunctionsOnHover
                        className={styles.title}
                        buttons={
                            <React.Fragment>
                                <AccentButton
                                    className={styles.smallButton}
                                    title={_ts('addLeads', 'formatButtonTitle')}
                                    onClick={this.handleAutoFormatTitleButton}
                                >
                                    {_ts('addLeads', 'autoFormatTitleLabel')}
                                </AccentButton>
                                <DangerButton
                                    className={styles.smallButton}
                                    iconName="delete"
                                    title={_ts('addLeads', 'removeExtensionTitle')}
                                    onClick={this.handleRemoveExtensionFromTitle}
                                >
                                    {_ts('addLeads', 'removeExtensionLabel')}
                                </DangerButton>
                            </React.Fragment>
                        }
                    >
                        <TextInput
                            className={styles.title}
                            faramElementName="title"
                            label={_ts('addLeads', 'titleLabel')}
                            placeholder={_ts('addLeads', 'titlePlaceHolderLabel')}
                        />
                    </ExtraFunctionsOnHover>

                    <ApplyAll
                        className={styles.source}
                        disabled={isApplyAllDisabled}
                        identifierName="source"
                        onApplyAllClick={this.handleApplyAllClick}
                        onApplyAllBelowClick={this.handleApplyAllBelowClick}
                    >
                        <FaramBasicSelectInput
                            faramElementName="source"
                            label={_ts('addLeads', 'publisherLabel')}
                            options={organizations}
                            keySelector={idSelector}
                            className={styles.input}
                            labelSelector={organizationTitleSelector}
                            emptyWhenFilterComponent={PublisherEmptyComponent}
                            disabled={leadOptionsPending || formDisabled || !projectIsSelected}
                            hint={sourceHint}

                            searchOptions={searchedOrganizations}
                            searchOptionsPending={pendingSearchedOrganizations}
                            onOptionsChange={this.setOrganizations}
                            onSearchValueChange={this.handleOrganizationSearchValueChange}
                        />
                        <ModalButton
                            title={_ts('addLeads', 'addPublisherTitle')}
                            iconName="addPerson"
                            transparent
                            modal={
                                <AddOrganizationModal
                                    title={_ts('addLeads', 'addPublisherModalTitle')}
                                    loadOrganizationList
                                    onOrganizationAdd={this.handlePublisherAdd}
                                />
                            }
                        />
                    </ApplyAll>

                    <ApplyAll
                        className={styles.author}
                        disabled={isApplyAllDisabled}
                        identifierName="author"
                        onApplyAllClick={this.handleApplyAllClick}
                        onApplyAllBelowClick={this.handleApplyAllBelowClick}
                        extraButtons={
                            <Button
                                className={styles.smallButton}
                                iconName="copyOutline"
                                transparent
                                title={_ts('addLeads', 'sameAsPublisherButtonTitle')}
                                onClick={this.handleSameAsPublisherButtonClick}
                            />
                        }
                    >
                        <FaramBasicSelectInput
                            faramElementName="author"
                            label={_ts('addLeads', 'authorLabel')}

                            className={styles.input}
                            options={organizations}
                            keySelector={idSelector}
                            labelSelector={organizationTitleSelector}
                            emptyWhenFilterComponent={AuthorEmptyComponent}
                            disabled={leadOptionsPending || formDisabled || !projectIsSelected}
                            hint={authorHint}

                            searchOptions={searchedOrganizations}
                            searchOptionsPending={pendingSearchedOrganizations}
                            onOptionsChange={this.setOrganizations}
                            onSearchValueChange={this.handleOrganizationSearchValueChange}
                        />
                        <ModalButton
                            title={_ts('addLeads', 'addAuthorTitle')}
                            iconName="addPerson"
                            transparent
                            modal={
                                <AddOrganizationModal
                                    title={_ts('addLeads', 'addAuthorModalTitle')}
                                    loadOrganizationList
                                    onOrganizationAdd={this.handleAuthorAdd}
                                />
                            }
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
                <EmmStats
                    className={styles.emmStatsContainer}
                    emmTriggers={emmTriggers}
                    emmEntities={emmEntities}
                />
            </div>
        );
    }
}

export default RequestCoordinator(
    RequestClient(requestOptions)(
        LeadDetail,
    ),
);
