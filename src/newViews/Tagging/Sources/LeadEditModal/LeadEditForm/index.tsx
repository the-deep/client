import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    unique,
    isTruthyString,
    compareNumber,
    isDefined,
} from '@togglecorp/fujs';
import produce from 'immer';
import {
    PendingMessage,
    TextInput,
    DateInput,
    SegmentInput,
    SelectInput,
    Checkbox,
    TextArea,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    getErrorString,
    SetValueArg,
} from '@togglecorp/toggle-form';
import {
    IoAdd,
    IoEye,
} from 'react-icons/io5';

import { useRequest, useLazyRequest } from '#utils/request';
import OrganizationSelectInput from '#newComponents/input/OrganizationSelectInput';
import OrganizationMultiSelectInput from '#newComponents/input/OrganizationMultiSelectInput';
import LeadGroupSelectInput, { BasicLeadGroup } from '#newComponents/input/LeadGroupSelectInput';
import AddOrganizationModal from '#newComponents/general/AddOrganizationModal';
import AddLeadGroupModal from '#newComponents/general/AddLeadGroupModal';
import {
    useModalState,
} from '#hooks/stateManagement';
import {
    BasicOrganization,
    LeadGroup,
    OrganizationDetails,
} from '#typings';

import {
    PartialFormType,
    LeadOptions,
    Priority,
} from './schema';
import ConfidentialityInput from './ConfidentialityInput';
import EmmStats from './EmmStats';

import styles from './styles.scss';

// FIXME: Use translations throughout the page

interface Token {
    refresh: string;
}

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

const idSelector = (item: { id: number }) => item.id;
const titleSelector = (item: { title: string}) => item.title;
const displayNameSelector = (item: { displayName: string }) => item.displayName;

const keySelector = (item: Priority) => item.key;
const valueSelector = (item: Priority) => item.value;

interface Props {
    className?: string;
    setFieldValue: (...values: EntriesAsList<PartialFormType>) => void;
    setValue: (value: SetValueArg<PartialFormType>) => void;
    value: PartialFormType;
    error: Error<PartialFormType> | undefined;
    setPristine: (val: boolean) => void;
    initialValue: PartialFormType;
    pending?: boolean;
    ready?: boolean;
    projectId: number;
}

function LeadEditForm(props: Props) {
    const {
        className,
        value,
        setValue,
        setPristine,
        initialValue,
        error: riskyError,
        setFieldValue,
        pending: pendingFromProps,
        ready,
        projectId,
    } = props;
    const error = getErrorObject(riskyError);

    const optionsRequestBody = useMemo(() => ({
        projects: [initialValue.project],
        leadGroups: [initialValue.leadGroup].filter(isDefined),
        organizations: unique(
            [
                initialValue.source,
                ...(initialValue.authors || []),
            ].filter(isDefined),
            id => id,
        ),
    }), [initialValue]);

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
        setAddOrganizationModalVisible,
        setAddOrganizationModalHidden,
    ] = useModalState(false);

    const [
        showAddLeadGroupModal,
        setAddLeadGroupModalVisible,
        setAddLeadGroupModalHidden,
    ] = useModalState(false);

    const {
        pending: pendingLeadOptions,
        response: leadOptions,
    } = useRequest<LeadOptions>({
        method: 'POST',
        url: 'server://lead-options/',
        body: optionsRequestBody,
        onSuccess: (response) => {
            if (response.organizations) {
                setSourceOrganizationOptions(oldVal => unique([
                    ...(oldVal ?? []),
                    ...response.organizations,
                ], d => d.id));
                setAuthorOrganizationOptions(oldVal => unique([
                    ...(oldVal ?? []),
                    ...response.organizations,
                ], d => d.id));
            }
        },
        failureHeader: 'Lead Options',
        skip: !ready,
    });

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
                    safeValues.source = webInfo.source.id;
                }
                if (webInfo.author) {
                    // FIXME: we have to look into this
                    // eslint-disable-next-line no-param-reassign
                    safeValues.authors = [webInfo.author.id];
                }
            });
            return newValues;
        });
        if (webInfo.source) {
            setSourceOrganizationOptions(
                oldVal => [...oldVal ?? [], webInfo.source].filter(isDefined),
            );
        }
        if (webInfo.author) {
            setAuthorOrganizationOptions(
                oldVal => [...oldVal ?? [], webInfo.author].filter(isDefined),
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
        body: ctx => ctx,
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
    } = useLazyRequest<RawWebInfo, { url: string; isFile: boolean }>({
        method: 'GET',
        url: 'serverless://web-info-extract/',
        query: ctx => ({ url: ctx.url }),
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

    const {
        pending: pendingUserToken,
        trigger: getUserToken,
    } = useLazyRequest<Token, { isFile: boolean }>({
        method: 'GET',
        url: 'server://token/',
        onSuccess: (_, ctx) => {
            if (ctx.isFile && value.attachment?.file) {
                getRawWebInfo({
                    url: value.attachment.file,
                    isFile: true,
                });
            } else if (value.url) {
                getRawWebInfo({
                    url: value.url,
                    isFile: false,
                });
            }
            // FIXME: Use string
            console.error('No attachment or URL found in lead to be extracted');
        },
        failureHeader: 'User Access Token',
        mockResponse: ({
            // FIXME: Remove mock response, Use GraphQL
            refresh: 'asdasd',
        }),
    });

    const sortedPriority = useMemo(() => (
        leadOptions?.priority?.sort((a, b) => compareNumber(a.key, b.key))
    ), [leadOptions?.priority]);

    const handleAddPublishingOrganizationsClick = useCallback(() => {
        setAddOrganizationModalVisible();
        setOrganizationAddType('publisher');
    }, [setAddOrganizationModalVisible]);

    const handleAddAuthorOrganizationsClick = useCallback(() => {
        setAddOrganizationModalVisible();
        setOrganizationAddType('author');
    }, [setAddOrganizationModalVisible]);

    const handleLeadDataExtract = useCallback(() => {
        getUserToken({ isFile: false });
    }, [getUserToken]);

    const handleFileExtractClick = useCallback(() => {
        getUserToken({ isFile: true });
    }, [getUserToken]);

    const handleOrganizationAdd = useCallback((val: BasicOrganization) => {
        if (organizationAddType === 'publisher') {
            setFieldValue(val.id, 'source');
            setSourceOrganizationOptions(oldVal => [...oldVal ?? [], val]);
        } else if (organizationAddType === 'author') {
            setFieldValue((oldVal: number[] | undefined) => [...oldVal ?? [], val.id], 'authors');
            setAuthorOrganizationOptions(oldVal => [...oldVal ?? [], val]);
        }
    }, [organizationAddType, setFieldValue]);

    const handleAddLeadGroupClick = useCallback(() => {
        setAddLeadGroupModalVisible();
    }, [setAddLeadGroupModalVisible]);

    const handleLeadGroupAdd = useCallback((val: LeadGroup) => {
        setFieldValue(val.id, 'leadGroup');
        setLeadGroupOptions(oldVal => [...oldVal ?? [], val]);
    }, [setFieldValue]);

    const pending = pendingUserToken || pendingFromProps
    || pendingLeadOptions || webInfoPending || rawWebInfoPending;

    return (
        <div className={_cs(styles.leadEditForm, className)}>
            {pending && <PendingMessage />}
            <SelectInput
                label="Project"
                name="project"
                value={value.project}
                className={styles.input}
                onChange={setFieldValue}
                keySelector={idSelector}
                labelSelector={titleSelector}
                options={leadOptions?.projects}
                error={error?.project}
                readOnly
            />
            {value.sourceType === 'website' && (
                <>
                    <TextInput
                        className={styles.input}
                        label="URL"
                        name="url"
                        value={value.url}
                        onChange={setFieldValue}
                        error={error?.url}
                        readOnly={!!value.id}
                        actions={(
                            <QuickActionButton
                                name="leadExtract"
                                variant="action"
                                onClick={handleLeadDataExtract}
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
                    />
                </>
            )}
            {value.sourceType === 'text' && (
                <TextArea
                    className={styles.input}
                    label="Text"
                    name="text"
                    value={value.text}
                    onChange={setFieldValue}
                    rows={10}
                    error={error?.text}
                />
            )}
            <TextInput
                className={styles.input}
                label="Title"
                name="title"
                value={value.title}
                onChange={setFieldValue}
                error={error?.title}
                actions={
                    (
                        value.sourceType === 'disk'
                        || value.sourceType === 'dropbox'
                        || value.sourceType === 'google-drive'
                    ) && (
                        <>
                            <QuickActionButton
                                name="fileExtract"
                                variant="action"
                                onClick={handleFileExtractClick}
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
                options={leadGroupOptions ?? leadOptions?.leadGroups}
                onOptionsChange={setLeadGroupOptions}
                disabled={pending}
                label="Lead Group"
                error={error?.leadGroup}
                projectId={projectId}
                actions={(
                    <QuickActionButton
                        name="add-lead-group"
                        variant="transparent"
                        onClick={handleAddLeadGroupClick}
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
                />
                <SelectInput
                    className={styles.input}
                    label="Assignee"
                    name="assignee"
                    value={value.assignee}
                    onChange={setFieldValue}
                    keySelector={idSelector}
                    labelSelector={displayNameSelector}
                    options={leadOptions?.members}
                    error={error?.assignee}
                />
            </div>
            <div className={styles.row}>
                <OrganizationSelectInput
                    className={styles.input}
                    name="source"
                    value={value.source}
                    onChange={setFieldValue}
                    options={sourceOrganizationOptions ?? leadOptions?.organizations}
                    onOptionsChange={setSourceOrganizationOptions}
                    disabled={pending}
                    label="Publishing Organizations"
                    hint={isTruthyString(value.sourceRaw) && `Previous organization: ${value.sourceRaw}`}
                    error={error?.source}
                    actions={(
                        <QuickActionButton
                            name="add organizations"
                            variant="transparent"
                            onClick={handleAddPublishingOrganizationsClick}
                        >
                            <IoAdd />

                        </QuickActionButton>
                    )}
                />
                <OrganizationMultiSelectInput
                    className={styles.input}
                    name="authors"
                    value={value.authors}
                    onChange={setFieldValue}
                    options={authorOrganizationOptions ?? leadOptions?.organizations}
                    onOptionsChange={setAuthorOrganizationOptions}
                    disabled={pending}
                    label="Authoring Organizations"
                    hint={isTruthyString(value.authorRaw) && `Previous organization: ${value.authorRaw}`}
                    error={getErrorString(error?.authors)}
                    actions={(
                        <QuickActionButton
                            name="add organizations"
                            variant="transparent"
                            onClick={handleAddAuthorOrganizationsClick}
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
                    options={sortedPriority}
                    keySelector={keySelector}
                    labelSelector={valueSelector}
                    className={styles.input}
                    error={error?.priority}
                />
                <div className={styles.nestedRow}>
                    <ConfidentialityInput
                        name="confidentiality"
                        className={styles.nestedInput}
                        value={value.confidentiality}
                        onChange={setFieldValue}
                        label="Confidential"
                    />
                    <Checkbox
                        className={styles.nestedInput}
                        name="isAssessmentLead"
                        value={value.isAssessmentLead}
                        onChange={setFieldValue}
                        label="Is Assessment"
                    />
                </div>
            </div>
            <EmmStats
                emmTriggers={value.emmTriggers}
                emmEntities={value.emmEntities}
            />
            {showAddOrganizationModal && (
                <AddOrganizationModal
                    onModalClose={setAddOrganizationModalHidden}
                    onOrganizationAdd={handleOrganizationAdd}
                />
            )}
            {showAddLeadGroupModal && (
                <AddLeadGroupModal
                    onModalClose={setAddLeadGroupModalHidden}
                    onLeadGroupAdd={handleLeadGroupAdd}
                />
            )}
        </div>
    );
}

export default LeadEditForm;
