import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextArea,
    Button,
    ContainerCard,
    useAlert,
} from '@the-deep/deep-ui';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    createSubmitHandler,
    internal,
    requiredListCondition,
    getErrorString,
    getErrorObject,
} from '@togglecorp/toggle-form';
import NonFieldError from '#components/NonFieldError';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { useLazyRequest } from '#base/utils/restRequest';
import { EntryComment } from '#types';
import styles from './styles.css';

interface Comment {
    text: string;
    mentionedUsers: string[],
}

type FormType = Partial<Comment>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        text: [requiredStringCondition],
        mentionedUsers: [requiredListCondition],
    }),
};

interface Props {
    className?: string;
    onEditSuccess: (response: EntryComment) => void;
    onEditCancel: () => void;
    comment: EntryComment;
    projectId: string;
}

function EditCommentForm(props: Props) {
    const {
        className,
        comment,
        onEditSuccess,
        onEditCancel,
        projectId,
    } = props;

    const [initialFormValue] = useState<FormType>({
        text: comment.textHistory[0]?.text ?? '',
        mentionedUsers: comment.mentionedUsers.map(String),
    });
    const alert = useAlert();
    const [members, setMembers] = useState<ProjectMember[] | undefined | null>(
        () => comment.mentionedUsersDetails.map((u) => ({
            id: String(u.id),
            displayName: u.name,
        })),
    );

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, initialFormValue);

    const error = getErrorObject(riskyError);

    const {
        pending,
        trigger: editComment,
    } = useLazyRequest<EntryComment, FormType>({
        url: `server://v2/entries/${comment.entry}/review-comments/${comment.id}/`,
        method: 'PATCH',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onEditSuccess(response);
            alert.show(
                'Successfully edited comment.',
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
        failureMessage: 'Failed to edit comment.',
    });

    return (
        <form
            className={_cs(styles.editCommentForm, className)}
            onSubmit={createSubmitHandler(validate, setError, editComment)}
        >
            <ContainerCard
                className={styles.container}
                footerActions={(
                    <>
                        <Button
                            name={undefined}
                            onClick={onEditCancel}
                            variant="tertiary"
                        >
                            Cancel
                        </Button>
                        <Button
                            name={undefined}
                            type="submit"
                            disabled={pristine || pending}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <NonFieldError
                    error={error}
                />
                <TextArea
                    name="text"
                    rows={3}
                    value={value.text}
                    onChange={setFieldValue}
                    error={error?.text}
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
            </ContainerCard>
        </form>
    );
}

export default EditCommentForm;
