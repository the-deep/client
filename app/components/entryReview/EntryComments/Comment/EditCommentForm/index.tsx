import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextArea,
    Button,
    ContainerCard,
    useAlert,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    createSubmitHandler,
    requiredListCondition,
    getErrorString,
    getErrorObject,
} from '@togglecorp/toggle-form';
import NonFieldError from '#components/NonFieldError';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import {
    EntryReviewCommentUpdateMutation,
    EntryReviewCommentUpdateMutationVariables,
    ReviewCommentsQuery,
} from '#generated/types';
import styles from './styles.css';

type CommentItem = NonNullable<NonNullable<NonNullable<NonNullable<ReviewCommentsQuery>['project']>['reviewComments']>['results']>[number];

const EDIT_COMMENT = gql`
mutation EntryReviewCommentUpdate($projectId: ID!, $data: EntryReviewCommentInputType!, $id: ID!) {
    project(id: $projectId) {
        entryReviewCommentUpdate(data: $data, id: $id) {
            ok
            errors
            result {
                id
                commentType
                commentTypeDisplay
                createdAt
                createdBy {
                    id
                    displayName
                    emailDisplay
                }
                entry
                text
                mentionedUsers {
                    id
                    displayName
                    emailDisplay
                }
            }
        }
    }
}
`;

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
    onEditSuccess: (response: CommentItem) => void;
    onEditCancel: () => void;
    comment: CommentItem;
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
        text: comment.text ?? '',
        mentionedUsers: comment.mentionedUsers.map((userId) => userId.id),
    });
    const alert = useAlert();
    const [members, setMembers] = useState<ProjectMember[] | undefined | null>(
        () => comment.mentionedUsers.map((u) => ({
            id: u.id,
            displayName: u.displayName,
            emailDisplay: u.emailDisplay,
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

    const [
        updateComment,
        { loading: editCommentLoading },
    ] = useMutation<EntryReviewCommentUpdateMutation, EntryReviewCommentUpdateMutationVariables>(
        EDIT_COMMENT,
        {
            onCompleted: (response) => {
                const successResponse = response?.project?.entryReviewCommentUpdate;
                if (successResponse?.ok) {
                    if (successResponse?.result) {
                        onEditSuccess(successResponse.result);
                        alert.show(
                            'Successfully edited the comment!',
                            { variant: 'success' },
                        );
                    }
                } else {
                    alert.show(
                        'Failed to edit comment!',
                        { variant: 'error' },
                    );
                }
            },

            onError: () => {
                alert.show(
                    'Failed to edit comment!',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleEditComment = useCallback((finalVal: Partial<Comment>) => {
        updateComment({
            variables: {
                projectId,
                id: comment.id,
                data: {
                    entry: comment.entry,
                    text: finalVal.text,
                    mentionedUsers: finalVal.mentionedUsers,
                },
            },
        });
    }, [
        comment.id,
        comment.entry,
        projectId,
        updateComment,
    ]);

    return (
        <form
            className={_cs(styles.editCommentForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleEditComment)}
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
                            disabled={pristine || editCommentLoading}
                        >
                            Save
                        </Button>
                    </>
                )}
                contentClassName={styles.content}
            >
                <NonFieldError
                    error={error}
                />
                <TextArea
                    name="text"
                    rows={5}
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
