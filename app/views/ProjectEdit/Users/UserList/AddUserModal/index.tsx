import React, { useMemo, useCallback, useState } from 'react';
import { isDefined } from '@togglecorp/fujs';
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
    SelectInput,
    useAlert,
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
import UserSelectInput from '#components/selections/UserSelectInput';
import { useRequest } from '#base/utils/restRequest';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import {
    MultiResponse,
    BasicUser,
} from '#types';

import {
    ProjectMembershipBulkUpdateMutation,
    ProjectMembershipBulkUpdateMutationVariables,
    UserBadgeOptionsQuery,
    UserBadgeOptionsQueryVariables,
} from '#generated/types';
import { ProjectRole } from '#types/project';
import { EnumFix } from '#utils/types';
import _ts from '#ts';
import { ProjectUser } from '../index';
import styles from './styles.css';

const roleKeySelector = (d: ProjectRole) => d.id.toString();
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = NonNullable<EnumFix<ProjectMembershipBulkUpdateMutationVariables['items'], 'badges'>>[number];

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

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
    mutation ProjectMembershipBulkUpdate($projectId:ID!, $items: [BulkProjectMembershipInputType!]) {
        project(id: $projectId) {
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

const defaultFormValue: PartialForm<FormType> = {};

interface Props {
    onModalClose: () => void;
    projectId: string;
    onProjectUserChange: () => void;
    projectUserToEdit?: ProjectUser;
    activeUserRoleLevel?: number;
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        projectId,
        onProjectUserChange,
        projectUserToEdit,
        activeUserRoleLevel,
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

    const queryForUsers = useMemo(() => ({
        members_exclude_project: projectId,
    }), [projectId]);

    const [
        userOptions,
        setUserOptions,
    ] = useState<BasicUser[] | undefined | null>();

    const {
        pending: pendingRoles,
        response: projectRolesResponse,
    } = useRequest<MultiResponse<ProjectRole>>({
        url: 'server://project-roles/',
        method: 'GET',
        failureHeader: _ts('projectEdit', 'projectRoleFetchFailed'),
    });

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
                if (errors && errors[0]) {
                    const formError = transformToFormError(removeNull(err) as ObjectError[]);
                    setError(formError);
                } else {
                    alert.show(
                        projectUserToEdit
                            ? `Successfully updated ${user?.member.displayName}`
                            : `Successfully added ${user?.member.displayName}`,
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
                    gqlError.message,
                    { variant: 'error' },
                );
            },
        },
    );

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

    const currentUser = useMemo(() => (projectUserToEdit
        ? [
            {
                id: +projectUserToEdit.member.id,
                displayName: projectUserToEdit.member?.displayName
                    ?? `${projectUserToEdit.member.firstName} ${projectUserToEdit.member.lastName}`,
            },
        ]
        : []
    ), [projectUserToEdit]);

    const roles = isDefined(activeUserRoleLevel)
        ? projectRolesResponse?.results.filter(
            (role) => role.level >= activeUserRoleLevel,
        )
        : undefined;

    return (
        <Modal
            className={styles.modal}
            heading={
                isDefined(projectUserToEdit)
                    ? _ts('projectEdit', 'editUserHeading')
                    : _ts('projectEdit', 'addUserHeading')
            }
            onCloseButtonClick={onModalClose}
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
            <UserSelectInput
                queryParams={queryForUsers}
                name="member"
                readOnly={isDefined(projectUserToEdit)}
                value={value.member}
                onChange={setFieldValue}
                options={userOptions ?? currentUser}
                onOptionsChange={setUserOptions}
                error={error?.member}
                label={_ts('projectEdit', 'userLabel')}
                placeholder={_ts('projectEdit', 'selectUserPlaceholder')}
            />
            <SelectInput
                name="role"
                options={roles}
                keySelector={roleKeySelector}
                labelSelector={roleLabelSelector}
                onChange={setFieldValue}
                value={value.role}
                error={error?.role}
                label={_ts('projectEdit', 'roleLabel')}
                placeholder={_ts('projectEdit', 'selectRolePlaceholder')}
                disabled={pendingRoles}
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
        </Modal>
    );
}

export default AddUserModal;
