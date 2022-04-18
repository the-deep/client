import React, { useCallback, useMemo, useState } from 'react';
import {
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
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
    SelectInput,
    Button,
    PendingMessage,
    useAlert,
} from '@the-deep/deep-ui';

import { useRequest } from '#base/utils/restRequest';
import {
    MultiResponse,
} from '#types';
import { ProjectRole } from '#types/project';
import _ts from '#ts';
import NonFieldError from '#components/NonFieldError';
import {
    ProjectRoleTypeEnum,
    ProjectUsergroupMembershipBulkMutation,
    ProjectUsergroupMembershipBulkMutationVariables,
} from '#generated/types';
import NewUsergroupSelectInput, { Usergroup } from '#components/selections/UserGroupSelectInput';

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

const roleKeySelector = (d: ProjectRole) => d.id.toString();
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    id?: string;
    usergroup?: string;
    role: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => {
        const base = ({
            id: [defaultUndefinedType],
            role: [requiredCondition],
            usergroup: [requiredCondition],
        });
        return base;
    },
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

    const {
        pending: pendingRoles,
        response: projectRolesResponse,
    } = useRequest<MultiResponse<ProjectRole>>({
        url: 'server://project-roles/',
        method: 'GET',
    });

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

    const roles = useMemo(() => {
        if (isNotDefined(activeUserRole)) {
            return undefined;
        }
        const currentUserRoleLevel = projectRolesResponse?.results?.find(
            (role) => (
                // FIXME: Update this after complete on server side
                role.type.toUpperCase() === activeUserRole
            ),
        )?.level;
        if (!currentUserRoleLevel) {
            return undefined;
        }
        return projectRolesResponse?.results.filter(
            (role) => role.level >= currentUserRoleLevel,
        );
    }, [
        activeUserRole,
        projectRolesResponse,
    ]);

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
                    disabled={pristine || pendingRoles || bulkEditProjectUsergroupPending}
                    onClick={handleSubmit}
                >
                    {_ts('projectEdit', 'submitLabel')}
                </Button>
            )}
        >
            {bulkEditProjectUsergroupPending && (<PendingMessage />)}
            <NonFieldError error={error} />
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
                options={roles}
                keySelector={roleKeySelector}
                labelSelector={roleLabelSelector}
                onChange={setFieldValue}
                value={value.role}
                error={error?.role}
                label={_ts('projectEdit', 'roleLabel')}
                placeholder={_ts('projectEdit', 'selectRolePlaceholder')}
            />
        </Modal>
    );
}

export default AddUserGroupModal;
