import React, { useMemo, useCallback, useState } from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    defaultUndefinedType,
    getErrorObject,
    getErrorString,
    internal,
    PartialForm,
    removeNull,
    requiredCondition,
    useForm,
    ObjectSchema,
} from '@togglecorp/toggle-form';
import {
    Button,
    Modal,
    MultiSelectInput,
    PendingMessage,
    useAlert,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    useMutation,
    useQuery,
    gql,
} from '@apollo/client';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import NonFieldError from '#components/NonFieldError';
import NewUserSelectInput, { User } from '#components/selections/NewUserSelectInput';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import {
    ProjectMembershipBulkUpdateMutation,
    ProjectMembershipBulkUpdateMutationVariables,
    ProjectRolesOptionsQuery,
    ProjectRolesOptionsQueryVariables,
    ProjectRoleTypeEnum,
    UserBadgeOptionsQuery,
    UserBadgeOptionsQueryVariables,
} from '#generated/types';
import { EnumFix } from '#utils/types';
import _ts from '#ts';

import { ProjectUser } from '../index';
import styles from './styles.css';

type FormType = NonNullable<EnumFix<ProjectMembershipBulkUpdateMutationVariables['items'], 'badges'>>[number];

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

type ProjectRoleType = NonNullable<NonNullable<ProjectRolesOptionsQuery>['projectRoles']>[number];

const roleKeySelector = (d: ProjectRoleType) => d.id;
const roleLabelSelector = (d: ProjectRoleType) => d.title;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        id: [defaultUndefinedType],
        member: [requiredCondition],
        role: [requiredCondition],
        badges: [defaultUndefinedType],
    }),
};

const USER_BADGE_OPTIONS = gql`
    query UserBadgeOptions {
        userBadgeOptions: __type(name: "ProjectMembershipBadgeTypeEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

const PROJECT_MEMBERSHIP_BULK = gql`
    mutation ProjectMembershipBulkUpdate(
        $projectId:ID!,
        $items: [BulkProjectMembershipInputType!]
        ) {
        project(id: $projectId) {
            id
            projectUserMembershipBulk(items: $items) {
                errors
                result {
                    id
                    member  {
                        id
                        displayName
                    }
                }
            }
        }
    }
`;

const PROJECT_ROLES_OPTIONS = gql`
    query ProjectRolesOptions {
        projectRoles {
            id
            level
            title
            type
        }
    }
`;

const defaultFormValue: PartialForm<FormType> = {};

interface Props {
    onModalClose: () => void;
    projectId: string;
    onProjectUserChange: () => void;
    projectUserToEdit?: ProjectUser;
    activeUserId?: string;
    activeUserRole?: ProjectRoleTypeEnum;
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        projectId,
        onProjectUserChange,
        projectUserToEdit,
        activeUserId,
        activeUserRole,
    } = props;

    const formValueFromProps: PartialForm<FormType> = projectUserToEdit ? {
        badges: projectUserToEdit.badges as string[],
        id: projectUserToEdit.id,
        role: projectUserToEdit.role.id,
        member: projectUserToEdit.member.id,
    } : defaultFormValue;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, formValueFromProps);

    const error = getErrorObject(riskyError);
    const alert = useAlert();

    const [
        userOptions,
        setUserOptions,
    ] = useState<User[] | undefined | null>();

    const {
        loading: badgeOptionsPending,
        data: badgeOptionsResponse,
    } = useQuery<UserBadgeOptionsQuery, UserBadgeOptionsQueryVariables>(
        USER_BADGE_OPTIONS,
    );

    const [
        bulkEditProjectMembership,
        { loading: bulkEditProjectMembershipPending },
    ] = useMutation<
        ProjectMembershipBulkUpdateMutation,
        ProjectMembershipBulkUpdateMutationVariables
    >(
        PROJECT_MEMBERSHIP_BULK,
        {
            onCompleted: (response) => {
                if (!response?.project?.projectUserMembershipBulk) {
                    return;
                }
                const {
                    errors,
                    result,
                } = response.project.projectUserMembershipBulk;

                const [err] = errors ?? [];
                const [user] = result ?? [];
                if (err) {
                    const formError = transformToFormError(removeNull(err) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        projectUserToEdit
                            ? 'Failed to update member.'
                            : 'Failed to add member.',
                        { variant: 'error' },
                    );
                } else if (user) {
                    alert.show(
                        projectUserToEdit
                            ? `Successfully updated ${user.member.displayName}.`
                            : `Successfully added ${user.member.displayName}.`,
                        { variant: 'success' },
                    );
                    onProjectUserChange();
                    onModalClose();
                }
            },
            onError: (gqlError) => {
                setError({
                    [internal]: gqlError.message,
                });
                alert.show(
                    projectUserToEdit
                        ? 'Failed to update member.'
                        : 'Failed to add member.',
                    { variant: 'error' },
                );
            },
        },
    );

    const {
        loading: projectRolesOptionsPending,
        data: projectRolesOptionsResponse,
    } = useQuery<ProjectRolesOptionsQuery, ProjectRolesOptionsQueryVariables>(
        PROJECT_ROLES_OPTIONS,
    );

    const roles = useMemo(() => {
        if (isNotDefined(activeUserRole)) {
            return undefined;
        }
        const currentUserRoleLevel = projectRolesOptionsResponse?.projectRoles?.find(
            (role) => (
                role.type === activeUserRole
            ),
        )?.level;
        if (!currentUserRoleLevel) {
            return undefined;
        }
        return projectRolesOptionsResponse?.projectRoles?.filter(
            (role) => role.level >= currentUserRoleLevel,
        );
    }, [
        activeUserRole,
        projectRolesOptionsResponse,
    ]);

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => bulkEditProjectMembership({
                    variables: {
                        projectId,
                        items: [val as NonNullable<ProjectMembershipBulkUpdateMutationVariables['items']>[number]],
                    },
                }),
            );
            submit();
        },
        [
            projectId,
            setError,
            validate,
            bulkEditProjectMembership,
        ],
    );

    const currentUser = useMemo(() => (
        projectUserToEdit?.member ? [projectUserToEdit?.member] : []
    ), [projectUserToEdit?.member]);

    return (
        <Modal
            className={styles.modal}
            heading={
                isDefined(projectUserToEdit)
                    ? _ts('projectEdit', 'editUserHeading')
                    : _ts('projectEdit', 'addUserHeading')
            }
            onCloseButtonClick={onModalClose}
            freeHeight
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="submit"
                    variant="primary"
                    type="submit"
                    disabled={pristine || bulkEditProjectMembershipPending}
                    onClick={handleSubmit}
                >
                    {_ts('projectEdit', 'submitLabel')}
                </Button>
            )}
        >
            {bulkEditProjectMembershipPending && (<PendingMessage />)}
            <NonFieldError error={error} />
            <div className={styles.inputs}>
                <NewUserSelectInput
                    name="member"
                    readOnly={isDefined(projectUserToEdit)}
                    value={value.member}
                    onChange={setFieldValue}
                    options={userOptions ?? currentUser}
                    onOptionsChange={setUserOptions}
                    error={error?.member}
                    label={_ts('projectEdit', 'userLabel')}
                    placeholder={_ts('projectEdit', 'selectUserPlaceholder')}
                    membersExcludeProject={projectId}
                />
                <SelectInput
                    name="role"
                    value={value.role}
                    error={error?.role}
                    options={roles}
                    onChange={setFieldValue}
                    keySelector={roleKeySelector}
                    labelSelector={roleLabelSelector}
                    label={_ts('projectEdit', 'roleLabel')}
                    placeholder={_ts('projectEdit', 'selectRolePlaceholder')}
                    disabled={projectRolesOptionsPending}
                    readOnly={(
                        isDefined(projectUserToEdit?.member?.id)
                        && projectUserToEdit?.member.id === activeUserId
                    )}
                />
                <MultiSelectInput
                    name="badges"
                    onChange={setFieldValue}
                    options={badgeOptionsResponse?.userBadgeOptions?.enumValues}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.badges}
                    error={getErrorString(error?.badges)}
                    label="Badges"
                    placeholder="Badges"
                    disabled={badgeOptionsPending}
                />
            </div>
        </Modal>
    );
}

export default AddUserModal;
