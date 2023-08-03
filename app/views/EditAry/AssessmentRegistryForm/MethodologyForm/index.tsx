import React,
{
    useCallback,
    useMemo,
} from 'react';
import { IoAddCircle } from 'react-icons/io5';
import { randomString } from '@togglecorp/fujs';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    QuickActionButton,
    TextArea,
    Heading,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import {
    GetAttributesOptionsQuery,
    GetAttributesOptionsQueryVariables,
} from '#generated/types';

import MethodologyAttributesInput from './MethodologyAttributesInput';
import {
    PartialFormType,
    MethodologyAttributesType,
} from '../formSchema';
import Header from '../Header';

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

interface Props {
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
    readOnly?: boolean;
}

type PartialMethodologyAttributesType = PartialFormType['methodologyAttributes'];

function MethodologyForm(props: Props) {
    const {
        value,
        setFieldValue,
        error: riskyError,
        disabled,
        readOnly,
    } = props;

    const error = getErrorObject(riskyError);

    const {
        data: options,
    } = useQuery<GetAttributesOptionsQuery, GetAttributesOptionsQueryVariables>(
        GET_ATTRIBUTES_OPTIONS,
    );

    const {
        setValue: setMethodologyAttributesValue,
        removeValue: onMethodologyAttributesRemove,
    } = useFormArray<
        'methodologyAttributes',
        MethodologyAttributesType
    >('methodologyAttributes', setFieldValue);

    const methodologyAttributesError = useMemo(
        () => getErrorObject(error?.methodologyAttributes),
        [error?.methodologyAttributes],
    );

    const handleAddMethodologyAttributes = useCallback(() => {
        setFieldValue(
            (oldValue: PartialMethodologyAttributesType) => {
                const safeOldValue = oldValue ?? [];
                const newClientId = randomString();
                const newMethodologyAttributes: MethodologyAttributesType = {
                    clientId: newClientId,
                };
                return [...safeOldValue, newMethodologyAttributes];
            },
            'methodologyAttributes',
        );
    }, [setFieldValue]);

    return (
        <div className={styles.methodologyForm}>
            <Header
                title="Methodology"
            />
            <div className={styles.methodologyContent}>
                <TextArea
                    className={styles.methodologyInput}
                    label="Objectives"
                    name="objectives"
                    placeholder="If available, copy paste here the objectives of the needs assessment"
                    onChange={setFieldValue}
                    value={value.objectives}
                    error={error?.objectives}
                    rows={15}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <TextArea
                    className={styles.methodologyInput}
                    label="Limitations"
                    name="limitations"
                    placeholder="If available, copy paste here the limitations reported for the needs assessment"
                    onChange={setFieldValue}
                    value={value.limitations}
                    error={error?.limitations}
                    rows={15}
                    disabled={disabled}
                    readOnly={readOnly}
                />
            </div>
            <div className={styles.attributesContent}>
                <Heading
                    size="extraSmall"
                    className={styles.attributeHeading}
                >
                    Collection Technique
                </Heading>
                <Heading
                    size="extraSmall"
                    className={styles.samplingHeading}
                >
                    Sampling
                </Heading>
                <Heading
                    size="extraSmall"
                    className={styles.attributeHeading}
                >
                    Proximity
                </Heading>
                <Heading
                    size="extraSmall"
                    className={styles.attributeHeading}
                >
                    Unit of Analysis
                </Heading>
                <Heading
                    size="extraSmall"
                    className={styles.attributeHeading}
                >
                    Unit of Reporting
                </Heading>
                <QuickActionButton
                    title="Add attributes"
                    name="addAttributes"
                    onClick={handleAddMethodologyAttributes}
                    className={styles.addButton}
                >
                    <IoAddCircle />
                </QuickActionButton>
            </div>
            {value.methodologyAttributes?.map((attribute, index) => (
                <MethodologyAttributesInput
                    key={attribute.clientId}
                    value={attribute}
                    index={index}
                    options={options}
                    onChange={setMethodologyAttributesValue}
                    error={methodologyAttributesError?.[attribute.clientId]}
                    onRemove={onMethodologyAttributesRemove}
                />
            ))}
        </div>
    );
}

export default MethodologyForm;
