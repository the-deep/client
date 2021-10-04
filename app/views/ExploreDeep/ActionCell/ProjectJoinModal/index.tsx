import React, { useCallback } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import {
    Modal,
    Button,
    TextArea,
    useAlert,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    internal,
    useForm,
    removeNull,
    requiredStringCondition,
    getErrorObject,
    lengthGreaterThanCondition,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import {
    JoinProjectMutation,
    JoinProjectMutationVariables,
} from '#generated/types';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import NonFieldError from '#components/NonFieldError';

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
            errors,
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
    projectId: string;
    onModalClose: () => void;
    onJoinRequestSuccess: () => void;
}

function ProjectJoinModal(props: Props) {
    const {
        className,
        projectId,
        onModalClose,
        onJoinRequestSuccess,
    } = props;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValue);
    const alert = useAlert();

    const error = getErrorObject(riskyError);

    const [
        joinProject,
        { loading },
    ] = useMutation<JoinProjectMutation, JoinProjectMutationVariables>(
        JOIN_PROJECT,
        {
            onCompleted: (response) => {
                const { joinProject: joinProjectRes } = response;
                if (!joinProjectRes) {
                    return;
                }
                const {
                    ok,
                    errors,
                } = joinProjectRes;

                if (!ok) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else {
                    alert.show(
                        'Successfully sent join request.',
                        {
                            variant: 'success',
                        },
                    );
                    onJoinRequestSuccess();
                    onModalClose();
                }
            },
            onError: (gqlError) => {
                setError({
                    [internal]: gqlError.message,
                });
                alert.show(
                    gqlError.message,
                    { variant: 'error' },
                );
            },
        },
    );

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    joinProject({
                        variables: {
                            reason: val.reason ?? '',
                            project: projectId,
                        },
                    });
                },
            );
            submit();
        },
        [setError, validate, projectId, joinProject],
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
                        disabled={pristine || loading}
                        onClick={handleSubmit}
                        variant="primary"
                    >
                        Join
                    </Button>
                </>
            )}
        >
            {loading && <PendingMessage />}
            <NonFieldError error={error} />
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
