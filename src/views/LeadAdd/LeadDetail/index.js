// NOTE: This component has also been used in Leads Table to quick edit leads

import PropTypes from 'prop-types';
import React, { useMemo, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsyString,
    isTruthyString,
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

import useRequest from '#restrequest';
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

const emptyList = [];

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

    pending: PropTypes.bool, // pending lead options

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
};

const defaultProps = {
    className: undefined,
    bulkActionDisabled: false,
    // TODO: IMP this should always be true
    disableLeadUrlChange: false,

    pending: false,
    priorityOptions: [],
    confidentialityOptions: [],
    assignees: [],
    leadGroups: [],
    organizations: [],
};

function LeadDetail(props) {
    const {
        activeProject,
        assignees,
        bulkActionDisabled,
        className: classNameFromProps,
        confidentialityOptions,
        disableLeadUrlChange,
        lead,
        leadGroups,
        leadState,
        onApplyAllBelowClick,
        onApplyAllClick,
        onChange,
        onOrganizationsAdd,
        onLeadGroupsAdd,
        organizations,
        pending: pendingFromProps, // pending lead options
        priorityOptions,
    } = props;


    const [searchedText, setSearchedText] = useState(undefined);

    const [pendingSearchedOrganizations, searchedOrganizations] = useRequest({
        url: searchedText ? 'server://organizations/' : undefined,
        query: { search: searchedText },
        delay: 300,
        autoTrigger: true,
    });

    const [addLeadGroupModalShown, setAddLeadGroupModalShown] = useState(false);
    const [formatTitleAsTitleCase, setFormatTitleAsTitleCase] = useState(true);
    const [suggestedTitleFromUrl, setSuggestedTitleFromUrl] = useState(() => {
        const currentFaramValues = leadFaramValuesSelector(lead);
        return getTitleFromUrl(currentFaramValues.url);
    });

    // FIXME: IMP suggestedTitleFromExtraction is now obsolete
    const [suggestedTitleFromExtraction, setSuggestedTitleFromExtraction] = useState('');

    const key = leadKeySelector(lead);
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
        .filter(isTruthyString)
        .filter(suggestion => suggestion !== title);

    const sortedPriorityOptions = useMemo(
        () => (
            [...priorityOptions].sort((a, b) => compareNumber(a.key, b.key))
        ),
        [priorityOptions],
    );

    const shouldHideLeadGroupInput = useCallback(
        () => (
            !activeProject || !activeProject.assessmentTemplate
        ),
        [activeProject],
    );

    const handleAddLeadGroupClick = useCallback(
        () => {
            setAddLeadGroupModalShown(true);
        },
        [],
    );
    const handleAddLeadGroupModalClose = useCallback(
        () => {
            setAddLeadGroupModalShown(false);
        },
        [],
    );

    const handleApplyAllClick = useCallback(
        (attrName) => {
            const attrValue = values[attrName];
            onApplyAllClick({ leadKey: key, values, attrName, attrValue });
        },
        [key, values, onApplyAllClick],
    );

    const handleApplyAllBelowClick = useCallback(
        (attrName) => {
            const attrValue = values[attrName];
            onApplyAllBelowClick({ leadKey: key, values, attrName, attrValue });
        },
        [key, values, onApplyAllBelowClick],
    );

    const handleFaramChange = useCallback(
        (faramValues, faramErrors) => {
            const oldFaramValues = values;
            if (oldFaramValues.url !== faramValues.url) {
                setSuggestedTitleFromUrl(getTitleFromUrl(faramValues.url));
            }

            onChange({
                leadKey: key,
                faramValues,
                faramErrors,
            });
        },
        [key, values, onChange],
    );

    const handleLeadValueChange = useCallback(
        (newValues) => {
            if (newValues === values) {
                return;
            }

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
        },
        [key, values, errors, onChange],
    );

    const handlePublisherAdd = useCallback(
        (organization) => {
            onOrganizationsAdd([organization]);

            const newValues = {
                ...values,
                source: organization.id,
            };
            handleLeadValueChange(newValues);
        },
        [handleLeadValueChange, values, onOrganizationsAdd],
    );

    const handleAuthorAdd = useCallback(
        (organization) => {
            onOrganizationsAdd([organization]);

            const newValues = {
                ...values,
                authors: values.authors
                    ? [...values.authors, organization.id]
                    : [organization.id],
            };
            handleLeadValueChange(newValues);
        },
        [handleLeadValueChange, onOrganizationsAdd, values],
    );

    const handleLeadGroupAdd = useCallback(
        (leadGroup) => {
            onLeadGroupsAdd([leadGroup]);

            const newValues = produce(values, (safeValues) => {
                // eslint-disable-next-line no-param-reassign
                safeValues.leadGroup = leadGroup.id;
            });

            handleLeadValueChange(newValues);
        },
        [handleLeadValueChange, onLeadGroupsAdd, values],
    );

    const handleSameAsPublisherButtonClick = useCallback(
        () => {
            const newValues = produce(values, (safeValues) => {
                const { source } = values;
                // eslint-disable-next-line no-param-reassign
                safeValues.authors = source ? [source] : undefined;
            });

            handleLeadValueChange(newValues);
        },
        [handleLeadValueChange, values],
    );

    const handleAutoFormatTitleButton = useCallback(
        () => {
            const newValues = produce(values, (safeValues) => {
                const { title: myTitle } = values;

                if (isFalsyString(myTitle)) {
                    return;
                }

                // eslint-disable-next-line no-param-reassign
                safeValues.title = formatTitleAsTitleCase
                    ? titleCase(myTitle) : capitalizeOnlyFirstLetter(myTitle);
                // eslint-disable-next-line no-param-reassign
                safeValues.title = trimFileExtension(safeValues.title);
            });

            setFormatTitleAsTitleCase(item => !item);
            handleLeadValueChange(newValues);
        },
        [formatTitleAsTitleCase, handleLeadValueChange, values],
    );

    const handleOrganizationSearchValueChange = useCallback(
        (text) => {
            setSearchedText(text);
        },
        [],
    );

    return (
        <div className={_cs(classNameFromProps, styles.leadItem)}>
            { pending && <LoadingAnimation /> }
            <Faram
                className={styles.addLeadForm}
                onChange={handleFaramChange}
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
                            onApplyAllClick={handleApplyAllClick}
                            onApplyAllBelowClick={handleApplyAllBelowClick}
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
                                onClick={handleAutoFormatTitleButton}
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
                    onApplyAllClick={handleApplyAllClick}
                    onApplyAllBelowClick={handleApplyAllBelowClick}
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

                        searchOptions={searchedOrganizations?.results ?? emptyList}
                        searchOptionsPending={pendingSearchedOrganizations}
                        onOptionsChange={onOrganizationsAdd}
                        onSearchValueChange={handleOrganizationSearchValueChange}
                    />
                    <ModalButton
                        title={_ts('addLeads', 'addPublisherTitle')}
                        iconName="addPerson"
                        transparent
                        modal={(
                            <AddOrganizationModal
                                title={_ts('addLeads', 'addPublisherModalTitle')}
                                loadOrganizationList
                                onOrganizationAdd={handlePublisherAdd}
                            />
                        )}
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.author}
                    disabled={isApplyAllDisabled}
                    identifierName="authors"
                    onApplyAllClick={handleApplyAllClick}
                    onApplyAllBelowClick={handleApplyAllBelowClick}
                    extraButtons={(
                        <Button
                            className={styles.smallButton}
                            iconName="copyOutline"
                            transparent
                            title={_ts('addLeads', 'sameAsPublisherButtonTitle')}
                            onClick={handleSameAsPublisherButtonClick}
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

                        searchOptions={searchedOrganizations?.results ?? emptyList}
                        searchOptionsPending={pendingSearchedOrganizations}
                        onOptionsChange={onOrganizationsAdd}
                        onSearchValueChange={handleOrganizationSearchValueChange}
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
                                onOrganizationAdd={handleAuthorAdd}
                            />
                        )}
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.priority}
                    disabled={isApplyAllDisabled}
                    identifierName="priority"
                    onApplyAllClick={handleApplyAllClick}
                    onApplyAllBelowClick={handleApplyAllBelowClick}
                >
                    <SegmentInput
                        faramElementName="priority"
                        name="priority-selector"
                        label={_ts('addLeads', 'priorityLabel')}
                        labelSelector={labelSelector}
                        keySelector={keySelector}
                        options={sortedPriorityOptions}
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.confidentiality}
                    disabled={isApplyAllDisabled}
                    identifierName="confidentiality"
                    onApplyAllClick={handleApplyAllClick}
                    onApplyAllBelowClick={handleApplyAllBelowClick}
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
                    onApplyAllClick={handleApplyAllClick}
                    onApplyAllBelowClick={handleApplyAllBelowClick}
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
                    onApplyAllClick={handleApplyAllClick}
                    onApplyAllBelowClick={handleApplyAllBelowClick}
                >
                    <DateInput
                        faramElementName="publishedOn"
                        label={_ts('addLeads', 'datePublishedLabel')}
                        placeholder={_ts('addLeads', 'datePublishedPlaceholderLabel')}
                    />
                </ApplyAll>
                <Cloak
                    hide={shouldHideLeadGroupInput}
                    render={(
                        <ApplyAll
                            className={styles.leadGroup}
                            disabled={isApplyAllDisabled}
                            identifierName="leadGroup"
                            onApplyAllClick={handleApplyAllClick}
                            onApplyAllBelowClick={handleApplyAllBelowClick}
                            extraButtons={(
                                <Button
                                    className={styles.smallButton}
                                    onClick={handleAddLeadGroupClick}
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
            {addLeadGroupModalShown && (
                <AddLeadGroup
                    onModalClose={handleAddLeadGroupModalClose}
                    onLeadGroupAdd={handleLeadGroupAdd}
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
LeadDetail.propTypes = propTypes;
LeadDetail.defaultProps = defaultProps;

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
    LeadDetail,
);
