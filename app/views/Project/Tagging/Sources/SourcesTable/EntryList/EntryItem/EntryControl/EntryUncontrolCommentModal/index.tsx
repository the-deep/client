import React, { useCallback } from 'react';
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
    MultiSelectInput,
    Button,
} from '@the-deep/deep-ui';
import { useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import { EntryReviewComment } from '#types/newEntry';
import {
    Membership,
} from '#types';

import { EntryAction } from '../../constants';
import styles from './styles.css';

export const memberKeySelector = (d: Membership) => d.member;
export const memberNameSelector = (d:Membership) => d.memberName;

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
    projectMembers?: Membership[];
    className?: string;
    projectMembersPending: boolean;
}

function EntryUncontrolCommentModal(props: Props) {
    const {
        className,
        onModalClose,
        onControlStatusChange,
        projectMembersPending,
        projectMembers,
        entryId,
    } = props;

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
                rows={3}
                autoFocus
            />
            <MultiSelectInput
                className={styles.input}
                name="mentionedUsers"
                label="Assignees"
                value={value.mentionedUsers}
                onChange={setFieldValue}
                options={projectMembers}
                keySelector={memberKeySelector}
                labelSelector={memberNameSelector}
                disabled={projectMembersPending}
            />
        </Modal>
    );
}

export default EntryUncontrolCommentModal;
