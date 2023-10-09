import React, { useCallback, useState } from 'react';
import {
    Button,
    TextInput,
    Footer,
    useAlert,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';
import { _cs } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import {
    AssessmentRegistrySummaryIssueCreateInputType,
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    CreateAssessmentRegistrySummaryIssueMutation,
    CreateAssessmentRegistrySummaryIssueMutationVariables,
} from '#generated/types';

import styles from './styles.css';

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

type Props = {
    className?: string;
    onClose: () => void;
} & ({
    type: 'pillar';
    subPillar: AssessmentRegistrySummarySubPillarTypeEnum;
} | {
    type: 'dimension';
    subDimension: AssessmentRegistrySummarySubDimensionTypeEnum;
})

function AddIssueModal(props: Props) {
    const {
        className,
        onClose,
    } = props;

    const alert = useAlert();
    const [label, setLabel] = useState<string | undefined>(undefined);

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
            // eslint-disable-next-line react/destructuring-assignment
            if (props.type === 'pillar') {
                createSummaryIssue({
                    variables: {
                        data: {
                            label,
                            // eslint-disable-next-line react/destructuring-assignment
                            subPillar: props.subPillar,
                        } as AssessmentRegistrySummaryIssueCreateInputType,
                    },
                });
            }
            // eslint-disable-next-line react/destructuring-assignment
            if (props.type === 'dimension') {
                createSummaryIssue({
                    variables: {
                        data: {
                            label,
                            // eslint-disable-next-line react/destructuring-assignment
                            subDimension: props.subDimension,
                        } as AssessmentRegistrySummaryIssueCreateInputType,
                    },
                });
            }
        }, [
            props,
            label,
            createSummaryIssue,
        ],
    );

    return (
        <div className={_cs(className, styles.issueModal)}>
            <TextInput
                placeholder="label"
                label="label"
                name="label"
                value={label}
                onChange={setLabel}
            />
            <Footer
                actions={(
                    <>
                        <Button
                            name={undefined}
                            onClick={onClose}
                            variant="secondary"
                        >
                            Close
                        </Button>
                        <Button
                            name="save"
                            disabled={loading}
                            onClick={handleSave}
                        >
                            save
                        </Button>
                    </>
                )}
            />
        </div>
    );
}

export default AddIssueModal;
