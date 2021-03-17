import React from 'react';
import Faram, {
    requiredCondition,
    ObjectSchema,
} from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import TextArea from '#rsci/TextArea';
import MultiSelectInput from '#rsci/MultiSelectInput';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import useProjectMemberListQuery, {
    memberKeySelector,
    memberNameSelector,
} from '#hooks/useProjectMemberListQuery';
import {
    FaramErrors,
    DatabaseEntityBase,
} from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

const schema: ObjectSchema = {
    fields: {
        text: [requiredCondition],
        mentionedUsers: [requiredCondition],
    },
};

export interface EntryCommentFormForModalProps<T> {
    initialValue?: T;
    disabled?: boolean;
    onValidationSuccess: (value: T) => void;
    projectId: DatabaseEntityBase['id'];
    className?: string;
}

function EntryCommentFormForModal<T extends {}>(props: EntryCommentFormForModalProps<T>) {
    const {
        initialValue = {},
        disabled,
        onValidationSuccess,
        projectId,
        className,
    } = props;

    const [faramValues, setFaramValues] = React.useState<T | {}>(initialValue);
    const [faramErrors, setFaramErrors] = React.useState<FaramErrors>({});
    const [
        projectMembersPending,
        projectMembersResponse,
    ] = useProjectMemberListQuery(projectId);

    const handleFaramChange = React.useCallback((newFaramValues, newFaramErrors) => {
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
    }, []);

    const handleFaramValidationSuccess = React.useCallback((_, newFaramValues) => {
        onValidationSuccess(newFaramValues);
    }, [onValidationSuccess]);

    return (
        <Faram
            className={_cs(className, styles.commentFormForModal)}
            onChange={handleFaramChange}
            onValidationFailure={setFaramErrors}
            onValidationSuccess={handleFaramValidationSuccess}
            schema={schema}
            value={faramValues}
            error={faramErrors}
            disabled={disabled || projectMembersPending}
        >
            <ModalBody>
                <TextArea
                    className={styles.input}
                    faramElementName="text"
                    label={_ts('entryReview', 'comment')}
                    rows={3}
                    autoFocus
                />
                <MultiSelectInput
                    className={styles.input}
                    faramElementName="mentionedUsers"
                    label={_ts('entryReview', 'assignees')}
                    options={projectMembersResponse?.results}
                    keySelector={memberKeySelector}
                    labelSelector={memberNameSelector}
                />
            </ModalBody>
            <ModalFooter>
                <PrimaryButton
                    type="submit"
                    disabled={projectMembersPending || disabled}
                >
                    {_ts('entryReview', 'submitButtonLabel')}
                </PrimaryButton>
            </ModalFooter>
        </Faram>
    );
}

export default EntryCommentFormForModal;
