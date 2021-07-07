import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
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
    arrayCondition,
    requiredCondition,
} from '@togglecorp/toggle-form';

import Avatar from '#newComponents/ui/Avatar';
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

type FormType = Partial<Pick<User, 'firstName' | 'lastName' | 'organization' | 'language' | 'emailOptOuts' | 'displayPictureUrl'>>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        firstName: [requiredStringCondition],
        lastName: [requiredStringCondition],
        organization: [],
        language: [requiredCondition],
        emailOptOuts: [arrayCondition],
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
        error,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
    } = useForm(initialValue, schema);

    const {
        pending: userGetPending,
    } = useRequest<User>({
        url: `server://users/${activeUser.userId}/`,
        method: 'GET',
        onSuccess: (response: User) => {
            onValueSet(response);
            onErrorSet({});
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
            onValueSet(response);
            onErrorSet({});
            setUserInformation({
                userId: activeUser.userId,
                information: response,
            });
        },
        failureHeader: _ts('myProfile', 'myProfileTitle'),
    });

    const handleCheck = useCallback((checked: boolean, name: EmailOptOut) => {
        if (checked) {
            onValueChange((oldValue: EmailOptOut[] | undefined) => ([
                ...(oldValue ?? []),
                name]), 'emailOptOuts' as const);
        } else {
            onValueChange((oldValue: EmailOptOut[] | undefined) => ([
                ...(oldValue ?? []).filter(v => v !== name),
            ]), 'emailOptOuts' as const);
        }
    }, [onValueChange]);

    const rowRendererParams = useCallback((key: EmailOptOut, data: EmailOptOutOption) => ({
        name: key,
        value: value?.emailOptOuts?.some(v => v === key),
        onChange: handleCheck,
        label: data.label,
    }), [value, handleCheck]);

    const handleSubmit = userPatch;

    const disabled = userGetPending || userPatchPending || languagesPending;
    return (
        <form
            className={styles.form}
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
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
                    <Avatar
                        className={styles.displayPicture}
                        src={value?.displayPictureUrl}
                        name={`${value?.firstName} ${value?.lastName}`}
                    />
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
                                onChange={onValueChange}
                                value={value?.firstName}
                                error={error?.fields?.firstName}
                                label={_ts('myProfile', 'firstName')}
                                placeholder={_ts('myProfile', 'firstName')}
                                autoFocus
                            />
                            <TextInput
                                name="lastName"
                                disabled={disabled}
                                onChange={onValueChange}
                                value={value?.lastName}
                                error={error?.fields?.lastName}
                                label={_ts('myProfile', 'lastName')}
                                placeholder={_ts('myProfile', 'lastName')}
                            />
                            <TextInput
                                name="organization"
                                disabled={disabled}
                                onChange={onValueChange}
                                value={value?.organization}
                                error={error?.fields?.organization}
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
                                onChange={onValueChange}
                                value={value?.language}
                                error={error?.fields?.language}
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
