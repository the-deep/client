import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { gql, useMutation } from '@apollo/client';
import {
    requiredStringCondition,
    requiredListCondition,
    ObjectSchema,
    getErrorObject,
    useForm,
    requiredCondition,
    getErrorString,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextArea,
    Button,
    useAlert,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { EntryAction } from '#components/entryReview/commentConstants';

import {
    CreateReviewCommentMutation,
    CreateReviewCommentMutationVariables,
} from '#generated/types';

import styles from './styles.css';

const CREATE_REVIEW_COMMENT = gql`
mutation CreateReviewComment(
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
            }
            errors
            ok
        }
    }
}
`;

type FormType = {
    commentType: number,
    text?: string;
    mentionedUsers?: string[];
}
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        commentType: [requiredCondition],
        text: [requiredStringCondition],
        mentionedUsers: [requiredListCondition],
    }),
};

const defaultFormValue: FormType = {
    commentType: EntryAction.UNVERIFY,
};

export interface Props {
    onModalClose: () => void;
    entryId: string;
    projectId: string;
    onVerificationChange: (entryId: string) => void;
    className?: string;
}

function EntryUnverifyCommentModal(props: Props) {
    const {
        className,
        onModalClose,
        onVerificationChange,
        projectId,
        entryId,
    } = props;

    const alert = useAlert();

    const [members, setMembers] = useState<ProjectMember[] | undefined | null>();

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValue);

    const [
        createReviewComment,
        { loading: reviewRequestPending },
    ] = useMutation<CreateReviewCommentMutation, CreateReviewCommentMutationVariables>(
        CREATE_REVIEW_COMMENT,
        {
            onCompleted: (response) => {
                if (response?.project?.entryReviewCommentCreate?.ok) {
                    const entryResponse = response.project.entryReviewCommentCreate.result?.entry;
                    if (entryResponse) {
                        onVerificationChange(entryResponse);
                        alert.show(
                            'Successfully posted review comment.',
                            { variant: 'success' },
                        );
                    }
                } else {
                    alert.show(
                        'Failed to post review comment.',
                        {
                            variant: 'error',
                        },
                    );
                }
                onModalClose();
            },
            onError: () => {
                alert.show(
                    'Failed to post review comment.',
                    {
                        variant: 'error',
                    },
                );
                onModalClose();
            },
        },
    );

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            () => {
                createReviewComment({
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
        createReviewComment,
        entryId,
        projectId,
        value.text,
    ]);

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            className={_cs(styles.modal, className)}
            heading="Reason for unverify"
            size="small"
            freeHeight
            bodyClassName={styles.modalBody}
            footerIcons={(
                <ProjectMemberMultiSelectInput
                    name="mentionedUsers"
                    label="Flag to"
                    value={value.mentionedUsers}
                    projectId={projectId}
                    onChange={setFieldValue}
                    options={members}
                    onOptionsChange={setMembers}
                    error={getErrorString(error?.mentionedUsers)}
                />
            )}
            footerActions={(
                <Button
                    disabled={pristine || reviewRequestPending}
                    type="submit"
                    variant="primary"
                    name="unverifyEntry"
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            <NonFieldError error={error} />
            <TextArea
                name="text"
                label="Comment"
                value={value.text}
                onChange={setFieldValue}
                error={error?.text}
                rows={3}
                autoFocus
            />
        </Modal>
    );
}

export default EntryUnverifyCommentModal;
