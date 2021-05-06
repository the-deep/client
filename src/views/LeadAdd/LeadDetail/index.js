// NOTE: This component has also been used in Leads Table to quick edit leads

import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import {
    _cs,
    isDefined,
    isFalsyString,
    isNotDefined,
    compareNumber,
    isTruthy,
    unique,
} from '@togglecorp/fujs';
import Faram, {
    FaramInputElement,
    accumulateDifferentialErrors,
} from '@togglecorp/faram';
import titleCase from 'title';
import produce from 'immer';

import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import Modalize from '#rscg/Modalize';
import DateInput from '#rsci/DateInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SelectInput from '#rsci/SelectInput';
import TextArea from '#rsci/TextArea';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import BasicSelectInput from '#rsu/../v2/Input/BasicSelectInput';
import BasicMultiSelectInput from '#rsu/../v2/Input/BasicMultiSelectInput';
import SegmentInput from '#rsci/SegmentInput';

import {
    RequestClient,
    RequestCoordinator,
    methods,
} from '#request';
import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import Cloak from '#components/general/Cloak';
import ExtraFunctionsOnHover from '#components/general/ExtraFunctionOnHover';
import BadgeInput from '#components/input/BadgeInput';
import AddOrganizationModal from '#components/other/AddOrganizationModal';
import InternalGallery from '#components/viewer/InternalGallery';
import { organizationTitleSelector } from '#entities/organization';
import Message from '#rscv/Message';

import _ts from '#ts';
import {
    isUrlValid,
    getTitleFromUrl,
    capitalizeOnlyFirstLetter,
    trimFileExtension,
} from '#utils/common';

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
import ApplyAll from './ApplyAll';
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
const FaramBasicMultiSelectInput = FaramInputElement(BasicMultiSelectInput);
const ModalButton = Modalize(Button);

const propTypes = {
    className: PropTypes.string,
    // activeUserId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    projects: PropTypes.array,

    bulkActionDisabled: PropTypes.bool,
    hideProjects: PropTypes.bool,
    disableLeadUrlChange: PropTypes.bool,

    onChange: PropTypes.func.isRequired,
    onApplyAllClick: PropTypes.func,
    onApplyAllBelowClick: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    attachmentUrlRefreshEnabled: PropTypes.bool,

    // eslint-disable-next-line react/no-unused-prop-types
    onLeadAttachmentChange: PropTypes.func,

    // onLeadSave: PropTypes.func.isRequired,
    // onLeadRemove: PropTypes.func.isRequired,
    // onLeadExport: PropTypes.func.isRequired,

    leadState: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    className: undefined,
    bulkActionDisabled: false,
    hideProjects: false,
    onApplyAllClick: undefined,
    attachmentUrlRefreshEnabled: false,
    onApplyAllBelowClick: undefined,
    onLeadAttachmentChange: undefined,
    disableLeadUrlChange: false,
    leadState: undefined,
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
        if (isNotDefined(safeValues.priority) && isDefined(priority)) {
            const sortedPriority = [...priority].sort((a, b) => compareNumber(a.key, b.key));
            safeValues.priority = isDefined(sortedPriority[0]) ? sortedPriority[0].key : undefined;
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
            // FIXME: we have to look into this
            // eslint-disable-next-line no-param-reassign
            safeValues.authors = [webInfo.author.id];
        }
    });
    return newValues;
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
    fileUrlGetRequest: {
        url: ({ params: { fileId } }) => `/files/${fileId}/`,
        query: ({ params: { url } }) => ({ url }),
        method: methods.GET,
        onMount: ({ props }) => {
            const {
                requests: { fileUrlGetRequest },
                lead,
                attachmentUrlRefreshEnabled,
            } = props;

            const { attachment } = leadFaramValuesSelector(lead);

            if (attachmentUrlRefreshEnabled && isDefined(attachment)) {
                fileUrlGetRequest.do({
                    leadKey: leadKeySelector(lead),
                    fileId: attachment.id,
                });
            }
        },
        onSuccess: ({
            props: {
                requests,
                onLeadAttachmentChange,
                attachmentUrlRefreshEnabled,
            },
            response,
            params: {
                shouldCallWebInfo,
                leadKey,
            },
        }) => {
            if (attachmentUrlRefreshEnabled && onLeadAttachmentChange && leadKey) {
                onLeadAttachmentChange(leadKey, response);
            }

            if (shouldCallWebInfo && requests.webInfoRequest) {
                requests.webInfoRequest.do({
                    url: response.file,
                    isFile: true,
                });
            }
        },
        onFailure: notifyOnFailure(_ts('addLeads', 'extractLead')),
        onFatal: notifyOnFatal(_ts('addLeads', 'extractLead')),
    },
    webInfoRequest: {
        url: '/web-info-extract/',
        query: ({ params: { url } }) => ({ url }),
        method: methods.GET,
        onSuccess: ({ params, props: { requests }, response }) => {
            if (params && params.isFile) {
                if (params.handleWebInfoFill) {
                    params.handleWebInfoFill({ title: params.title });
                }
            } else if (requests.webInfoDataRequest) {
                requests.webInfoDataRequest.do({
                    url: params.url,
                    title: response.title,
                    date: response.date,
                    website: response.website,
                    country: response.country,
                    source: response.sourceRaw,
                    author: response.authorRaw,
                });
            }
        },
        onFailure: notifyOnFailure(_ts('addLeads', 'extractLead')),
        onFatal: notifyOnFatal(_ts('addLeads', 'extractLead')),
        extras: {
            type: 'serverless',
            // schemaName: 'webInfo',
        },
    },

    webInfoDataRequest: {
        url: '/v2/web-info-data/',
        body: ({ params: {
            source,
            author,
            country,
            url,
        } }) => ({
            sourceRaw: source,
            authorRaw: author,
            country,
            url,
        }),
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            params.handleWebInfoFill({
                date: params.date,
                website: params.website,
                title: params.title,
                url: params.url,
                ...response,
            });
        },
        onFailure: ({ params }) => {
            // NOTE: Even on failure fill data from webInfoExtract
            params.handleWebInfoFill({
                date: params.date,
                website: params.website,
                title: params.title,
                url: params.url,
            });
        },
        onFatal: notifyOnFatal(_ts('addLeads', 'extractLead')),
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
                        ...(inputValues.authors || []),
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

        const {
            requests: {
                leadOptionsRequest,
                webInfoDataRequest,
                webInfoRequest,
            },
            lead,
        } = this.props;
        const currentFaramValues = leadFaramValuesSelector(lead);

        this.state = {
            showAddLeadGroupModal: false,
            // NOTE: If false, it will capitalize the first letter of first word only
            formatTitleAsTitleCase: true,
            suggestedTitleFromUrl: getTitleFromUrl(currentFaramValues.url),
            suggestedTitleFromExtraction: undefined,

            searchedOrganizations: [],
            // Organizations filled by web-info-extract and lead-options
            organizations: [],
        };

        leadOptionsRequest.setDefaultParams({ handleExtraInfoFill: this.handleExtraInfoFill });
        webInfoRequest.setDefaultParams({ handleWebInfoFill: this.handleWebInfoFill });
        webInfoDataRequest.setDefaultParams({ handleWebInfoFill: this.handleWebInfoFill });
    }

    getPriorityOptions = memoize((priority = []) => (
        [...priority].sort((a, b) => compareNumber(a.key, b.key))
    ));

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
        const {
            requests: { webInfoRequest },
            lead,
        } = this.props;
        const values = leadFaramValuesSelector(lead);
        const { url } = values;

        webInfoRequest.do({ url });
    }

    handleExtractClickForFiles = () => {
        const {
            requests: { fileUrlGetRequest },
            lead,
        } = this.props;
        const values = leadFaramValuesSelector(lead);
        const { attachment } = values;

        fileUrlGetRequest.do({
            leadKey: leadKeySelector(lead),
            fileId: attachment.id,
            shouldCallWebInfo: true,
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
        if (oldFaramValues.url !== faramValues.url) {
            this.setState({ suggestedTitleFromUrl: getTitleFromUrl(faramValues.url) });
        }

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
        /*
        const {
            lead,
        } = this.props;
        */
        const {
            organizations,
            // priority,
        } = leadOptions;

        if (organizations.length > 0) {
            this.setState(state => ({
                organizations: mergeLists(state.organizations, organizations),
            }));
        }

        /*
        NOTE: Commented out because this needs to handled throughout all leads
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

        this.setState({ suggestedTitleFromExtraction: webInfo.title });

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
            authors: values.authors
                ? [...values.authors, organization.id]
                : [organization.id],
        };
        this.handleLeadValueChange(newValues);
    }

    handleAutoFormatTitleButton = () => {
        const { lead } = this.props;
        const { formatTitleAsTitleCase } = this.state;

        const values = leadFaramValuesSelector(lead);
        const newValues = produce(values, (safeValues) => {
            const { title } = values;

            if (isFalsyString(title)) {
                return;
            }

            // eslint-disable-next-line no-param-reassign
            safeValues.title = formatTitleAsTitleCase
                ? titleCase(title) : capitalizeOnlyFirstLetter(title);
            // eslint-disable-next-line no-param-reassign
            safeValues.title = trimFileExtension(safeValues.title);
        });

        this.setState({ formatTitleAsTitleCase: !formatTitleAsTitleCase });
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
            } = values;
            // eslint-disable-next-line no-param-reassign
            safeValues.authors = source ? [source] : undefined;
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
                webInfoRequest: { pending: webInfoRequestPending },
                webInfoDataRequest: {
                    pending: webInfoDataRequestPending,
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
            hideProjects,
            disableLeadUrlChange,
        } = this.props;
        const {
            showAddLeadGroupModal,
            searchedOrganizations,
            organizations,
            suggestedTitleFromUrl,
            suggestedTitleFromExtraction,
        } = this.state;

        const values = leadFaramValuesSelector(lead);
        const serverId = leadIdSelector(lead);
        const type = leadSourceTypeSelector(lead);
        const errors = leadFaramErrorsSelector(lead);

        const {
            project: projectId,
            url,
            title,

            sourceRaw: oldSourceTitle,
            authorRaw: oldAuthorTitle,

            // NOTE: these values are set by connectors
            sourceSuggestion,
            authorSuggestion,

            emmEntities,
            emmTriggers,

            attachment,
        } = values;

        const suggestedSourceTitle = sourceSuggestion || sourceRaw;
        const suggestedAuthorTitle = authorSuggestion || authorRaw;

        const pending = (
            isLeadFormLoading(leadState)
            || leadOptionsPending
            || webInfoRequestPending
            || webInfoDataRequestPending
        );
        const formDisabled = (
            isLeadFormDisabled(leadState)
            || pending
        );
        const extractionDisabled = (
            isLeadFormDisabled(leadState)
            || !isUrlValid(url)
            || webInfoRequestPending
            || webInfoDataRequestPending
        );
        const extractionForFileDisabled = (
            isLeadFormDisabled(leadState)
            || isNotDefined(attachment && attachment.id)
            || webInfoRequestPending
            || webInfoDataRequestPending
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

        const suggestions = unique([suggestedTitleFromUrl, suggestedTitleFromExtraction])
            .filter(isDefined)
            .filter(suggestion => suggestion !== title);

        const priorityOptions = this.getPriorityOptions(leadOptions.priority);

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
                    <div className={styles.section}>
                        {!hideProjects && (
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
                        )}
                    </div>
                    { type === LEAD_TYPE.website && (
                        <React.Fragment>
                            <ExtraFunctionsOnHover
                                className={styles.url}
                                buttons={(
                                    <AccentButton
                                        transparent
                                        className={styles.extractButton}
                                        title={_ts('addLeads', 'extractLead')}
                                        disabled={
                                            formDisabled
                                            || extractionDisabled
                                            || disableLeadUrlChange
                                        }
                                        onClick={this.handleExtractClick}
                                        tabIndex="-1"
                                        iconName="eye"
                                    />
                                )}
                            >
                                <TextInput
                                    faramElementName="url"
                                    label={_ts('addLeads', 'urlLabel')}
                                    placeholder={_ts('addLeads', 'urlPlaceholderLabel')}
                                    autoFocus
                                    disabled={disableLeadUrlChange}
                                />
                            </ExtraFunctionsOnHover>
                            <ApplyAll
                                className={styles.website}
                                disabled={isApplyAllDisabled}
                                identifierName="website"
                                onApplyAllClick={this.handleApplyAllClick}
                                onApplyAllBelowClick={this.handleApplyAllBelowClick}
                            >
                                <TextInput
                                    faramElementName="website"
                                    key="website"
                                    label={_ts('addLeads', 'websiteLabel')}
                                    placeholder={_ts('addLeads', 'urlPlaceholderLabel')}
                                />
                            </ApplyAll>
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
                            disabled={disableLeadUrlChange}
                        />
                    ) }
                    <ExtraFunctionsOnHover
                        className={styles.title}
                        buttons={
                            <>
                                <AccentButton
                                    className={styles.smallButton}
                                    title={_ts('addLeads', 'formatButtonTitle')}
                                    onClick={this.handleAutoFormatTitleButton}
                                >
                                    {/* Treat this as icon */}
                                    Aa
                                </AccentButton>
                                { (type === LEAD_TYPE.file
                                    || type === LEAD_TYPE.drive
                                    || type === LEAD_TYPE.dropbox) && (
                                    <AccentButton
                                        transparent
                                        className={styles.extractButton}
                                        title={_ts('addLeads', 'extractLeadFromDocument')}
                                        disabled={formDisabled || extractionForFileDisabled}
                                        onClick={this.handleExtractClickForFiles}
                                        tabIndex="-1"
                                        iconName="eye"
                                    />
                                )}
                            </>
                        }
                    >
                        <TextInput
                            faramElementName="title"
                            label={_ts('addLeads', 'titleLabel')}
                            placeholder={_ts('addLeads', 'titlePlaceHolderLabel')}
                        />
                        {suggestions.length > 0 && (
                            <>
                                <h5 className={styles.suggestionLabel}>
                                    {_ts('addLeads', 'suggestionsLabel')}
                                </h5>
                                <div className={styles.suggestions}>
                                    {suggestions.map(suggestion => (
                                        <BadgeInput
                                            key={suggestion}
                                            className={styles.suggestionBadge}
                                            faramElementName="title"
                                            title={suggestion}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
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
                        identifierName="authors"
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
                        <FaramBasicMultiSelectInput
                            faramElementName="authors"
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
                            placeholder={_ts('addLeads', 'authorPlaceholder')}
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
                        className={styles.priority}
                        disabled={isApplyAllDisabled}
                        identifierName="priority"
                        onApplyAllClick={this.handleApplyAllClick}
                        onApplyAllBelowClick={this.handleApplyAllBelowClick}
                    >
                        <SegmentInput
                            faramElementName="priority"
                            name="priority-selector"
                            label={_ts('addLeads', 'priorityLabel')}
                            labelSelector={labelSelector}
                            keySelector={keySelector}
                            options={priorityOptions}
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

                    {
                        ATTACHMENT_TYPES.indexOf(type) !== -1 && (
                            <div className={styles.fileTitle}>
                                { values.attachment &&
                                    <InternalGallery
                                        onlyFileName
                                        attachment={values.attachment}
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
