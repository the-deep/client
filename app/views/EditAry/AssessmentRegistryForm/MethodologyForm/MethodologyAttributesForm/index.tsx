import React from 'react';
import { IoTrash } from 'react-icons/io5';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    NumberInput,
    QuickActionButton,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    GetAttributesOptionsQuery,
    GetAttributesOptionsQueryVariables,
} from '#generated/types';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';

import { MethodologyAttributesType } from '../../formSchema';

import styles from './styles.css';

const GET_ATTRIBUTES_OPTIONS = gql`
    query GetAttributesOptions {
        dataCollectionTechniqueOptions: __type(name: "AssessmentRegistryDataCollectionTechniqueTypeEnum") {
            enumValues {
                name
                description
            }
        }
        samplingApproach: __type(name: "AssessmentRegistrySamplingApproachTypeEnum") {
            enumValues {
                name
                description
            }
        }
        proximity: __type(name: "AssessmentRegistryProximityTypeEnum") {
            enumValues {
                name
                description
            }
        }
        unitOfAnanlysis: __type(name: "AssessmentRegistryUnitOfAnalysisTypeEnum") {
            enumValues {
                name
                description
            }
        }
        unitOfReporting: __type(name: "AssessmentRegistryUnitOfReportingTypeEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;
const defaultMethodologyAttributeValue: MethodologyAttributesType = {
    clientId: '',
};

interface Props {
    value: MethodologyAttributesType,
    onChange: (
        value: SetValueArg<MethodologyAttributesType>,
        index: number,
    ) => void | undefined;
    onRemove: (index: number) => void;
    index: number;
    error: Error<MethodologyAttributesType> | undefined;
}

function MethodologyAttributesForm(props: Props) {
    const {
        value,
        onChange,
        index,
        error: riskyError,
        onRemove,
    } = props;

    const error = getErrorObject(riskyError);

    const onAttributeChange = useFormObject(
        index,
        onChange,
        defaultMethodologyAttributeValue,
    );

    const {
        data,
    } = useQuery<GetAttributesOptionsQuery, GetAttributesOptionsQueryVariables>(
        GET_ATTRIBUTES_OPTIONS,
    );

    return (
        <div className={styles.attributesForm}>
            <SelectInput
                className={styles.attributeInput}
                label="DATA COLLECTION TECHNIQUE"
                placeholder="Select an option"
                name="dataCollectionTechnique"
                options={data?.dataCollectionTechniqueOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.dataCollectionTechnique}
                error={error?.dataCollectionTechnique}
            />
            <div className={styles.samplingInput}>
                <NumberInput
                    className={styles.attributeInput}
                    label="SAMPLING SIZE"
                    name="samplingSize"
                    onChange={onAttributeChange}
                    value={value.samplingSize}
                    error={error?.samplingSize}
                />
                <SelectInput
                    className={styles.attributeInput}
                    label="SAMPLING APPROACH"
                    placeholder="Select an option"
                    name="samplingApproach"
                    options={data?.samplingApproach?.enumValues}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    onChange={onAttributeChange}
                    value={value.samplingApproach}
                    error={error?.samplingApproach}
                />
            </div>
            <SelectInput
                className={styles.attributeInput}
                label="PROXIMITY"
                placeholder="Select an option"
                name="proximity"
                options={data?.proximity?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.proximity}
                error={error?.proximity}
            />
            <SelectInput
                className={styles.attributeInput}
                label="UNIT OF ANALYSIS"
                placeholder="Select an option"
                name="unitOfAnalysis"
                options={data?.unitOfAnanlysis?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.unitOfAnalysis}
                error={error?.unitOfAnalysis}
            />
            <SelectInput
                className={styles.attributeInput}
                label="UNIT OF REPORTING"
                placeholder="Select an option"
                name="unitOfReporting"
                options={data?.unitOfReporting?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.unitOfReporting}
                error={error?.unitOfReporting}
            />
            <QuickActionButton
                name={index}
                onClick={onRemove}
                className={styles.removeButton}
            >
                <IoTrash />
            </QuickActionButton>
        </div>
    );
}

export default MethodologyAttributesForm;
