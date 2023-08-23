import React, { useCallback } from 'react';
import { Button, Header, TextInput, useAlert } from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';
import {
    getErrorObject,
    ObjectSchema,
    PartialForm,
    useForm,
    createSubmitHandler,
    requiredCondition,
    removeNull,
} from '@togglecorp/toggle-form';

import {
    AssessmentRegistrySummaryIssueCreateInputType,
    CreateAssessmentRegistrySummaryIssueMutation,
    CreateAssessmentRegistrySummaryIssueMutationVariables,
} from '#generated/types';

import { PillarType } from '..';

import styles from './styles.css';

type FormSchema = ObjectSchema<PartialForm<AssessmentRegistrySummaryIssueCreateInputType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => {
        const baseSchema: FormSchemaFields = {
            parent: [],
            label: [requiredCondition],
            subPillar: [],
        };
        return baseSchema;
    },
    validation: () => undefined,
};

const initialVaue: PartialForm<AssessmentRegistrySummaryIssueCreateInputType> = {
    label: undefined,
    subPillar: undefined,
};

const CREATE_ASSESSMENT_REGISTRY_SUMMARY_ISSUE = gql`
    mutation CreateAssessmentRegistrySummaryIssue($data: AssessmentRegistrySummaryIssueCreateInputType!) {
        createAssessmentRegSummaryIssue(data: $data) {
            ok
            errors
            result {
                id
                label
                subPillar
                subPillarDisplay
            }
        }
    }
`;

interface Props {
    data: NonNullable<PillarType['subPillarInformation']>[number];
    onClose: () => void;
}

function AddIssueModal(props: Props) {
    const {
        data,
        onClose,
    } = props;
    const {
        value,
        error: riskyError,
        validate,
        setFieldValue,
        setError,
    } = useForm(schema, initialVaue);

    const alert = useAlert();

    const error = getErrorObject(riskyError);

    const [
        createSummaryIssue,
        {
            loading,
        },
    ] = useMutation<
    CreateAssessmentRegistrySummaryIssueMutation,
    CreateAssessmentRegistrySummaryIssueMutationVariables
    >(CREATE_ASSESSMENT_REGISTRY_SUMMARY_ISSUE, {
        onCompleted: (response) => {
            const result = removeNull(response.createAssessmentRegSummaryIssue);
            const { ok } = result;
            if (ok) {
                alert.show(
                    'Successfully added new issue.',
                    {
                        variant: 'success',
                    },
                );
                onClose();
            }
        },
        onError: () => {
            alert.show(
                'Failed to add issue.',
                {
                    variant: 'error',
                },
            );
        },
    });

    const handleSave = useCallback(
        () => {
            createSummaryIssue({
                variables: {
                    data: {
                        ...value,
                        subPillar: data.subPillar,
                    } as AssessmentRegistrySummaryIssueCreateInputType,
                },
            });
        }, [data, value, createSummaryIssue],
    );

    return (
        <form
            className={styles.issueModal}
            onSubmit={createSubmitHandler(validate, setError, handleSave)}
        >
            <Header
                heading={data.subPillarDisplay}
                headingSize="medium"
                description={(<hr />)}
                descriptionClassName={styles.description}
            />
            {/* TODO:
                <SelectInput
                placeholder="Select parent"
                name="parent"
                onChange={setFieldValue}
                value={value.parent}
                options={[]}
                labelSelector={(d) => d}
                keySelector={(d) => d}
            /> */}
            <TextInput
                placeholder="label"
                label="label"
                name="label"
                value={value.label}
                onChange={setFieldValue}
                error={error?.label}
            />

            <Button
                name="save"
                type="submit"
                disabled={loading}
            >
                save
            </Button>
        </form>
    );
}

export default AddIssueModal;
