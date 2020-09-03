// NOTE: This component has also been used in Leads Table to quick edit leads

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import {
    _cs,
    isDefined,
    isFalsyString,
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
import Message from '#rscv/Message';

import Cloak from '#components/general/Cloak';
import ExtraFunctionsOnHover from '#components/general/ExtraFunctionOnHover';
import BadgeInput from '#components/input/BadgeInput';
import AddOrganizationModal from '#components/other/AddOrganizationModal';
import InternalGallery from '#components/viewer/InternalGallery';
import { organizationTitleSelector } from '#entities/organization';

import {
    RequestClient,
    methods,
} from '#request';
import {
    currentUserActiveProjectSelector,
    leadAddChangeLeadAction,
    leadAddApplyLeadsAllBelowAction,
    leadAddApplyLeadsAllAction,
    leadAddPageActiveLeadSelector,
} from '#redux';

import _ts from '#ts';
import {
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
    leadKeySelector,
    leadSourceTypeSelector,
} from '../utils';

import AddLeadGroup from './AddLeadGroup';
import ApplyAll from './ApplyAll';
import EmmStats from './EmmStats';

import schema from './faramSchema';
import styles from './styles.scss';

const FaramBasicSelectInput = FaramInputElement(BasicSelectInput);
const FaramBasicMultiSelectInput = FaramInputElement(BasicMultiSelectInput);
const ModalButton = Modalize(Button);

function PublisherEmptyComponent() {
    return (
        <Message>
            {_ts('addLeads', 'searchInputEmptyText', { title: 'publisher' })}
        </Message>
    );
}

function AuthorEmptyComponent() {
    return (
        <Message>
            {_ts('addLeads', 'searchInputEmptyText', { title: 'author' })}
        </Message>
    );
}

const idSelector = item => item.id;
const keySelector = item => item.key;
const labelSelector = item => item.value;
const titleSelector = item => item.title;
const displayNameSelector = item => item.displayName;

const requestOptions = {
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

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    activeProject: PropTypes.object.isRequired,

    bulkActionDisabled: PropTypes.bool,
    disableLeadUrlChange: PropTypes.bool,

    onChange: PropTypes.func.isRequired,
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,

    onOrganizationsAdd: PropTypes.func.isRequired,
    onLeadGroupsAdd: PropTypes.func.isRequired,

    pending: PropTypes.boolean, // pending lead options

    // eslint-disable-next-line react/forbid-prop-types
    priorityOptions: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    confidentialityOptions: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    assignees: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    leadGroups: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    organizations: PropTypes.array,

    leadState: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    className: undefined,
    bulkActionDisabled: false,
    // TODO: this should always be true
    disableLeadUrlChange: false,

    pending: false,
    priorityOptions: [],
    confidentialityOptions: [],
    assignees: [],
    leadGroups: [],
    organizations: [],
};

// FIXME: change to functional component
class LeadDetail extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { lead } = this.props;
        const currentFaramValues = leadFaramValuesSelector(lead);
        const suggestedTitleFromUrl = getTitleFromUrl(currentFaramValues.url);

        this.state = {
            showAddLeadGroupModal: false,

            // NOTE: If false, it will capitalize the first letter of first word only
            formatTitleAsTitleCase: true,

            suggestedTitleFromUrl,
            // FIXME: this was previously filled by web-info-extract
            suggestedTitleFromExtraction: undefined,

            searchedOrganizations: [],
        };
    }

    getPriorityOptions = memoize((priorityOptions = []) => (
        [...priorityOptions].sort((a, b) => compareNumber(a.key, b.key))
    ));

    setSearchedOrganizations = (searchedOrganizations) => {
        this.setState({ searchedOrganizations });
    }

    shouldHideLeadGroupInput = () => {
        const { activeProject } = this.props;
        return !activeProject || !activeProject.assessmentTemplate;
    };

    handleAddLeadGroupClick = () => {
        this.setState({ showAddLeadGroupModal: true });
    }

    handleAddLeadGroupModalClose = () => {
        this.setState({ showAddLeadGroupModal: false });
    }

    handleApplyAllClick = (attrName) => {
        const {
            onApplyAllClick,
            lead,
        } = this.props;

        const key = leadKeySelector(lead);
        const values = leadFaramValuesSelector(lead);
        const attrValue = values[attrName];
        onApplyAllClick({ leadKey: key, values, attrName, attrValue });
    }

    handleApplyAllBelowClick = (attrName) => {
        const {
            onApplyAllBelowClick,
            lead,
        } = this.props;

        const key = leadKeySelector(lead);
        const values = leadFaramValuesSelector(lead);
        const attrValue = values[attrName];
        onApplyAllBelowClick({ leadKey: key, values, attrName, attrValue });
    }

    handleFaramChange = (faramValues, faramErrors) => {
        const {
            lead,
            onChange,
        } = this.props;

        const key = leadKeySelector(lead);

        const oldFaramValues = leadFaramValuesSelector(lead);
        if (oldFaramValues.url !== faramValues.url) {
            this.setState({ suggestedTitleFromUrl: getTitleFromUrl(faramValues.url) });
        }

        onChange({
            leadKey: key,
            faramValues,
            faramErrors,
        });
    }

    // private
    handleLeadValueChange = (newValues) => {
        const {
            lead,
            onChange,
        } = this.props;

        const values = leadFaramValuesSelector(lead);

        if (newValues === values) {
            return;
        }

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

    handlePublisherAdd = (organization) => {
        const { lead, onOrganizationsAdd } = this.props;
        onOrganizationsAdd([organization]);

        const values = leadFaramValuesSelector(lead);
        const newValues = {
            ...values,
            source: organization.id,
        };
        this.handleLeadValueChange(newValues);
    }

    handleAuthorAdd = (organization) => {
        const { lead, onOrganizationsAdd } = this.props;
        onOrganizationsAdd([organization]);

        const values = leadFaramValuesSelector(lead);
        const newValues = {
            ...values,
            authors: values.authors
                ? [...values.authors, organization.id]
                : [organization.id],
        };
        this.handleLeadValueChange(newValues);
    }

    handleLeadGroupAdd = (leadGroup) => {
        const { lead, onLeadGroupsAdd } = this.props;
        onLeadGroupsAdd([leadGroup]);

        const values = leadFaramValuesSelector(lead);
        const newValues = produce(values, (safeValues) => {
            // eslint-disable-next-line no-param-reassign
            safeValues.leadGroup = leadGroup.id;
        });

        this.handleLeadValueChange(newValues);
    }

    handleSameAsPublisherButtonClick = () => {
        const { lead } = this.props;

        const values = leadFaramValuesSelector(lead);

        const newValues = produce(values, (safeValues) => {
            const { source } = values;
            // eslint-disable-next-line no-param-reassign
            safeValues.authors = source ? [source] : undefined;
        });

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

            bulkActionDisabled,

            requests: {
                organizationsRequest: {
                    pending: pendingSearchedOrganizations,
                },
            },

            pending: pendingFromProps, // pending lead options

            priorityOptions,
            confidentialityOptions,
            assignees,
            leadGroups,

            organizations,
            onOrganizationsAdd,

            disableLeadUrlChange,
        } = this.props;
        const {
            showAddLeadGroupModal,
            searchedOrganizations,
            suggestedTitleFromUrl,
            suggestedTitleFromExtraction,
        } = this.state;

        const values = leadFaramValuesSelector(lead);
        const type = leadSourceTypeSelector(lead);
        const errors = leadFaramErrorsSelector(lead);

        const {
            project: projectId,
            title,

            sourceRaw: oldSourceTitle,
            authorRaw: oldAuthorTitle,

            // NOTE: previously: these values are set by connectors
            // NOTE: now: these values should be set by candidate leads
            sourceSuggestion: suggestedSourceTitle,
            authorSuggestion: suggestedAuthorTitle,

            emmEntities,
            emmTriggers,
        } = values;

        const pending = (
            isLeadFormLoading(leadState)
            || pendingFromProps
        );
        const formDisabled = (
            isLeadFormDisabled(leadState)
            || pending
        );
        const projectIsSelected = isTruthy(projectId);

        const isApplyAllDisabled = formDisabled || bulkActionDisabled;

        let sourceHint;
        if (oldSourceTitle) {
            sourceHint = _ts('addLeads', 'previousOrganization', { organization: oldSourceTitle });
        } else if (suggestedSourceTitle) {
            sourceHint = _ts('addLeads', 'suggestedOrganization', { organization: suggestedSourceTitle });
        }

        let authorHint;
        if (oldAuthorTitle) {
            authorHint = _ts('addLeads', 'previousOrganization', { organization: oldAuthorTitle });
        } else if (suggestedAuthorTitle) {
            authorHint = _ts('addLeads', 'suggestedOrganization', { organization: suggestedAuthorTitle });
        }

        const suggestions = unique([suggestedTitleFromUrl, suggestedTitleFromExtraction])
            .filter(isDefined)
            .filter(suggestion => suggestion !== title);

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
                    {type === LEAD_TYPE.website && (
                        <>
                            <TextInput
                                className={styles.url}
                                faramElementName="url"
                                label={_ts('addLeads', 'urlLabel')}
                                placeholder={_ts('addLeads', 'urlPlaceholderLabel')}
                                autoFocus
                                disabled={disableLeadUrlChange}
                            />
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
                        </>
                    )}
                    {type === LEAD_TYPE.text && (
                        <TextArea
                            faramElementName="text"
                            label={_ts('addLeads', 'textLabel')}
                            placeholder={_ts('addLeads', 'textareaPlaceholderLabel')}
                            rows="3"
                            className={styles.text}
                            autoFocus
                            disabled={disableLeadUrlChange}
                        />
                    )}
                    <ExtraFunctionsOnHover
                        className={styles.title}
                        buttons={(
                            <>
                                <AccentButton
                                    className={styles.smallButton}
                                    title={_ts('addLeads', 'formatButtonTitle')}
                                    onClick={this.handleAutoFormatTitleButton}
                                >
                                    {/* Treat this as icon */}
                                    Aa
                                </AccentButton>
                            </>
                        )}
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
                            disabled={pendingFromProps || formDisabled || !projectIsSelected}
                            hint={sourceHint}

                            searchOptions={searchedOrganizations}
                            searchOptionsPending={pendingSearchedOrganizations}
                            onOptionsChange={onOrganizationsAdd}
                            onSearchValueChange={this.handleOrganizationSearchValueChange}
                        />
                        <ModalButton
                            title={_ts('addLeads', 'addPublisherTitle')}
                            iconName="addPerson"
                            transparent
                            modal={(
                                <AddOrganizationModal
                                    title={_ts('addLeads', 'addPublisherModalTitle')}
                                    loadOrganizationList
                                    onOrganizationAdd={this.handlePublisherAdd}
                                />
                            )}
                        />
                    </ApplyAll>

                    <ApplyAll
                        className={styles.author}
                        disabled={isApplyAllDisabled}
                        identifierName="authors"
                        onApplyAllClick={this.handleApplyAllClick}
                        onApplyAllBelowClick={this.handleApplyAllBelowClick}
                        extraButtons={(
                            <Button
                                className={styles.smallButton}
                                iconName="copyOutline"
                                transparent
                                title={_ts('addLeads', 'sameAsPublisherButtonTitle')}
                                onClick={this.handleSameAsPublisherButtonClick}
                            />
                        )}
                    >
                        <FaramBasicMultiSelectInput
                            faramElementName="authors"
                            label={_ts('addLeads', 'authorLabel')}

                            className={styles.input}
                            options={organizations}
                            keySelector={idSelector}
                            labelSelector={organizationTitleSelector}
                            emptyWhenFilterComponent={AuthorEmptyComponent}
                            disabled={pendingFromProps || formDisabled || !projectIsSelected}
                            hint={authorHint}

                            searchOptions={searchedOrganizations}
                            searchOptionsPending={pendingSearchedOrganizations}
                            onOptionsChange={onOrganizationsAdd}
                            onSearchValueChange={this.handleOrganizationSearchValueChange}
                            placeholder={_ts('addLeads', 'authorPlaceholder')}
                        />
                        <ModalButton
                            title={_ts('addLeads', 'addAuthorTitle')}
                            iconName="addPerson"
                            transparent
                            modal={(
                                <AddOrganizationModal
                                    title={_ts('addLeads', 'addAuthorModalTitle')}
                                    loadOrganizationList
                                    onOrganizationAdd={this.handleAuthorAdd}
                                />
                            )}
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
                            options={this.getPriorityOptions(priorityOptions)}
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
                            options={confidentialityOptions}
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
                            options={assignees}
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
                        hide={this.shouldHideLeadGroupInput}
                        render={(
                            <ApplyAll
                                className={styles.leadGroup}
                                disabled={isApplyAllDisabled}
                                identifierName="leadGroup"
                                onApplyAllClick={this.handleApplyAllClick}
                                onApplyAllBelowClick={this.handleApplyAllBelowClick}
                                extraButtons={(
                                    <Button
                                        className={styles.smallButton}
                                        onClick={this.handleAddLeadGroupClick}
                                        iconName="add"
                                        transparent
                                        disabled={!projectIsSelected}
                                    />
                                )}
                            >
                                <SelectInput
                                    faramElementName="leadGroup"
                                    keySelector={idSelector}
                                    label={_ts('addLeads', 'leadGroupLabel')}
                                    labelSelector={titleSelector}
                                    options={leadGroups}
                                    placeholder={_ts('addLeads', 'selectInputPlaceholderLabel')}
                                />
                            </ApplyAll>
                        )}
                        renderOnHide={(
                            <div className={styles.leadGroup} />
                        )}
                    />
                </Faram>
                {showAddLeadGroupModal && (
                    <AddLeadGroup
                        onModalClose={this.handleAddLeadGroupModalClose}
                        onLeadGroupAdd={this.handleLeadGroupAdd}
                        projectId={projectId}
                    />
                )}
                {values.attachment && ATTACHMENT_TYPES.includes(type) && (
                    <div className={styles.fileTitle}>
                        <InternalGallery
                            onlyFileName
                            galleryId={values.attachment.id}
                        />
                    </div>
                )}
                <EmmStats
                    className={styles.emmStatsContainer}
                    emmTriggers={emmTriggers}
                    emmEntities={emmEntities}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    activeProject: currentUserActiveProjectSelector(state),
    lead: leadAddPageActiveLeadSelector(state),
});

const mapDispatchToProps = dispatch => ({
    onChange: params => dispatch(leadAddChangeLeadAction(params)),
    onApplyAllBelowClick: params => dispatch(leadAddApplyLeadsAllBelowAction(params)),
    onApplyAllClick: params => dispatch(leadAddApplyLeadsAllAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestClient(requestOptions)(LeadDetail),
);
