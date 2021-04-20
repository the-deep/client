import React, { useCallback } from 'react';

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
} from '#typings';
import { ProjectRole } from '#typings/project';
import _ts from '#ts';
import styles from './styles.scss';

interface Props {
    onModalClose: () => void;
    projectId: number;
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

const defaultFormValues: PartialForm<FormType> = {};

function AddUserModal(props: Props) {
    const {
        onModalClose,
        projectId,
    } = props;

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(defaultFormValues, schema);

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
    ] = useRequest({
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
        url: `server://projects/${projectId}/project-memberships/`,
        method: 'POST',
        body: value,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectMembershipPostFailed'))({ error: errorBody });
        },
    });

    const handleSubmit = useCallback(() => {
        triggerAddProjectMember();
    }, [triggerAddProjectMember]);

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
