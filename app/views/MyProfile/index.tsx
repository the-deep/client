import React, { useContext, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    TextInput,
    SelectInput,
    PendingMessage,
    Container,
    Checkbox,
    Button,
    List,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    requiredStringCondition,
    useForm,
    createSubmitHandler,
    defaultEmptyArrayType,
    requiredCondition,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Avatar from '#components/Avatar';
import DeepImageInput from '#components/general/DeepImageInput';
import NonFieldError from '#components/NonFieldError';
import _ts from '#ts';
import {
    LanguagePreference,
    MultiResponse,
} from '#types';
import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import UserContext from '#base/context/UserContext';

import ChangePasswordButton from './ChangePasswordButton';

import styles from './styles.css';

type EmailOptOut = 'news_and_updates' | 'join_requests' | 'email_comment';

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    displayName: string;
    lastActiveProject: number;
    loginAttempts: number;
    email: string;
    organization: string;
    displayPicture: number;
    displayPictureUrl: string;
    language: string;
    emailOptOuts: EmailOptOut[];
}

type FormType = Partial<Pick<User, 'firstName' | 'lastName' | 'organization' | 'language' | 'emailOptOuts' | 'displayPicture' | 'displayPictureUrl'>>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        displayPicture: [],
        firstName: [requiredStringCondition],
        lastName: [requiredStringCondition],
        organization: [],
        language: [requiredCondition],
        emailOptOuts: [defaultEmptyArrayType],
    }),
};

type EmailOptOutOption = {
    key: EmailOptOut;
    label: string;
}
const emailOptOutsOptions: EmailOptOutOption[] = [
    { key: 'news_and_updates', label: _ts('userProfile', 'newsAndUpdatesInfo') },
    { key: 'join_requests', label: _ts('userProfile', 'joinRequestsInfo') },
    { key: 'email_comment', label: _ts('userProfile', 'entryCommentsInfo') },
];
const emailOptOutKeySelector = (d: EmailOptOutOption) => d.key;
const languageKeySelector = (d: LanguagePreference) => d.code;
const languageLabelSelector = (d: LanguagePreference) => d.title;

const initialValue: FormType = {};

interface Option {
    id: number;
    title: string;
    file: string;
}

interface Props {
    className?: string;
}

function MyProfile(props: Props) {
    const {
        className,
    } = props;

    const {
        user,
        setUser,
    } = useContext(UserContext);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, initialValue);

    const error = getErrorObject(riskyError);

    const {
        pending: userGetPending,
    } = useRequest<User>({
        url: user ? `server://users/${user.id}/` : undefined,
        method: 'GET',
        onSuccess: (response: User) => {
            setValue(response);
            setError({});
            setUser({
                id: String(response.id),
                displayName: response.displayName,
                displayPictureUrl: response.displayPictureUrl,
            });
        },
        failureHeader: _ts('myProfile', 'myProfileTitle'),
    });
    const {
        pending: languagesPending,
        response: languageResponse,
    } = useRequest<MultiResponse<LanguagePreference>>({
        url: 'server://languages/',
        method: 'GET',
        failureHeader: _ts('myProfile', 'myProfileTitle'),
    });

    const {
        pending: userPatchPending,
        trigger: userPatch,
    } = useLazyRequest<User, FormType>({
        url: user ? `server://users/${user.id}/` : undefined,
        method: 'PATCH',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            setValue(response);
            setError({});
            setUser({
                id: String(response.id),
                displayName: response.displayName,
                displayPictureUrl: response.displayPictureUrl,
            });
        },
        failureHeader: _ts('myProfile', 'myProfileTitle'),
    });

    const handleCheck = useCallback((checked: boolean, name: EmailOptOut) => {
        if (checked) {
            setFieldValue((oldValue: EmailOptOut[] | undefined) => ([
                ...(oldValue ?? []),
                name]), 'emailOptOuts' as const);
        } else {
            setFieldValue((oldValue: EmailOptOut[] | undefined) => ([
                ...(oldValue ?? []).filter((v) => v !== name),
            ]), 'emailOptOuts' as const);
        }
    }, [setFieldValue]);

    const rowRendererParams = useCallback((key: EmailOptOut, data: EmailOptOutOption) => ({
        name: key,
        value: value.emailOptOuts?.some((v) => v === key),
        onChange: handleCheck,
        label: data.label,
    }), [value, handleCheck]);

    const handleSubmit = userPatch;

    const handleDisplayPictureOptionChange = useCallback((option: Option) => {
        setFieldValue(() => option.file, 'displayPictureUrl' as const);
    }, [setFieldValue]);

    const disabled = userGetPending || userPatchPending || languagesPending;
    return (
        <form
            className={_cs(styles.form, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                className={styles.container}
                heading={_ts('myProfile', 'myProfileTitle')}
                contentClassName={styles.content}
            >
                {(userGetPending || languagesPending) && <PendingMessage />}
                <div className={styles.displayPictureContainer}>
                    <Avatar
                        className={styles.displayPicture}
                        src={(value.displayPicture
                            ? value.displayPictureUrl
                            : undefined
                        )}
                        name={`${value.firstName} ${value.lastName}`}
                    />
                    <DeepImageInput
                        className={styles.changeDisplayPicture}
                        name="displayPicture"
                        value={value.displayPicture}
                        onChange={setFieldValue}
                        showStatus={false}
                        onOptionChange={handleDisplayPictureOptionChange}
                        labelClassName={styles.label}
                        fileInputClassName={styles.fileInput}
                    >
                        <FiEdit2 />
                    </DeepImageInput>
                </div>
                <NonFieldError error={error} />
                <div className={styles.userInfo}>
                    <Container
                        className={styles.personalInfo}
                        headingSize="small"
                        heading={_ts('myProfile', 'personalInfo')}
                        footerIcons={(
                            <ChangePasswordButton />
                        )}
                        contentClassName={styles.inputContainer}
                    >
                        <TextInput
                            name="firstName"
                            disabled={disabled}
                            onChange={setFieldValue}
                            value={value.firstName}
                            error={error?.firstName}
                            label={_ts('myProfile', 'firstName')}
                            placeholder={_ts('myProfile', 'firstName')}
                            autoFocus
                        />
                        <TextInput
                            name="lastName"
                            disabled={disabled}
                            onChange={setFieldValue}
                            value={value.lastName}
                            error={error?.lastName}
                            label={_ts('myProfile', 'lastName')}
                            placeholder={_ts('myProfile', 'lastName')}
                        />
                        <TextInput
                            name="organization"
                            disabled={disabled}
                            onChange={setFieldValue}
                            value={value.organization}
                            error={error?.organization}
                            label={_ts('myProfile', 'organization')}
                            placeholder={_ts('myProfile', 'organization')}
                        />
                    </Container>
                    <Container
                        className={styles.preferences}
                        heading={_ts('myProfile', 'preferences')}
                        headingSize="small"
                        contentClassName={styles.inputContainer}
                    >
                        <SelectInput
                            name="language"
                            disabled={disabled}
                            onChange={setFieldValue}
                            value={value.language}
                            error={error?.language}
                            label={_ts('myProfile', 'platformLanguage')}
                            placeholder={_ts('myProfile', 'platformLanguage')}
                            keySelector={languageKeySelector}
                            labelSelector={languageLabelSelector}
                            options={languageResponse?.results}
                        />
                        <Container
                            className={styles.emailPreferences}
                            heading="Email Notifications"
                            headingSize="extraSmall"
                            contentClassName={styles.inputContainer}
                        >
                            <List // FIXME:  use ListSelection component when available
                                data={emailOptOutsOptions}
                                renderer={Checkbox}
                                keySelector={emailOptOutKeySelector}
                                rendererParams={rowRendererParams}
                            />
                        </Container>
                    </Container>
                </div>
                <div className={styles.buttonContainer}>
                    <Button
                        disabled={disabled || pristine}
                        type="submit"
                        variant="primary"
                        name="saveProfile"
                    >
                        {_ts('myProfile', 'saveMyProfile')}
                    </Button>
                </div>
            </Container>
        </form>
    );
}

export default MyProfile;
