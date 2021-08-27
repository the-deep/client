import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextArea,
    Button,
    Container,
} from '@the-deep/deep-ui';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    requiredCondition,
    createSubmitHandler,
    getErrorObject,
} from '@togglecorp/toggle-form';
import NonFieldError from '#components/NonFieldError';
import { useLazyRequest } from '#base/utils/restRequest';
import ProjectMembersMultiSelectInput from '#components/ProjectMembersSelectInput';
import {
    EntryComment,
    Membership,
} from '#types';
import styles from './styles.css';

interface Comment {
    text: string;
    commentType: number,
    mentionedUsers: number[],
}

type FormType = Partial<Comment>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        text: [requiredStringCondition],
        commentType: [requiredCondition],
        mentionedUsers: [requiredCondition],
    }),
};

const defaultValue: FormType = {
    commentType: 0,
};

interface Props {
    className?: string;
    onSave: (response: EntryComment) => void;
    entryId: number;
    projectId: number;
}

function CommentForm(props: Props) {
    const {
        className,
        onSave,
        entryId,
        projectId,
    } = props;

    const [members, setMembers] = useState<Membership[] | undefined | null>();

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        setValue,
        validate,
        setError,
    } = useForm(schema, defaultValue);

    const error = getErrorObject(riskyError);

    const {
        pending,
        trigger: editComment,
    } = useLazyRequest<EntryComment, FormType>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            setValue(defaultValue);
            onSave(response);
        },
        failureHeader: 'Entry comment edit',
    });

    return (
        <form
            className={_cs(styles.commentForm, className)}
            onSubmit={createSubmitHandler(validate, setError, editComment)}
        >
            <NonFieldError
                error={error}
            />
            <Container
                className={styles.container}
                footerActions={(
                    <>
                        <Button
                            name={undefined}
                            type="submit"
                            disabled={pristine || pending}
                        >
                            Comment
                        </Button>
                    </>
                )}
            >
                <TextArea
                    name="text"
                    rows={3}
                    value={value.text}
                    onChange={setFieldValue}
                    error={error?.text}
                    autoFocus
                />
                <ProjectMembersMultiSelectInput
                    name="mentionedUsers"
                    label="Assignees"
                    value={value.mentionedUsers}
                    projectId={projectId}
                    onChange={setFieldValue}
                    options={members}
                    onOptionsChange={setMembers}
                    error={error?.mentionedUsers?.toString()}
                />
            </Container>
        </form>
    );
}

export default CommentForm;
