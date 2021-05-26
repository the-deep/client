import React, { useMemo, useCallback, useState } from 'react';
import {
    isDefined,
} from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
} from '@togglecorp/toggle-form';
import {
    Modal,
    SelectInput,
    Button,
} from '@the-deep/deep-ui';

import UserSelectInput from '#components/input/UserSelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { useRequest, useLazyRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    MultiResponse,
    BasicUser,
    Membership,
} from '#typings';
import { ProjectRole } from '#typings/project';
import _ts from '#ts';

import styles from './styles.scss';

interface Props {
    onModalClose: () => void;
    projectId: number;
    onTableReload: () => void;
    userValue?: Membership;
}

const roleKeySelector = (d: ProjectRole) => d.id;
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    id?: number;
    member?: number;
    role: number;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        if (isDefined(value.id)) {
            return ({
                role: [requiredCondition],
            });
        }
        return ({
            member: [requiredCondition],
            role: [requiredCondition],
        });
    },
};

const defaultFormValue: PartialForm<FormType> = {};

interface ValueToSend {
    role: number;
    member?: number;
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        projectId,
        onTableReload,
        userValue,
    } = props;

    const formValueFromProps: PartialForm<FormType> = userValue ?? defaultFormValue;

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(formValueFromProps, schema);

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
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectRoleFetchFailed'))({ error: errorBody });
        },
    });

    const {
        pending: pendingAddAction,
        trigger: triggerAddProjectMember,
    } = useLazyRequest<unknown, ValueToSend>({
        url: isDefined(userValue)
            ? `server://projects/${projectId}/project-memberships/${userValue.id}/`
            : `server://projects/${projectId}/project-memberships/`,
        method: isDefined(userValue)
            ? 'PATCH'
            : 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            onTableReload();
            onModalClose();
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectMembershipPostFailed'))({ error: errorBody });
        },
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            onErrorSet(err);
            if (!errored && isDefined(val)) {
                triggerAddProjectMember(val as ValueToSend);
            }
        },
        [onErrorSet, validate, triggerAddProjectMember],
    );

    const currentUser = useMemo(() => (userValue ?
        [{ id: userValue.member, displayName: userValue.memberName }] : []
    ), [userValue]);

    const pendingRequests = pendingRoles;

    return (
        <Modal
            className={styles.modal}
            heading={
                isDefined(userValue)
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
                    disabled={pristine || pendingRequests || pendingAddAction}
                    onClick={handleSubmit}
                >
                    {_ts('projectEdit', 'submitLabel')}
                </Button>
            )}
        >
            {pendingAddAction && (<LoadingAnimation />)}
            {error?.$internal && (
                <p>
                    {error?.$internal}
                </p>
            )}
            <UserSelectInput
                className={styles.input}
                queryParams={queryForUsers}
                name="member"
                readOnly={isDefined(userValue)}
                value={value.member}
                onChange={onValueChange}
                options={userOptions ?? currentUser}
                onOptionsChange={setUserOptions}
                error={error?.fields?.member}
                disabled={pendingRequests}
                optionsPopupClassName={styles.optionsPopup}
                label={_ts('projectEdit', 'userLabel')}
                placeholder={_ts('projectEdit', 'selectUserPlaceholder')}
            />
            <SelectInput
                name="role"
                className={styles.input}
                options={projectRolesResponse?.results}
                keySelector={roleKeySelector}
                labelSelector={roleLabelSelector}
                optionsPopupClassName={styles.optionsPopup}
                onChange={onValueChange}
                value={value.role}
                label={_ts('projectEdit', 'roleLabel')}
                placeholder={_ts('projectEdit', 'selectRolePlaceholder')}
                disabled={pendingRequests}
            />
        </Modal>
    );
}

export default AddUserModal;
