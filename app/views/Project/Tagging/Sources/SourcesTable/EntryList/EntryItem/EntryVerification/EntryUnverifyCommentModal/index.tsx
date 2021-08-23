import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    requiredStringCondition,
    requiredListCondition,
    ObjectSchema,
    PartialForm,
    getErrorObject,
    createSubmitHandler,
    useForm,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextArea,
    MultiSelectInput,
    Button,
} from '@the-deep/deep-ui';
import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import { Entry } from '#types/newEntry';
import {
    MultiResponse,
    Membership,
} from '#types';

import { EntryVerificationFormData, UNVERIFY } from '../index';
import styles from './styles.css';

const memberFieldQuery = {
    fields: ['member', 'member_name'],
};

export const memberKeySelector = (d: Membership) => d.member;
export const memberNameSelector = (d:Membership) => d.memberName;

type FormType = {
    text?: string;
    mentionedUsers?: number[];
}
type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        text: [requiredStringCondition],
        mentionedUsers: [requiredListCondition],
    }),
};

const defaultFormValue: FormType = {};

export interface Props {
    onModalClose: () => void;
    onSuccess?: (value: Entry) => void;
    entryId: number;
    projectId: number;
    className?: string;
}

function EntryUnverifyCommentModal(props: Props) {
    const {
        className,
        onModalClose,
        onSuccess,
        projectId,
        entryId,
    } = props;

    const {
        pending: reviewRequestPending,
        trigger: triggerReviewRequest,
    } = useLazyRequest<Entry, EntryVerificationFormData>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (onSuccess) {
                onSuccess(response);
            }
            onModalClose();
        },
        failureHeader: 'Entry Verification',
    });

    const handleUnverifyEntry = useCallback((formValues: Omit<EntryVerificationFormData, 'commentType'>) => {
        triggerReviewRequest({ commentType: UNVERIFY, ...formValues });
    }, [triggerReviewRequest]);

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

    return (
        <form
            className={_cs(className, styles.entryCommentForm)}
            onSubmit={createSubmitHandler(validate, setError, handleUnverifyEntry)}
        >
            <NonFieldError
                error={error}
            />
            <Modal
                onCloseButtonClick={onModalClose}
                className={styles.entryCommentModal}
                heading="Unverify Entry"
                footerActions={(
                    <Button
                        disabled={pristine || reviewRequestPending || projectMembersPending}
                        type="submit"
                        variant="primary"
                        name="unverifyEntry"
                    >
                        Submit
                    </Button>
                )}
            >
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
        </form>
    );
}

export default EntryUnverifyCommentModal;
