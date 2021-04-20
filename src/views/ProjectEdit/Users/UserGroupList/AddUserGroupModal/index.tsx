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
    UserGroup,
    MultiResponse,
} from '#typings';
import { ProjectRole } from '#typings/project';
import _ts from '#ts';
import styles from './styles.scss';

interface Props {
    onModalClose: () => void;
    projectId: string;
}

const usergroupKeySelector = (d: UserGroup) => d.id;

const usergroupLabelSelector = (d: UserGroup) => d.title;

const roleKeySelector = (d: ProjectRole) => d.id;
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    usergroup: number;
    role: number;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: ():FormSchemaFields => ({
        usergroup: [requiredCondition],
        role: [requiredCondition],
    }),
};

const defaultFormValues: PartialForm<FormType> = {};

function AddUserGroupModal(props: Props) {
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
        usergroupResponse,
    ] = useRequest({
        url: 'server://user-groups',
        method: 'GET',
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'usergroupFetchFailed'))({ error: errorBody });
        },
    });

    const [
        ,
        ,
        ,
        triggerAddUserGroup,
    ] = useRequest({
        url: `server://projects/${projectId}/project-usergroups/`,
        method: 'POST',
        body: value,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectUsergroupPostFailedLabel'))({ error: errorBody });
        },
    });

    const handleSubmit = useCallback(() => {
        triggerAddUserGroup();
    }, [triggerAddUserGroup]);

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
                        name="usergroup"
                        className={styles.usergroupList}
                        options={usergroupResponse?.results}
                        keySelector={usergroupKeySelector}
                        labelSelector={usergroupLabelSelector}
                        optionsPopupClassName={styles.optionsPopup}
                        onChange={onValueChange}
                        value={value.usergroup}
                        error={error?.fields?.usergroup}
                        placeholder="Select usergroup"
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
                        error={error?.fields?.role}
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

export default AddUserGroupModal;
