import React, { useContext, useState } from 'react';
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
    internal,
    createSubmitHandler,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';
import NonFieldError from '#components/NonFieldError';
import { useLazyRequest } from '#base/utils/restRequest';
import { EntryAction } from '#components/entryReview/commentConstants';
import UserContext from '#base/context/UserContext';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import {
    EntryComment,
} from '#types';
import styles from './styles.css';

interface Comment {
    text: string;
    commentType: number,
    mentionedUsers: string[],
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
    commentType: EntryAction.COMMENT,
};

interface Props {
    className?: string;
    onSave: (response: EntryComment) => void;
    entryId: number;
    projectId: string;
}

function CommentForm(props: Props) {
    const {
        className,
        onSave,
        entryId,
        projectId,
    } = props;

    const [members, setMembers] = useState<ProjectMember[] | undefined | null>();
    const {
        user,
    } = useContext(UserContext);

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
        onFailure: ({ value: errorValue }) => {
            const {
                $internal,
                ...otherErrors
            } = errorValue.faramErrors;

            setError({
                ...otherErrors,
                [internal]: $internal,
            });
        },
        failureHeader: 'Entry comment edit',
    });

    return (
        <form
            className={_cs(styles.commentForm, className)}
            onSubmit={createSubmitHandler(validate, setError, editComment)}
        >
            <Container
                className={styles.container}
                footerActions={(
                    <Button
                        name={undefined}
                        type="submit"
                        disabled={pristine || pending}
                    >
                        Comment
                    </Button>
                )}
            >
                <NonFieldError
                    error={error}
                />
                <TextArea
                    name="text"
                    inputSectionClassName={styles.commentArea}
                    rows={5}
                    value={value.text}
                    onChange={setFieldValue}
                    label={user?.displayName}
                    error={error?.text}
                    autoFocus
                />
                <ProjectMemberMultiSelectInput
                    name="mentionedUsers"
                    label="Assignees"
                    value={value.mentionedUsers}
                    projectId={projectId}
                    onChange={setFieldValue}
                    options={members}
                    onOptionsChange={setMembers}
                    error={getErrorString(error?.mentionedUsers)}
                />
            </Container>
        </form>
    );
}

export default CommentForm;
