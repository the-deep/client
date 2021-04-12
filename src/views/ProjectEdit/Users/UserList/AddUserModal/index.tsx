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
    Membership,
    MultiResponse,
} from '#typings';
import { ProjectRole } from '#typings/project';
import _ts from '#ts';
import styles from './styles.scss';

interface Props {
    onModalClose: () => void;
    usersList: Membership[];
}

const membersKeySelector = (d: Membership) => d.id;
const membersLabelSelector = (d: Membership) => d.memberName;

const roleKeySelector = (d: ProjectRole) => d.id;
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    title: number;
    role: number;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredCondition],
        role: [requiredCondition],
    }),
};

const defaultFormValues: PartialForm<FormType> = {};

function AddUserModal(props: Props) {
    const {
        onModalClose,
        usersList,
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
        onSuccess: () => console.warn(projectRolesResponse),
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectRoleFetchFailed'))({ error: errorBody });
        },
    });

    const handleSubmit = useCallback((finalValues: PartialForm<FormType>) => {
        console.warn('final values', finalValues);
    }, []);

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
                        name="title"
                        className={styles.list}
                        options={usersList}
                        keySelector={membersKeySelector}
                        labelSelector={membersLabelSelector}
                        optionsPopupClassName={styles.optionsPopup}
                        onChange={onValueChange}
                        value={value.title}
                        placeholder="Select User"
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
