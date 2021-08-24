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

import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import { EntryReviewComment } from '#types/newEntry';
import {
    MultiResponse,
    Membership,
} from '#types';

import { EntryAction } from '../../constants';
import styles from './styles.css';

const memberFieldQuery = {
    fields: ['member', 'member_name'],
};

export const memberKeySelector = (d: Membership) => d.member;
export const memberNameSelector = (d:Membership) => d.memberName;

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

    const {
        pending: projectMembersPending,
        response: projectMembersResponse,
    } = useRequest<MultiResponse<Membership>>({
        url: `server://v2/projects/${projectId}/project-memberships/`,
        method: 'GET',
        query: memberFieldQuery,
        failureHeader: 'Project Membership',
    });

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
            heading="Unverify Entry"
            bodyClassName={styles.entryCommentForm}
            footerActions={(
                <Button
                    disabled={pristine || reviewRequestPending || projectMembersPending}
                    type="submit"
                    variant="primary"
                    name="unverifyEntry"
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
                options={projectMembersResponse?.results}
                keySelector={memberKeySelector}
                labelSelector={memberNameSelector}
                disabled={projectMembersPending}
            />
        </Modal>
    );
}

export default EntryUnverifyCommentModal;
