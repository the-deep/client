import React, { useState, useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    requiredStringCondition,
    requiredListCondition,
    ObjectSchema,
    getErrorObject,
    useForm,
    requiredCondition,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextArea,
    Button,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import ProjectMembersMultiSelectInput from '#components/ProjectMembersSelectInput';
import { EntryReviewComment } from '#types/newEntry';
import {
    Membership,
} from '#types';

import { EntryAction } from '../../constants';
import styles from './styles.css';

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
    commentType: EntryAction.UNCONTROL,
};

export interface Props {
    onModalClose: () => void;
    entryId: number;
    onControlStatusChange: (entryId: number) => void;
    className?: string;
    projectId: number;
}

function EntryUncontrolCommentModal(props: Props) {
    const {
        className,
        onModalClose,
        onControlStatusChange,
        entryId,
        projectId,
    } = props;

    const [members, setMembers] = useState<Membership[] | undefined | null>();

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
        },
        failureHeader: 'Entry Control',
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
            className={_cs(styles.entryCommentModal, className)}
            heading="Uncontrol Entry"
            bodyClassName={styles.entryCommentForm}
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
        >
            <NonFieldError
                error={error}
            />
            <TextArea
                className={styles.input}
                name="text"
                label="Comment"
                value={value.text}
                onChange={setFieldValue}
                error={error?.text}
                rows={3}
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
        </Modal>
    );
}

export default EntryUncontrolCommentModal;
