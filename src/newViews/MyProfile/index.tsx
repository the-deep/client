import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
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

import Avatar from '#newComponents/ui/Avatar';
import DeepImageInput from '#newComponents/DeepImageInput';
import NonFieldError from '#newComponents/ui/NonFieldError';
import _ts from '#ts';
import {
    activeUserSelector,
    setUserInformationAction,
} from '#redux';
import {
    AppState,
    LanguagePreference,
    MultiResponse,
} from '#typings';
import { useRequest, useLazyRequest } from '#utils/request';
import ChangePasswordButton from '#newComponents/general/ChangePasswordButton';

import styles from './styles.scss';

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
const langaugeKeySelector = (d: LanguagePreference) => d.code;
const languageLabelSelector = (d: LanguagePreference) => d.title;

const initialValue: FormType = {};

interface PropsFromDispatch {
    setUserInformation: typeof setUserInformationAction;
}
const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setUserInformation: params => dispatch(setUserInformationAction(params)),
});

interface Option {
    id: number;
    title: string;
    file: string;
}

interface Props {
    activeUser: { userId: number };
}

function MyProfile(props: Props & PropsFromDispatch) {
    const {
        activeUser,
        setUserInformation,
    } = props;

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
        url: `server://users/${activeUser.userId}/`,
        method: 'GET',
        onSuccess: (response: User) => {
            setValue(response);
            setError({});
            setUserInformation({
                userId: activeUser.userId,
                information: response,
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
        url: `server://users/${activeUser.userId}/`,
        method: 'PATCH',
        body: ctx => ctx,
        onSuccess: (response) => {
            setValue(response);
            setError({});
            setUserInformation({
                userId: activeUser.userId,
                information: response,
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
                ...(oldValue ?? []).filter(v => v !== name),
            ]), 'emailOptOuts' as const);
        }
    }, [setFieldValue]);

    const rowRendererParams = useCallback((key: EmailOptOut, data: EmailOptOutOption) => ({
        name: key,
        value: value.emailOptOuts?.some(v => v === key),
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
            className={styles.form}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                className={styles.myProfile}
                headerClassName={styles.header}
                heading={_ts('myProfile', 'myProfileTitle')}
                contentClassName={styles.profileContent}
            >
                <Container
                    footerActions={(
                        <Button
                            disabled={disabled || pristine}
                            type="submit"
                            variant="primary"
                            name="saveProfile"
                        >
                            {_ts('myProfile', 'saveMyProfile')}
                        </Button>
                    )}
                    className={styles.content}
                >
                    {(userGetPending || languagesPending) && <PendingMessage />}
                    <div className={styles.displayPictureContainer}>
                        <Avatar
                            className={styles.displayPicture}
                            src={value.displayPicture
                                ? value.displayPictureUrl
                                : undefined
                            }
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
                    <NonFieldError
                        error={error}
                    />
                    <div className={styles.userInfo}>
                        <Container
                            className={styles.personalInfo}
                            heading={_ts('myProfile', 'personalInfo')}
                            sub
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
                            <ChangePasswordButton
                                className={styles.changePassword}
                            />
                        </Container>
                        <Container
                            className={styles.preferences}
                            sub
                            heading={_ts('myProfile', 'preferences')}
                        >
                            <SelectInput
                                name="language"
                                disabled={disabled}
                                onChange={setFieldValue}
                                value={value.language}
                                error={error?.language}
                                label={_ts('myProfile', 'platformLanguage')}
                                placeholder={_ts('myProfile', 'platformLanguage')}
                                keySelector={langaugeKeySelector}
                                labelSelector={languageLabelSelector}
                                options={languageResponse?.results}
                            />
                            <List // FIXME:  use ListSelection component when available
                                data={emailOptOutsOptions}
                                renderer={Checkbox}
                                keySelector={emailOptOutKeySelector}
                                rendererParams={rowRendererParams}
                            />
                        </Container>
                    </div>
                </Container>
            </Container>
        </form>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(MyProfile);
