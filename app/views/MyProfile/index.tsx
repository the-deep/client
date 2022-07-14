import React, { useContext, useCallback } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    TextInput,
    PendingMessage,
    Container,
    Button,
    useAlert,
    CheckListInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    requiredStringCondition,
    useForm,
    createSubmitHandler,
    defaultEmptyArrayType,
    getErrorObject,
    removeNull,
    internal,
    PartialForm,
} from '@togglecorp/toggle-form';
import { useQuery, useMutation, gql } from '@apollo/client';

import Avatar from '#components/Avatar';
import DeepImageInput, { Option } from '#components/general/DeepImageInput';
import NonFieldError from '#components/NonFieldError';
import _ts from '#ts';
import {
    MeDetailsQuery,
    MeDetailsQueryVariables,
    UpdateMeMutation,
    UpdateMeMutationVariables,
    UserEmailConditionOptOutEnum,
} from '#generated/types';
import UserContext from '#base/context/UserContext';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import ChangePasswordButton from './ChangePasswordButton';

import styles from './styles.css';

type FormType = PartialForm<UpdateMeMutationVariables['data']> & {
    displayPictureUrl?: string;
};

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        displayPicture: [],
        firstName: [requiredStringCondition],
        lastName: [requiredStringCondition],
        organization: [],
        emailOptOuts: [defaultEmptyArrayType],
    }),
};

interface EmailOptOutOption {
    key: UserEmailConditionOptOutEnum;
    label: string;
}
const emailOptOutsOptions: EmailOptOutOption[] = [
    { key: 'NEWS_AND_UPDATES', label: _ts('userProfile', 'newsAndUpdatesInfo') },
    { key: 'JOIN_REQUESTS', label: _ts('userProfile', 'joinRequestsInfo') },
    { key: 'EMAIL_COMMENT', label: _ts('userProfile', 'entryCommentsInfo') },
];
const emailOptOutKeySelector = (d: EmailOptOutOption) => d.key;
const emailOptOutLabelSelector = (d: EmailOptOutOption) => d.label;

const initialValue: FormType = {};

interface Props {
    className?: string;
}

const ME_DETAILS = gql`
    query MeDetails {
        me {
            displayPicture
            displayPictureUrl
            displayName
            emailOptOuts
            firstName
            id
            organization
            lastName
        }
    }
`;

const UPDATE_ME = gql`
    mutation UpdateMe($data: UserMeInputType!) {
        updateMe(data: $data) {
            errors
            ok
            result {
                displayName
                displayPicture
                displayPictureUrl
                email
                emailOptOuts
                firstName
                id
                lastName
                organization
                lastActiveProject {
                    allowedPermissions
                    currentUserRole
                    id
                    hasAssessmentTemplate
                    isPrivate
                    title
                    isVisualizationEnabled
                    isVisualizationAvailable
                }
            }
        }
    }
`;

function MyProfile(props: Props) {
    const {
        className,
    } = props;

    const {
        setUser,
    } = useContext(UserContext);

    const alert = useAlert();

    const {
        pristine,
        value,
        setPristine,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, initialValue);

    const error = getErrorObject(riskyError);

    const {
        loading: userGetPending,
    } = useQuery<MeDetailsQuery, MeDetailsQueryVariables>(
        ME_DETAILS,
        {
            onCompleted: (response) => {
                const safeMe = removeNull(response.me);
                if (safeMe) {
                    setValue(safeMe);
                    setUser(safeMe);
                }
            },
        },
    );

    const [
        updateUser,
        {
            loading: userUpdatePending,
        },
    ] = useMutation<UpdateMeMutation, UpdateMeMutationVariables>(
        UPDATE_ME,
        {
            onCompleted: (response) => {
                const { updateMe } = response;
                if (!updateMe) {
                    return;
                }

                const {
                    errors,
                    ok,
                } = updateMe;
                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok) {
                    const safeMe = removeNull(updateMe.result);
                    setUser(safeMe);
                    setPristine(true);
                    alert.show(
                        'Successfully updated your profile!',
                        { variant: 'success' },
                    );
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
                alert.show(
                    'There was an error updating your profile!',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleSubmit = useCallback((finalValue) => {
        updateUser({ variables: { data: finalValue } });
    }, [updateUser]);

    const handleDisplayPictureOptionChange = useCallback((option: Option<string>) => {
        setFieldValue(option.file, 'displayPictureUrl' as const);
    }, [setFieldValue]);

    const disabled = userGetPending || userUpdatePending;

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
                {userGetPending && <PendingMessage />}
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
                        accept="image/*"
                        value={value.displayPicture}
                        onChange={setFieldValue}
                        showStatus={false}
                        onOptionChange={handleDisplayPictureOptionChange}
                        labelClassName={styles.label}
                        actionsContainerClassName={_cs(
                            (pristine || isNotDefined(value.displayPicture))
                                ? styles.noAction : styles.action,
                        )}
                        fileInputClassName={styles.fileInput}
                        inputSectionClassName={styles.inputSection}
                        maxFileSize={1}
                        variant="general"
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
                        <CheckListInput
                            className={styles.emailPreferences}
                            label="Opt-out from notifications"
                            name="emailOptOuts"
                            value={value.emailOptOuts}
                            options={emailOptOutsOptions}
                            keySelector={emailOptOutKeySelector}
                            labelSelector={emailOptOutLabelSelector}
                            direction="vertical"
                            onChange={setFieldValue}
                            disabled={disabled}
                            error={error?.emailOptOuts}
                        />
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
