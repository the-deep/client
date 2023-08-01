import React, { useState, useCallback, useMemo, useContext } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import {
    _cs,
    isDefined,
    randomString,
    isNotDefined,
} from '@togglecorp/fujs';
import produce from 'immer';
import {
    BadgeInput,
    Checkbox,
    DateInput,
    PendingMessage,
    QuickActionButton,
    SegmentInput,
    TextArea,
    TextInput,
    useBooleanState,
} from '@the-deep/deep-ui';
import {
    Error,
    getErrorObject,
    getErrorString,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    IoAdd,
    IoCopyOutline,
    IoEye,
} from 'react-icons/io5';

import { useLazyRequest } from '#base/utils/restRequest';
import { UserContext } from '#base/context/UserContext';
import NewOrganizationSelectInput, { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import ProjectUserSelectInput, { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
// import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import NewOrganizationMultiSelectInput from '#components/selections/NewOrganizationMultiSelectInput';
import AddOrganizationModal from '#components/general/AddOrganizationModal';
import NonFieldError from '#components/NonFieldError';
// import AddLeadGroupModal from '#components/general/AddLeadGroupModal';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    OrganizationDetails,
    EnumEntity,
} from '#types';
import {
    LeadType,
    TokenQuery,
} from '#generated/types';

import { PartialFormType } from './schema';
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
    country?: string;
    sourceRaw?: string;
    authorsRaw?: string[];
    pdfUrls?: string[];
}

interface WebInfoBody {
    url?: string;
    title?: string;
    date?: string;
    country?: string;
    source?: string;
    author?: string;
    sourceRaw?: string;
    authorsRaw?: string[];
}

interface WebInfo {
    date?: string;
    title?: string;
    url?: string;
    source?: OrganizationDetails;
    authors?: OrganizationDetails[];
}

interface KeyValue {
    key: string;
    value: string;
}
const optionKeySelector = (option: KeyValue) => option.key;
const optionLabelSelector = (option: KeyValue) => option.value.match(/(?:.+\/)(.+)/)?.[1] ?? option.value;

interface Props<N extends string | number | undefined> {
    name: N;
    className?: string;
    onChange: (value: SetValueArg<PartialFormType>, name: N) => void;
    value: PartialFormType;
    error: Error<PartialFormType> | undefined;
    pending?: boolean;
    projectId: string;
    disabled?: boolean;
    priorityOptions: EnumEntity<string>[] | undefined | null;
    confidentialityOptions: EnumEntity<string>[] | undefined | null;
    sourceOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len
    onSourceOrganizationOptionsChange: React.Dispatch<React.SetStateAction<BasicOrganization[] | undefined | null>>;
    authorOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len
    onAuthorOrganizationOptionsChange: React.Dispatch<React.SetStateAction<BasicOrganization[] | undefined | null>>;
    // leadGroupOptions: BasicLeadGroup[] | undefined | null;
    // eslint-disable-next-line max-len
    // onLeadGroupOptionsChange: React.Dispatch<React.SetStateAction<BasicLeadGroup[] | undefined | null>>;
    assigneeOptions: BasicProjectUser[] | undefined | null;
    // eslint-disable-next-line max-len
    onAssigneeOptionChange: React.Dispatch<React.SetStateAction<BasicProjectUser[] | undefined | null>>;
    pendingLeadOptions?: boolean;
    attachment: LeadType['attachment'] | undefined | null;
    hasAssessment?: boolean;
}

function LeadInput<N extends string | number | undefined>(props: Props<N>) {
    const {
        name,
        className,
        value,
        onChange,
        error: riskyError,
        pending: pendingFromProps,
        projectId,
        disabled,
        priorityOptions,
        confidentialityOptions,
        pendingLeadOptions,
        attachment,
        sourceOrganizationOptions,
        onSourceOrganizationOptionsChange,
        authorOrganizationOptions,
        onAuthorOrganizationOptionsChange,
        // leadGroupOptions,
        // onLeadGroupOptionsChange,
        assigneeOptions,
        onAssigneeOptionChange,
        hasAssessment,
    } = props;

    const { user } = useContext(UserContext);

    const defaultValue: PartialFormType = useMemo(() => ({
        clientId: randomString(),
        sourceType: 'WEBSITE',
        priority: 'LOW',
        confidentiality: 'UNPROTECTED',
        isAssessmentLead: false,
        assignee: user?.id,
    }), [user]);

    const error = getErrorObject(riskyError);
    const setFieldValue = useFormObject(name, onChange, defaultValue);

    const [
        organizationAddType,
        setOrganizationAddType,
    ] = useState<'author' | 'publisher' | undefined>(undefined);

    const [selectedPdf, setSelectedPdf] = useState<string>();
    const [
        pdfUrlOptions,
        setPdfUrlOptions,
    ] = useState<KeyValue[] | undefined>();

    const [
        showAddOrganizationModal,
        setShowAddOrganizationModalTrue,
        setShowAddOrganizationModalFalse,
    ] = useBooleanState(false);

    /*
    const [
        showAddLeadGroupModal,
        // setShowAddLeadAddGroupModal,
        setShowAddLeadGroupModalFalse,
    ] = useBooleanState(false);
     */

    const handlePdfSelect = useCallback((pdfUrl) => {
        setSelectedPdf(pdfUrl);
        setFieldValue(pdfUrl, 'url');
    }, [setFieldValue]);

    const handleInfoAutoFill = useCallback((webInfo: WebInfo) => {
        onChange((oldValues = defaultValue) => {
            const newValues = produce(oldValues, (safeValues) => {
                if (webInfo.date) {
                    // eslint-disable-next-line no-param-reassign
                    safeValues.publishedOn = webInfo.date;
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
                if (webInfo.authors) {
                    const authors = webInfo.authors.filter((author) => isDefined(author.id))
                        .map((author) => String(author.id));
                    // eslint-disable-next-line no-param-reassign
                    safeValues.authors = authors;
                }
            });
            return newValues;
        }, name);
        if (webInfo.source) {
            const transformedSource = {
                id: String(webInfo.source.id),
                title: String(webInfo.source.title),
            };
            onSourceOrganizationOptionsChange(
                (oldVal) => [...oldVal ?? [], transformedSource].filter(isDefined),
            );
        }
        if (webInfo.authors) {
            const transformedAuthors = webInfo.authors.map((author) => ({
                id: String(author.id),
                title: author.mergedAs ? author.mergedAs.title : author.title,
            }));
            onAuthorOrganizationOptionsChange(
                (oldVal) => [...oldVal ?? [], ...transformedAuthors].filter(isDefined),
            );
        }
    }, [
        defaultValue,
        name,
        onChange,
        onSourceOrganizationOptionsChange,
        onAuthorOrganizationOptionsChange,
    ]);

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
                title: ctx.title,
                url: ctx.url,
                ...response,
            });
        },
        failureMessage: 'Failed to extract Web Info.',
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
                if ((response.pdfUrls?.length ?? 0) > 0) {
                    const options = response.pdfUrls?.map((pdfUrl) => ({
                        key: pdfUrl,
                        value: pdfUrl,
                    }));
                    const urlOption = { key: ctx.url, value: ctx.url };
                    setSelectedPdf(ctx.url);
                    setPdfUrlOptions([urlOption, ...(options ?? [])]);
                }
                getWebInfo({
                    url: ctx.url,
                    title: response.title,
                    date: response.date,
                    country: response.country,
                    sourceRaw: response.sourceRaw,
                    authorsRaw: response.authorsRaw,
                });
            }
        },
    });

    const [
        getUserToken,
        {
            loading: pendingUserToken,
        },
    ] = useLazyQuery<TokenQuery>(
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

    const handleAddPublisherAsAuthor = useCallback(() => {
        if (value.source) {
            onAuthorOrganizationOptionsChange((oldValue) => (
                [...(oldValue ?? []), ...(sourceOrganizationOptions ?? [])]
            ));
            setFieldValue([value.source], 'authors');
        }
    }, [value, setFieldValue, onAuthorOrganizationOptionsChange, sourceOrganizationOptions]);

    const handleLeadDataExtract = useCallback(() => {
        getUserToken();
    }, [getUserToken]);

    const handleFileExtractClick = useCallback(() => {
        getUserToken();
    }, [getUserToken]);

    const handleOrganizationAdd = useCallback((val: { id: string; title: string }) => {
        const transformedVal = {
            id: String(val.id),
            title: val.title,
        };
        if (organizationAddType === 'publisher') {
            setFieldValue(transformedVal.id, 'source');
            onSourceOrganizationOptionsChange((oldVal) => [...oldVal ?? [], transformedVal]);
        } else if (organizationAddType === 'author') {
            setFieldValue((oldVal: string[] | undefined | null) => [...oldVal ?? [], transformedVal.id], 'authors');
            onAuthorOrganizationOptionsChange((oldVal) => [...oldVal ?? [], transformedVal]);
        }
    }, [
        organizationAddType,
        setFieldValue,
        onSourceOrganizationOptionsChange,
        onAuthorOrganizationOptionsChange,
    ]);

    /*
    const handleAddLeadGroupClick = useCallback(() => {
        setShowAddLeadAddGroupModal();
    }, [setShowAddLeadAddGroupModal]);

    const handleLeadGroupAdd = useCallback((val: BasicLeadGroup) => {
        setFieldValue(val.id, 'leadGroup');
        onLeadGroupOptionsChange((oldVal) => [...oldVal ?? [], val]);
    }, [setFieldValue]);
     */

    const pending = pendingFromProps || pendingUserToken || webInfoPending || rawWebInfoPending;

    return (
        <div className={_cs(styles.leadEditForm, className)}>
            {pending && <PendingMessage />}
            <NonFieldError error={error} />
            {value.sourceType === 'WEBSITE' && (
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
                            title="Auto-fill source information"
                            disabled={disabled}
                        >
                            <IoEye />
                        </QuickActionButton>
                    )}
                />
            )}
            {pdfUrlOptions && (
                <BadgeInput
                    value={selectedPdf}
                    name="selectedPdf"
                    label="Other sources:"
                    options={pdfUrlOptions}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    onChange={handlePdfSelect}
                    selectedButtonVariant="primary"
                    buttonVariant="tertiary"
                    selectedValueHidden
                    smallButtons
                />
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
                        <QuickActionButton
                            name="fileExtract"
                            title="Auto-fill source information"
                            variant="action"
                            onClick={handleFileExtractClick}
                            disabled={disabled}
                        >
                            <IoEye />
                        </QuickActionButton>
                    )
                }
            />
            <div className={styles.row}>
                <DateInput
                    className={styles.input}
                    label="Date Published"
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
                    onOptionsChange={onAssigneeOptionChange}
                    options={assigneeOptions}
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
                    options={sourceOrganizationOptions}
                    onOptionsChange={onSourceOrganizationOptionsChange}
                    disabled={pendingLeadOptions || disabled}
                    label="Publishing Organization"
                    // eslint-disable-next-line max-len
                    // hint={isTruthyString(value.sourceRaw) && `Previous organization: ${value.sourceRaw}`}
                    error={error?.source}
                    actions={(
                        <QuickActionButton
                            name="Add organizations"
                            variant="transparent"
                            onClick={handleAddPublishingOrganizationsClick}
                            disabled={pendingLeadOptions || disabled}
                            title="Add new organization"
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
                    options={authorOrganizationOptions}
                    onOptionsChange={onAuthorOrganizationOptionsChange}
                    disabled={pendingLeadOptions || disabled}
                    label="Authoring Organization"
                    // eslint-disable-next-line max-len
                    // hint={isTruthyString(value.authorRaw) && `Previous organization: ${value.authorRaw}`}
                    error={getErrorString(error?.authors)}
                    actions={(
                        <>
                            <QuickActionButton
                                name={undefined}
                                title="Same as publishing organization"
                                variant="transparent"
                                onClick={handleAddPublisherAsAuthor}
                                disabled={
                                    pendingLeadOptions || disabled || isNotDefined(value.source)
                                }
                            >
                                <IoCopyOutline />
                            </QuickActionButton>
                            <QuickActionButton
                                name={undefined}
                                title="Add new organization"
                                variant="transparent"
                                onClick={handleAddAuthorOrganizationsClick}
                                disabled={pendingLeadOptions || disabled}
                            >
                                <IoAdd />
                            </QuickActionButton>
                        </>
                    )}
                />
            </div>
            {hasAssessment && (
                <>
                    {/*
                    <LeadGroupSelectInput
                        name="leadGroup"
                        className={styles.input}
                        value={value.leadGroup}
                        onChange={setFieldValue}
                        options={leadGroupOptions}
                        onOptionsChange={onLeadGroupOptionsChange}
                        disabled={disabled}
                        label="Source Group"
                        error={error?.leadGroup}
                        projectId={projectId}
                        actions={(
                            <QuickActionButton
                                name={undefined}
                                variant="transparent"
                                onClick={handleAddLeadGroupClick}
                                disabled={disabled}
                                title="Add source group"
                            >
                                <IoAdd />
                            </QuickActionButton>
                        )}
                    />
                    */}
                    <Checkbox
                        name="isAssessmentLead"
                        value={value.isAssessmentLead}
                        onChange={setFieldValue}
                        className={styles.input}
                        label="Is Assessment"
                        disabled={disabled}
                    />
                </>
            )}
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
                <SegmentInput
                    name="confidentiality"
                    className={styles.input}
                    value={value.confidentiality}
                    onChange={setFieldValue}
                    options={confidentialityOptions ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    label="Confidentiality"
                    error={error?.confidentiality}
                    disabled={disabled}
                />
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
            {/*
            {showAddLeadGroupModal && (
                <AddLeadGroupModal
                    onModalClose={setShowAddLeadGroupModalFalse}
                    onLeadGroupAdd={handleLeadGroupAdd}
                />
            )}
              */}
        </div>
    );
}

export default LeadInput;
