import React, { useState, useCallback } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import produce from 'immer';
import {
    PendingMessage,
    TextInput,
    DateInput,
    SegmentInput,
    Checkbox,
    TextArea,
    QuickActionButton,
    useBooleanState,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    getErrorString,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';
import {
    IoAdd,
    IoEye,
} from 'react-icons/io5';

import { useLazyRequest } from '#base/utils/restRequest';
import NewOrganizationSelectInput, { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import ProjectUserSelectInput, { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import LeadGroupSelectInput, { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import NewOrganizationMultiSelectInput from '#components/selections/NewOrganizationMultiSelectInput';
import AddOrganizationModal from '#components/general/AddOrganizationModal';
import AddLeadGroupModal from '#components/general/AddLeadGroupModal';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    OrganizationDetails,
} from '#types';
import {
    LeadType,
    TokenQuery,
    LeadOptionsQuery,
} from '#generated/types';

import { PartialFormType } from './schema';
import ConfidentialityInput from './ConfidentialityInput';
import EmmStats from './EmmStats';

import styles from './styles.css';

// FIXME: Use translations throughout the page

const TOKEN = gql`
    query Token {
        me {
            id
            jwtToken {
                accessToken
                expiresIn
            }
        }
    }
`;

interface RawWebInfo {
    title?: string;
    date?: string;
    website?: string;
    country?: string;
    sourceRaw?: string;
    authorRaw?: string;
}

interface WebInfoBody {
    url?: string;
    title?: string;
    date?: string;
    website?: string;
    country?: string;
    source?: string;
    author?: string;
    sourceRaw?: string;
    authorRaw?: string;
}

interface WebInfo {
    date?: string;
    website?: string;
    title?: string;
    url?: string;
    source?: OrganizationDetails;
    author?: OrganizationDetails;
}

interface Props {
    className?: string;
    setFieldValue: (...values: EntriesAsList<PartialFormType>) => void;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    value: PartialFormType;
    error: Error<PartialFormType> | undefined;
    setPristine: (val: boolean) => void;
    pending?: boolean;
    projectId: string;
    disabled?: boolean;
    priorityOptions: NonNullable<LeadOptionsQuery['leadPriorityOptions']>['enumValues'] | undefined;
    sourceOrganization: BasicOrganization | undefined | null;
    authorOrganizations: BasicOrganization[] | undefined | null;
    leadGroup: BasicLeadGroup | undefined | null;
    assignee: { id: string; displayName?: string | null } | undefined | null;
    pendingLeadOptions?: boolean;
    attachment: LeadType['attachment'];
}

function LeadEditForm(props: Props) {
    const {
        className,
        value,
        setValue,
        setPristine,
        error: riskyError,
        setFieldValue,
        pending: pendingFromProps,
        projectId,
        disabled,
        priorityOptions,
        sourceOrganization,
        authorOrganizations,
        leadGroup,
        assignee,
        pendingLeadOptions,
        attachment,
    } = props;

    const error = getErrorObject(riskyError);

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<BasicProjectUser[] | undefined | null>();

    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    // NOTE: the loading animation flashes when loading for
    // lead-options. this will be mitigated when using graphql
    const [
        organizationAddType,
        setOrganizationAddType,
    ] = useState<'author' | 'publisher' | undefined>(undefined);

    const [
        leadGroupOptions,
        setLeadGroupOptions,
    ] = useState<BasicLeadGroup[] | undefined | null>(undefined);

    const [
        showAddOrganizationModal,
        setShowAddOrganizationModalTrue,
        setShowAddOrganizationModalFalse,
    ] = useBooleanState(false);

    const [
        showAddLeadGroupModal,
        setShowAddLeadAddGroupModal,
        setShowAddLeadGroupModalFalse,
    ] = useBooleanState(false);

    const handleInfoAutoFill = useCallback((webInfo: WebInfo) => {
        setValue((oldValues) => {
            const newValues = produce(oldValues, (safeValues) => {
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
                    safeValues.source = String(webInfo.source.id);
                }
                if (webInfo.author) {
                    // FIXME: we have to look into this
                    // eslint-disable-next-line no-param-reassign
                    safeValues.authors = [String(webInfo.author.id)].filter(isDefined);
                }
            });
            return newValues;
        });
        if (webInfo.source) {
            const transformedSource = {
                id: String(webInfo.source.id),
                title: String(webInfo.source.id),
            };
            setSourceOrganizationOptions(
                (oldVal) => [...oldVal ?? [], transformedSource].filter(isDefined),
            );
        }
        if (webInfo.author) {
            const transformedAuthor = {
                id: String(webInfo.author.id),
                title: String(webInfo.author.id),
            };
            setAuthorOrganizationOptions(
                (oldVal) => [...oldVal ?? [], transformedAuthor].filter(isDefined),
            );
        }
        setPristine(false);
    }, [setValue, setPristine]);

    const {
        pending: webInfoPending,
        trigger: getWebInfo,
    } = useLazyRequest<WebInfo, WebInfoBody>({
        method: 'POST',
        url: 'server://v2/web-info-data/',
        body: (ctx) => ctx,
        onSuccess: (response, ctx) => {
            handleInfoAutoFill({
                date: ctx.date,
                website: ctx.website,
                title: ctx.title,
                url: ctx.url,
                ...response,
            });
        },
        failureHeader: 'Web Info Extract',
    });

    const {
        pending: rawWebInfoPending,
        trigger: getRawWebInfo,
    } = useLazyRequest<RawWebInfo, { url: string; isFile: boolean, token: string }>({
        method: 'GET',
        url: 'serverless://web-info-extract/',
        query: (ctx) => ({ url: ctx.url }),
        other: (ctx) => ({
            headers: {
                Authorization: `Bearer ${ctx.token}`,
            },
        }),
        onSuccess: (response, ctx) => {
            if (ctx.isFile) {
                handleInfoAutoFill({
                    title: response.title,
                });
            } else {
                getWebInfo({
                    url: ctx.url,
                    title: response.title,
                    date: response.date,
                    website: response.website,
                    country: response.country,
                    sourceRaw: response.sourceRaw,
                    authorRaw: response.authorRaw,
                });
            }
        },
        failureHeader: 'Raw Web Info Extract',
    });

    const [getUserToken, { loading: pendingUserToken }] = useLazyQuery<TokenQuery>(
        TOKEN,
        {
            fetchPolicy: 'network-only',
            onCompleted: (data) => {
                const token = data.me?.jwtToken?.accessToken;
                if (!token) {
                    return;
                }

                if (value.sourceType === 'WEBSITE' && value.url) {
                    getRawWebInfo({
                        url: value.url,
                        isFile: false,
                        token,
                    });
                } else if (attachment?.file?.url) {
                    getRawWebInfo({
                        url: attachment.file.url,
                        isFile: true,
                        token,
                    });
                } else {
                    // eslint-disable-next-line no-console
                    console.error('No attachment or URL found in lead to be extracted');
                }
            },
        },
    );

    const handleAddPublishingOrganizationsClick = useCallback(() => {
        setShowAddOrganizationModalTrue();
        setOrganizationAddType('publisher');
    }, [setShowAddOrganizationModalTrue]);

    const handleAddAuthorOrganizationsClick = useCallback(() => {
        setShowAddOrganizationModalTrue();
        setOrganizationAddType('author');
    }, [setShowAddOrganizationModalTrue]);

    const handleLeadDataExtract = useCallback(() => {
        getUserToken();
    }, [getUserToken]);

    const handleFileExtractClick = useCallback(() => {
        getUserToken();
    }, [getUserToken]);

    const handleOrganizationAdd = useCallback((val: { id: number; title: string }) => {
        const transformedVal = {
            id: String(val.id),
            title: val.title,
        };
        if (organizationAddType === 'publisher') {
            setFieldValue(transformedVal.id, 'source');
            setSourceOrganizationOptions((oldVal) => [...oldVal ?? [], transformedVal]);
        } else if (organizationAddType === 'author') {
            setFieldValue((oldVal: string[] | undefined | null) => [...oldVal ?? [], transformedVal.id], 'authors');
            setAuthorOrganizationOptions((oldVal) => [...oldVal ?? [], transformedVal]);
        }
    }, [organizationAddType, setFieldValue]);

    const handleAddLeadGroupClick = useCallback(() => {
        setShowAddLeadAddGroupModal();
    }, [setShowAddLeadAddGroupModal]);

    const handleLeadGroupAdd = useCallback((val: BasicLeadGroup) => {
        setFieldValue(val.id, 'leadGroup');
        setLeadGroupOptions((oldVal) => [...oldVal ?? [], val]);
    }, [setFieldValue]);

    const pending = pendingFromProps || pendingUserToken || webInfoPending || rawWebInfoPending;

    return (
        <div className={_cs(styles.leadEditForm, className)}>
            {pending && <PendingMessage />}
            {value.sourceType === 'WEBSITE' && (
                <>
                    <TextInput
                        className={styles.input}
                        label="URL"
                        name="url"
                        value={value.url}
                        onChange={setFieldValue}
                        error={error?.url}
                        readOnly={!!value.id}
                        disabled={disabled}
                        actions={(
                            <QuickActionButton
                                name="leadExtract"
                                variant="action"
                                onClick={handleLeadDataExtract}
                                disabled={disabled}
                            >
                                <IoEye />
                            </QuickActionButton>
                        )}
                    />
                    <TextInput
                        className={styles.input}
                        label="Website"
                        name="website"
                        value={value.website}
                        onChange={setFieldValue}
                        error={error?.website}
                        disabled={disabled}
                    />
                </>
            )}
            {value.sourceType === 'TEXT' && (
                <TextArea
                    className={styles.input}
                    label="Text"
                    name="text"
                    value={value.text}
                    onChange={setFieldValue}
                    rows={10}
                    error={error?.text}
                    disabled={disabled}
                />
            )}
            <TextInput
                className={styles.input}
                label="Title"
                name="title"
                value={value.title}
                onChange={setFieldValue}
                error={error?.title}
                disabled={disabled}
                actions={
                    (
                        value.sourceType === 'DISK'
                        || value.sourceType === 'DROPBOX'
                        || value.sourceType === 'GOOGLE_DRIVE'
                    ) && attachment?.file && (
                        <>
                            <QuickActionButton
                                name="fileExtract"
                                variant="action"
                                onClick={handleFileExtractClick}
                                disabled={disabled}
                            >
                                <IoEye />
                            </QuickActionButton>
                        </>
                    )
                }
            />
            <LeadGroupSelectInput
                // FIXME: Filter this out based on if the project has assessment or not
                name="leadGroup"
                className={styles.input}
                value={value.leadGroup}
                onChange={setFieldValue}
                options={leadGroupOptions ?? (leadGroup && [leadGroup])}
                onOptionsChange={setLeadGroupOptions}
                disabled={disabled}
                label="Lead Group"
                error={error?.leadGroup}
                projectId={projectId}
                actions={(
                    <QuickActionButton
                        name="add-lead-group"
                        variant="transparent"
                        onClick={handleAddLeadGroupClick}
                        disabled={disabled}
                    >
                        <IoAdd />

                    </QuickActionButton>
                )}
            />
            <div className={styles.row}>
                <DateInput
                    className={styles.input}
                    label="Published On"
                    name="publishedOn"
                    value={value.publishedOn}
                    onChange={setFieldValue}
                    error={error?.publishedOn}
                    disabled={disabled}
                />
                <ProjectUserSelectInput
                    className={styles.input}
                    disabled={pendingLeadOptions || disabled}
                    error={error?.assignee}
                    label="Assignee"
                    name="assignee"
                    onChange={setFieldValue}
                    onOptionsChange={setProjectUserOptions}
                    options={projectUserOptions ?? (assignee ? [assignee] : undefined)}
                    value={value.assignee}
                    projectId={projectId}
                />
            </div>
            <div className={styles.row}>
                <NewOrganizationSelectInput
                    className={styles.input}
                    name="source"
                    value={value.source}
                    onChange={setFieldValue}
                    options={
                        sourceOrganizationOptions
                        ?? (sourceOrganization ? [sourceOrganization] : undefined)
                    }
                    onOptionsChange={setSourceOrganizationOptions}
                    disabled={pendingLeadOptions || disabled}
                    label="Publishing Organizations"
                    // eslint-disable-next-line max-len
                    // hint={isTruthyString(value.sourceRaw) && `Previous organization: ${value.sourceRaw}`}
                    error={error?.source}
                    actions={(
                        <QuickActionButton
                            name="add organizations"
                            variant="transparent"
                            onClick={handleAddPublishingOrganizationsClick}
                            disabled={pendingLeadOptions || disabled}
                        >
                            <IoAdd />

                        </QuickActionButton>
                    )}
                />
                <NewOrganizationMultiSelectInput
                    className={styles.input}
                    name="authors"
                    value={value.authors}
                    onChange={setFieldValue}
                    options={
                        authorOrganizationOptions ?? authorOrganizations
                    }
                    onOptionsChange={setAuthorOrganizationOptions}
                    disabled={pendingLeadOptions || disabled}
                    label="Authoring Organizations"
                    // eslint-disable-next-line max-len
                    // hint={isTruthyString(value.authorRaw) && `Previous organization: ${value.authorRaw}`}
                    error={getErrorString(error?.authors)}
                    actions={(
                        <QuickActionButton
                            name="add organizations"
                            variant="transparent"
                            onClick={handleAddAuthorOrganizationsClick}
                            disabled={pendingLeadOptions || disabled}
                        >
                            <IoAdd />

                        </QuickActionButton>
                    )}
                />
            </div>
            <div className={styles.row}>
                <SegmentInput
                    name="priority"
                    label="Priority"
                    value={value.priority}
                    onChange={setFieldValue}
                    options={priorityOptions ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    className={styles.input}
                    error={error?.priority}
                    disabled={disabled}
                />
                <div className={styles.nestedRow}>
                    <ConfidentialityInput
                        name="confidentiality"
                        className={styles.nestedInput}
                        value={value.confidentiality ?? undefined}
                        onChange={setFieldValue}
                        label="Confidential"
                        disabled={disabled}
                    />
                    <Checkbox
                        className={styles.nestedInput}
                        name="isAssessmentLead"
                        value={value.isAssessmentLead}
                        onChange={setFieldValue}
                        label="Is Assessment"
                        disabled={disabled}
                    />
                </div>
            </div>
            <EmmStats
                emmTriggers={value.emmTriggers}
                emmEntities={value.emmEntities}
            />
            {showAddOrganizationModal && (
                <AddOrganizationModal
                    onModalClose={setShowAddOrganizationModalFalse}
                    onOrganizationAdd={handleOrganizationAdd}
                />
            )}
            {showAddLeadGroupModal && (
                <AddLeadGroupModal
                    onModalClose={setShowAddLeadGroupModalFalse}
                    onLeadGroupAdd={handleLeadGroupAdd}
                />
            )}
        </div>
    );
}

export default LeadEditForm;
