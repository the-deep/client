import React, { useContext, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextArea,
    Button,
    Container,
    useAlert,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    requiredCondition,
    internal,
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    removeNull,
} from '@togglecorp/toggle-form';
import NonFieldError from '#components/NonFieldError';
import UserContext from '#base/context/UserContext';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import {
    CreateCommentMutation,
    CreateCommentMutationVariables,
} from '#generated/types';

import styles from './styles.css';

const CREATE_REVIEW_COMMENT = gql`
mutation CreateComment(
    $projectId: ID!,
    $data: EntryReviewCommentInputType!,
) {
    project(id: $projectId) {
        id
        entryReviewCommentCreate(data: $data) {
            result {
                id
                entry
                text
                commentType
                createdBy {
                  id
                  displayName
                }
                mentionedUsers {
                  id
                  displayName
                }
            }
            errors
            ok
        }
    }
}
`;

type CommentItem = NonNullable<NonNullable<NonNullable<NonNullable<CreateCommentMutation>['project']>['entryReviewCommentCreate']>['result']>;

type FormType = Partial<CommentItem>;
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
    onSave: (response: CommentItem | null | undefined) => void;
    entryId: string;
    projectId: string;
    commentAssignee: {
        id: string;
        displayName?: string | null | undefined;
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
        commentType: 'VERIFY',
        mentionedUsers: commentAssignee ? [commentAssignee] : [],
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

    const [
        createComment,
        { loading: editReviewCommentPending },
    ] = useMutation<CreateCommentMutation, CreateCommentMutationVariables>(
        CREATE_REVIEW_COMMENT,
        {
            onCompleted: (response) => {
                const successResponse = response?.project?.entryReviewCommentCreate;
                setValue(defaultValue);
                if (successResponse?.ok) {
                    if (successResponse?.result) {
                        onSave(successResponse.result);
                        alert.show(
                            'Successfully added comment to the selected entry!',
                            { variant: 'success' },
                        );
                    }
                } else {
                    // eslint-disable-next-line  max-len
                    const formError = transformToFormError(removeNull(successResponse?.errors) as ObjectError[]);
                    if (formError?.project) {
                        setError({
                            ...formError,
                            [internal]: formError?.project as string,
                        });
                    } else {
                        setError(formError);
                    }
                    alert.show(
                        'Failed to post review comment.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: (gqlError) => {
                setError({
                    [internal]: gqlError.message,
                });
                alert.show(
                    'Failed to post review comment.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );
    /*
     const {
         pending,
         trigger: editComment,
     } = useLazyRequest<CommentItem, FormType>({
         url: `server://v2/entries/${entryId}/review-comments/`,
         method: 'POST',
         body: (ctx) => ctx,
         onSuccess: (response) => {
             setValue(defaultValue);
             onSave(response);
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
     */

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            () => {
                createComment({
                    variables: {
                        projectId,
                        data: {
                            entry: entryId,
                            text: value.text,
                        },
                    },
                });
            },
        );
        submit();
    }, [
        setError,
        validate,
        createComment,
        entryId,
        projectId,
        value.text,
    ]);

    return (
        <form
            className={_cs(styles.commentForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                className={styles.container}
                footerActions={(
                    <Button
                        name={undefined}
                        type="submit"
                        disabled={pristine || editReviewCommentPending}
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
