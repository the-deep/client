import React, { useCallback, useMemo, useState } from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { useMutation, gql, useQuery } from '@apollo/client';
import {
    ObjectSchema,
    PartialForm,
    defaultUndefinedType,
    requiredCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Modal,
    Button,
    PendingMessage,
    useAlert,
    SelectInput,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import NonFieldError from '#components/NonFieldError';
import {
    ProjectRolesOptionsQuery,
    ProjectRolesOptionsQueryVariables,
    ProjectRoleTypeEnum,
    ProjectUsergroupMembershipBulkMutation,
    ProjectUsergroupMembershipBulkMutationVariables,
} from '#generated/types';
import NewUsergroupSelectInput, { Usergroup } from '#components/selections/UserGroupSelectInput';
import { EnumFix } from '#utils/types';

import { ProjectUsergroup } from '../index';
import styles from './styles.css';

const PROJECT_USERGROUP_MEMBERSHIP_BULK = gql`
    mutation ProjectUsergroupMembershipBulk(
        $projectId: ID!,
        $items: [BulkProjectUserGroupMembershipInputType!],
    ) {
        project(id: $projectId) {
            id
            projectUserGroupMembershipBulk(items: $items) {
                errors
                result {
                    id
                    role {
                        id
                        title
                        level
                    }
                    usergroup {
                        id
                        title
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

type FormType = NonNullable<EnumFix<ProjectUsergroupMembershipBulkMutationVariables['items'], 'badges'>>[number];

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ProjectRoleType = NonNullable<NonNullable<ProjectRolesOptionsQuery>['projectRoles']>[number];

const roleKeySelector = (d: ProjectRoleType) => d.id;
const roleLabelSelector = (d: ProjectRoleType) => d.title;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        id: [defaultUndefinedType],
        role: [requiredCondition],
        usergroup: [requiredCondition],
    }),
};

const defaultFormValue: PartialForm<FormType> = {};

interface Props {
    onModalClose: () => void;
    projectId: string;
    onTableReload: () => void;
    projectUsergroupToEdit: ProjectUsergroup | undefined;
    activeUserRole?: ProjectRoleTypeEnum;
}

function AddUserGroupModal(props: Props) {
    const {
        onModalClose,
        projectId,
        onTableReload,
        projectUsergroupToEdit,
        activeUserRole,
    } = props;

    const formValueFromProps: PartialForm<FormType> = projectUsergroupToEdit ? {
        id: projectUsergroupToEdit.id,
        role: projectUsergroupToEdit.role.id,
        usergroup: projectUsergroupToEdit.usergroup.id,
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
        bulkEditProjectUsergroup,
        { loading: bulkEditProjectUsergroupPending },
    ] = useMutation<
        ProjectUsergroupMembershipBulkMutation,
        ProjectUsergroupMembershipBulkMutationVariables
    >(
        PROJECT_USERGROUP_MEMBERSHIP_BULK,
        {
            onCompleted: (response) => {
                if (!response?.project?.projectUserGroupMembershipBulk) {
                    return;
                }
                const {
                    errors,
                    result,
                } = response.project.projectUserGroupMembershipBulk;

                const [err] = errors ?? [];
                const [res] = result ?? [];

                if (err) {
                    alert.show(
                        projectUsergroupToEdit
                            ? 'Failed to update usergroup'
                            : 'Failed to add usergroup',
                        { variant: 'error' },
                    );
                } else if (res) {
                    alert.show(
                        projectUsergroupToEdit
                            ? `Successfully updated ${res.usergroup.title}`
                            : `Successfully added ${res.usergroup.title}`,
                        { variant: 'success' },
                    );
                    onTableReload();
                    onModalClose();
                }
            },
            onError: () => {
                alert.show(
                    projectUsergroupToEdit
                        ? 'Failed to update usergroup'
                        : 'Failed to add usergroup',
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
                (val) => bulkEditProjectUsergroup({
                    variables: {
                        projectId,
                        items: [val as NonNullable<ProjectUsergroupMembershipBulkMutationVariables['items']>[number]],
                    },
                }),
            );
            submit();
        },
        [
            projectId,
            setError,
            validate,
            bulkEditProjectUsergroup,
        ],
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

    const [
        usergroupOptions,
        setUsergroupOptions,
    ] = useState<Usergroup[] | undefined | null>(() => (
        projectUsergroupToEdit
            ? [{
                id: projectUsergroupToEdit.usergroup?.id,
                title: projectUsergroupToEdit.usergroup?.title,
            }]
            : undefined
    ));

    return (
        <Modal
            className={styles.modal}
            freeHeight
            size="small"
            heading={
                isDefined(projectUsergroupToEdit)
                    ? _ts('projectEdit', 'editUsergroupHeading')
                    : _ts('projectEdit', 'addUsergroupHeading')
            }
            onCloseButtonClick={onModalClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="submit"
                    variant="primary"
                    type="submit"
                    disabled={pristine || bulkEditProjectUsergroupPending}
                    onClick={handleSubmit}
                >
                    {_ts('projectEdit', 'submitLabel')}
                </Button>
            )}
        >
            {bulkEditProjectUsergroupPending && (<PendingMessage />)}
            <NonFieldError error={error} />
            <div className={styles.inputs}>
                <NewUsergroupSelectInput
                    name="usergroup"
                    options={usergroupOptions}
                    onOptionsChange={setUsergroupOptions}
                    onChange={setFieldValue}
                    value={value.usergroup}
                    error={error?.usergroup}
                    label={_ts('projectEdit', 'usergroupLabel')}
                    placeholder={_ts('projectEdit', 'selectUsergroupPlaceholder')}
                    readOnly={isDefined(projectUsergroupToEdit)}
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
                />
            </div>
        </Modal>
    );
}

export default AddUserGroupModal;
