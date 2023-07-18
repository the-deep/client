import React, { useMemo } from 'react';
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
    MethodologyAttributeInputType,
} from '#generated/types';
import { enumKeySelector, enumLabelSelector } from '#utils/common';

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
const defaultMethodologyAttributeValue: MethodologyAttributeInputType = {
    clientId: '',
};

interface Props {
    value: MethodologyAttributeInputType,
    onChange: (
        value: SetValueArg<MethodologyAttributeInputType>,
        index: number,
    ) => void | undefined;
    onRemove: (index: number) => void;
    index: number;
    error: Error<MethodologyAttributeInputType> | undefined;
}

function MethodlogyAttributesForm(props: Props) {
    const {
        value,
        onChange,
        index,
        error: riskyError,
        onRemove,
    } = props;

    const error = getErrorObject(riskyError);

    const onAttributeChange = useFormObject(index, onChange, defaultMethodologyAttributeValue);
    const {
        data,
    } = useQuery<GetAttributesOptionsQuery, GetAttributesOptionsQueryVariables>(
        GET_ATTRIBUTES_OPTIONS,
    );

    const [
        dataCollectionOptions,
        proximityOptions,
        samplingApproachOptions,
        unitOfAnalysisOptions,
        unitOfReportingOptions,
    ] = useMemo(() => ([
        data?.dataCollectionTechniqueOptions?.enumValues,
        data?.proximity?.enumValues,
        data?.samplingApproach?.enumValues,
        data?.unitOfAnanlysis?.enumValues,
        data?.unitOfReporting?.enumValues,
    ]), [data]);

    return (
        <div className={styles.attributesForm}>
            <SelectInput
                className={styles.attributesSelectInput}
                label="DATA COLLECTION TECHNIQUE"
                placeholder="Select an option"
                name="dataCollectionTechnique"
                options={dataCollectionOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.dataCollectionTechnique}
                error={error?.dataCollectionTechnique}
            />
            <div className={styles.samplingInput}>
                <NumberInput
                    label="SAMPLING SIZE"
                    name="samplingSize"
                    onChange={onAttributeChange}
                    value={value.samplingSize}
                    error={error?.samplingSize}
                />
                <SelectInput
                    className={styles.attributesSelectInput}
                    label="SAMPLING APPROACH"
                    placeholder="Select an option"
                    name="samplingApproach"
                    options={samplingApproachOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    onChange={onAttributeChange}
                    value={value.samplingApproach}
                    error={error?.samplingApproach}
                />
            </div>
            <SelectInput
                className={styles.attributesSelectInput}
                label="PROXIMITY"
                placeholder="Select an option"
                name="proximity"
                options={proximityOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.proximity}
                error={error?.proximity}
            />
            <SelectInput
                className={styles.attributesSelectInput}
                label="UNIT OF ANALYSIS"
                placeholder="Select an option"
                name="unitOfAnalysis"
                options={unitOfAnalysisOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.unitOfAnalysis}
                error={error?.unitOfAnalysis}
            />
            <SelectInput
                className={styles.attributesSelectInput}
                label="UNIT OF REPORTING"
                placeholder="Select an option"
                name="unitOfReporting"
                options={unitOfReportingOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.unitOfReporting}
                error={error?.unitOfReporting}
            />
            <QuickActionButton
                name={index}
                onClick={onRemove}
            >
                <IoTrash />
            </QuickActionButton>
        </div>
    );
}

export default MethodlogyAttributesForm;
