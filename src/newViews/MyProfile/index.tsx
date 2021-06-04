import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import {
    AppState,
    LanguagePreference,
    MultiResponse,
} from '#typings';
import {
    TextInput,
    SelectInput,
    PendingMessage,
    Container,
    Checkbox,
    Button,
    Footer,
    List,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import { activeUserSelector } from '#redux';
import { useRequest, useLazyRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    ObjectSchema,
    requiredStringCondition,
    useForm,
    createSubmitHandler,
    arrayCondition,
} from '@togglecorp/toggle-form';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

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

type FormType = Partial<Pick<User, 'firstName' | 'lastName' | 'organization' | 'language' | 'emailOptOuts'>>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        firstName: [requiredStringCondition],
        lastName: [requiredStringCondition],
        organization: [],
        language: [requiredStringCondition],
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


interface Props {
    activeUser: { userId: number };
}

function MyProfile(props: Props) {
    const {
        activeUser,
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
        onSuccess: (response) => {
            onValueSet(response ?? {});
            onErrorSet({});
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('myProfile', 'myProfileTitle'))({ error: errorBody });
        },
    });
    const {
        pending: languagesPending,
        response: languageResponse,
    } = useRequest<MultiResponse<LanguagePreference>>({
        url: 'server://languages/',
        method: 'GET',
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('myProfile', 'myProfileTitle'))({ error: errorBody });
        },
    });

    const {
        pending: userPatchPending,
        trigger: userPatch,
    } = useLazyRequest<User, FormType>({
        url: `server://users/${activeUser.userId}/`,
        method: 'PATCH',
        body: ctx => ctx,
        onSuccess: (response) => {
            onValueSet(response ?? {});
            onErrorSet({});
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('myProfile', 'myProfileTitle'))({ error: errorBody });
        },
    });

    const handleCheck = useCallback((checked: boolean, name: EmailOptOut) => {
        if (checked) {
            onValueChange((oldValue: EmailOptOut[] | undefined) => ([
                ...(oldValue ?? []),
                name]), 'emailOptOuts' as const);
        } else {
            onValueChange((oldValue: EmailOptOut[] | undefined) => ([
                ...(oldValue ?? [])?.filter(v => v !== name),
            ]), 'emailOptOuts' as const);
        }
    }, [onValueChange]);

    const rowRendererParams = useCallback((key: EmailOptOut, data: EmailOptOutOption) => ({
        name: key,
        value: value?.emailOptOuts?.some(v => v === key),
        onChange: handleCheck,
        label: data.label,
    }), [value, handleCheck]);

    const handleSubmit = useCallback((values: FormType) => {
        userPatch(values);
    }, [userPatch]);

    const disabled = userGetPending || userPatchPending || languagesPending;
    return (
        <Container
            className={styles.myProfile}
            heading={_ts('myProfile', 'myProfileTitle')}
            sub
            headerClassName={styles.header}
            headingClassName={styles.heading}
            contentClassName={styles.content}
        >
            <form
                className={styles.form}
                onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            >
                {(userGetPending || languagesPending) && <PendingMessage />}
                {error?.$internal && (
                    <p>
                        {error.$internal}
                    </p>
                )}
                <div className={styles.mainContent}>
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
                        <List
                            data={emailOptOutsOptions}
                            renderer={Checkbox}
                            keySelector={emailOptOutKeySelector}
                            rendererParams={rowRendererParams}
                        />
                    </Container>
                </div>
                <Footer
                    className={styles.footer}
                    actions={(
                        <Button
                            disabled={disabled || pristine}
                            type="submit"
                            variant="primary"
                            name="saveProfile"
                        >
                            {_ts('myProfile', 'saveMyProfile')}
                        </Button>
                    )}
                />
            </form>
        </Container>
    );
}

export default connect(mapStateToProps)(MyProfile);
