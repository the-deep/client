import React, { useContext, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextArea,
    Button,
    Container,
    useAlert,
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

interface Props {
    className?: string;
    onSave: () => void;
    entryId: string;
    projectId: string;
    commentAssignee: {
        id: string;
        displayName?: string | null | undefined;
        emailDisplay: string;
    } | null | undefined;
}

function CommentForm(props: Props) {
    const {
        className,
        onSave,
        entryId,
        projectId,
        commentAssignee,
    } = props;

    const defaultValue: FormType = {
        commentType: EntryAction.COMMENT,
        mentionedUsers: commentAssignee ? [commentAssignee.id] : [],
    };

    const [members, setMembers] = useState<ProjectMember[] | undefined | null>(
        () => (commentAssignee ? [commentAssignee] : []),
    );
    const {
        user,
    } = useContext(UserContext);
    const alert = useAlert();

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
    } = useLazyRequest<unknown, FormType>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            // NOTE: We're resetting the form after one is submitted
            setValue(defaultValue);
            onSave();
            alert.show(
                'Successfully added comment to the selected entry.',
                { variant: 'success' },
            );
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
        failureMessage: 'Entry comment edit',
    });

    return (
        <form
            className={_cs(styles.commentForm, className)}
            onSubmit={createSubmitHandler(validate, setError, editComment)}
        >
            <Container
                className={styles.container}
                contentClassName={styles.content}
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
                    label="Assignee"
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
