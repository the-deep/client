import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import {
    Modal,
    Button,
    TextArea,
    Alert,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    requiredStringCondition,
    getErrorObject,
    lengthGreaterThanCondition,
} from '@togglecorp/toggle-form';

import {
    JoinProjectMutation,
    JoinProjectMutationVariables,
} from '#generated/types';

import styles from './styles.css';

interface ProjectJoinFields {
    reason: string;
}

const JOIN_PROJECT = gql`
    mutation JoinProject(
        $reason: String!,
        $project: String!,
    ) {
        joinProject(data: {
            reason: $reason,
            project: $project,
        }) {
            ok,
        }
    }
`;

type FormType = Partial<ProjectJoinFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        reason: [
            requiredStringCondition,
            lengthGreaterThanCondition(100),
        ],
    }),
};

const defaultFormValue: FormType = {};

interface Props {
    className?: string;
    projectId?: string;
    onModalClose: () => void;
}

function ProjectJoinModal(props: Props) {
    const {
        className,
        projectId,
        onModalClose,
    } = props;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const [
        joinProject,
        { loading: joinProjectPending },
    ] = useMutation<JoinProjectMutation, JoinProjectMutationVariables>(
        JOIN_PROJECT,
        {
            onCompleted: () => {
                console.warn('Join Request successfully sent');
                onModalClose();
            },
            onError: () => {
                console.warn('Failed to send request');
            },
        },
    );

    const pending = joinProjectPending;

    const valueToSend = useMemo(() => ({
        ...value,
        project: projectId,
    }), [projectId, value]);

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                joinProject({
                    variables: valueToSend,
                });
            }
        },
        [setError, validate, projectId, value],
    );

    return (
        <Modal
            heading="Send project join request"
            className={_cs(className, styles.projectJoinModal)}
            onCloseButtonClick={onModalClose}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={onModalClose}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        disabled={pristine || pending}
                        onClick={handleSubmit}
                        variant="primary"
                    >
                        Join
                    </Button>
                </>
            )}
        >
            <TextArea
                label="Why do you want to join the project?"
                name="reason"
                value={value.reason}
                rows={10}
                onChange={setFieldValue}
                error={error?.reason}
            />
        </Modal>
    );
}

export default ProjectJoinModal;
