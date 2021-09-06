import React, { useState, useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    requiredStringCondition,
    requiredListCondition,
    ObjectSchema,
    getErrorObject,
    useForm,
    requiredCondition,
    getErrorString,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextArea,
    Button,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import { EntryReviewComment } from '#types/newEntry';
import ProjectMembersMultiSelectInput from '#components/selections/ProjectMembersSelectInput';
import { Membership } from '#types';
import { EntryAction } from '#components/entryReview/commentConstants';

import styles from './styles.css';

interface EntryVerificationFormData {
    commentType: number;
    text?: string;
    mentionedUsers?: number[];
}

type FormType = {
    commentType: number,
    text?: string;
    mentionedUsers?: number[];
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
    entryId: number;
    projectId: number;
    onVerificationChange: (entryId: number) => void;
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

    const [members, setMembers] = useState<Membership[] | undefined | null>();

    const {
        pending: reviewRequestPending,
        trigger: triggerReviewRequest,
    } = useLazyRequest<EntryReviewComment, EntryVerificationFormData>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onVerificationChange(response.entry);
            onModalClose();
        },
        failureHeader: 'Entry Verification',
    });

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            triggerReviewRequest(val);
        }
    }, [setError, validate, triggerReviewRequest]);

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            className={_cs(styles.modal, className)}
            heading="Reason for unverify"
            bodyClassName={styles.modalBody}
            footerIcons={(
                <ProjectMembersMultiSelectInput
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
