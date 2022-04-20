import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    requiredStringCondition,
    requiredListCondition,
    ObjectSchema,
    getErrorObject,
    useForm,
    requiredCondition,
    internal,
    getErrorString,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextArea,
    Button,
    useAlert,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { EntryReviewComment } from '#types/entry';

import { EntryAction } from '#components/entryReview/commentConstants';
import styles from './styles.css';

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
    commentType: EntryAction.UNCONTROL,
};

export interface Props {
    onModalClose: () => void;
    entryId: string;
    onControlStatusChange: (entryId: string) => void;
    className?: string;
    projectId: string;
}

function EntryUncontrolCommentModal(props: Props) {
    const {
        className,
        onModalClose,
        onControlStatusChange,
        entryId,
        projectId,
    } = props;

    const [members, setMembers] = useState<ProjectMember[] | undefined | null>();
    const alert = useAlert();

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValue);

    const {
        pending: reviewRequestPending,
        trigger: triggerReviewRequest,
    } = useLazyRequest<EntryReviewComment, FormType>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onControlStatusChange(response.entry);
            onModalClose();
            alert.show(
                'Successfully posted comment.',
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
        failureMessage: 'Failed to post comment.',
    });

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            triggerReviewRequest,
        );
        submit();
    }, [setError, validate, triggerReviewRequest]);

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            className={_cs(styles.modal, className)}
            size="small"
            heading="Reason to uncontrol entry"
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
                    name="uncontrolEntry"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            )}
            freeHeight
            movable
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

export default EntryUncontrolCommentModal;
