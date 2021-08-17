import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    requiredStringCondition,
    requiredListCondition,
    ObjectSchema,
    PartialForm,
    getErrorObject,
    createSubmitHandler,
    useForm,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextArea,
    MultiSelectInput,
    Button,
} from '@the-deep/deep-ui';
import NonFieldError from '#components/NonFieldError';
import useProjectMemberListQuery, {
    memberKeySelector,
    memberNameSelector,
} from '#base/hooks/useProjectMemberListQuery';

import styles from './styles.css';

type FormType = {
    text?: string;
    mentionedUsers?: number[];
}
type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        text: [requiredStringCondition],
        mentionedUsers: [requiredListCondition],
    }),
};

const defaultFormValue: FormType = {};

export interface Props {
    onModalClose: () => void;
    onValidationSuccess: (value: FormType) => void;
    projectId: number;
    className?: string;
}

function EntryUnverifyCommentModal(props: Props) {
    const {
        className,
        onModalClose,
        onValidationSuccess,
        projectId,
    } = props;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const [
        projectMembersPending,
        projectMembersResponse,
    ] = useProjectMemberListQuery(projectId);

    return (
        <form
            className={_cs(className, styles.entryCommentForm)}
            onSubmit={createSubmitHandler(validate, setError, onValidationSuccess)}
        >
            <NonFieldError
                error={error}
            />
            <Modal
                onCloseButtonClick={onModalClose}
                className={styles.entryCommentModal}
                heading="Unverify Entry"
                footerActions={(
                    <Button
                        disabled={pristine}
                        type="submit"
                        variant="primary"
                        name="unverifyEntry"
                    >
                        Submit
                    </Button>
                )}
            >
                <TextArea
                    className={styles.input}
                    name="text"
                    label="Comment"
                    value={value.text}
                    onChange={setFieldValue}
                    rows={3}
                    autoFocus
                />
                <MultiSelectInput
                    className={styles.input}
                    name="mentionedUsers"
                    label="Assignees"
                    value={value.mentionedUsers}
                    onChange={setFieldValue}
                    options={projectMembersResponse?.results}
                    keySelector={memberKeySelector}
                    labelSelector={memberNameSelector}
                    disabled={projectMembersPending}
                />
            </Modal>
        </form>
    );
}

export default EntryUnverifyCommentModal;
