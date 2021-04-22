import React from 'react';

import {
    isDefined,
} from '@togglecorp/fujs';

import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import {
    Modal,
    SelectInput,
    Button,
} from '@the-deep/deep-ui';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    MultiResponse,
    Membership,
} from '#typings';
import { ProjectRole } from '#typings/project';
import _ts from '#ts';
import styles from './styles.scss';

interface Props {
    onModalClose: () => void;
    projectId: number;
    onTableReload: () => void;
    userValue: Membership;
}

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    displayName: string;
    loginAttempts: number;
    email: string;
    organization: string;
    displayPicture?: number;
    language: string;
    emailOptOuts: [];
}

const membersKeySelector = (d: User) => d.id;
const membersLabelSelector = (d: User) => d.displayName;

const roleKeySelector = (d: ProjectRole) => d.id;
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    member: number;
    role: number;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        member: [requiredCondition],
        role: [requiredCondition],
    }),
};

const defaultFormValue: PartialForm<FormType> = {};

function AddUserModal(props: Props) {
    const {
        onModalClose,
        projectId,
        onTableReload,
        userValue,
    } = props;

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(userValue ?? defaultFormValue, schema);

    const [
        ,
        projectRolesResponse,
        ,
        ,
    ] = useRequest<MultiResponse<ProjectRole>>({
        url: 'server://project-roles/',
        method: 'GET',
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectRoleFetchFailed'))({ error: errorBody });
        },
    });

    const [
        ,
        usersListResponse,
    ] = useRequest<MultiResponse<User>>({
        url: 'server://users/',
        method: 'GET',
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'usersFetchFailed'))({ error: errorBody });
        },
    });

    const [
        ,
        ,
        ,
        triggerAddProjectMember,
    ] = useRequest({
        url: isDefined(userValue)
            ? `server://projects/${projectId}/project-memberships/${userValue.id}/`
            : `server://projects/${projectId}/project-memberships/`,
        method: isDefined(userValue)
            ? 'PATCH'
            : 'POST',
        body: value,
        onSuccess: () => {
            onTableReload();
            onModalClose();
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectMembershipPostFailed'))({ error: errorBody });
        },
    });

    const handleSubmit = triggerAddProjectMember;

    return (
        <Modal
            heading="Add Usergroup"
            onClose={onModalClose}
            bodyClassName={styles.modalBody}
        >
            <form
                className={styles.form}
                onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            >
                <p>
                    {error?.$internal}
                </p>
                <div className={styles.inline}>
                    <SelectInput
                        name="member"
                        className={styles.list}
                        options={usersListResponse?.results}
                        keySelector={membersKeySelector}
                        labelSelector={membersLabelSelector}
                        optionsPopupClassName={styles.optionsPopup}
                        onChange={onValueChange}
                        value={value.member}
                        placeholder="Select User"
                        error={error?.fields?.member}
                    />

                    <SelectInput
                        name="role"
                        className={styles.roleList}
                        options={projectRolesResponse?.results}
                        keySelector={roleKeySelector}
                        labelSelector={roleLabelSelector}
                        optionsPopupClassName={styles.optionsPopup}
                        onChange={onValueChange}
                        value={value.role}
                        placeholder="Select Role"
                    />
                </div>
                <footer className={styles.footer}>
                    <Button
                        name="submit"
                        variant="primary"
                        type="submit"
                        disabled={pristine}
                    >
                        {_ts('projectEdit', 'submitLabel')}
                    </Button>
                </footer>
            </form>
        </Modal>
    );
}

export default AddUserModal;
