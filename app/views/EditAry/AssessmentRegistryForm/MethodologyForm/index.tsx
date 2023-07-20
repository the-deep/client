import React,
{
    useCallback,
    useMemo,
} from 'react';
import { IoAddCircle } from 'react-icons/io5';
import { randomString } from '@togglecorp/fujs';
import {
    Heading,
    QuickActionButton,
    TextArea,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import MethodologyAttributesForm from './MethodologyAttributesForm';
import {
    PartialFormType,
    MethodologyAttributesType,
} from '../formSchema';

import styles from './styles.css';

interface Props {
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

type PartialMethodologyAttributesType = PartialFormType['methodologyAttributes'];

function MethodologyForm(props: Props) {
    const {
        value,
        setFieldValue,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

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
                const newOldValue = oldValue ?? [];
                const newClientId = randomString();
                const newMethodologyAttributes: MethodologyAttributesType = {
                    clientId: newClientId,
                };
                return [...newOldValue, newMethodologyAttributes];
            },
            'methodologyAttributes',
        );
    }, []);

    return (
        <div className={styles.methodologyForm}>
            <Heading
                size="extraSmall"
                className={styles.methodologyHeading}
            >
                Methodlogy content
            </Heading>
            <div className={styles.methodologyContent}>
                <TextArea
                    className={styles.methodologyInput}
                    label="OBJECTIVES"
                    name="objectives"
                    placeholder="If available, copy paste here the objectives of the needs assessment"
                    onChange={setFieldValue}
                    value={value?.objectives}
                    error={error?.objectives}
                    rows={15}
                />

                <TextArea
                    className={styles.methodologyInput}
                    label="LIMITATIONS"
                    name="limitations"
                    placeholder="If available, copy paste here the limitations reported for the needs assessment"
                    onChange={setFieldValue}
                    value={value?.limitations}
                    error={error?.limitations}
                    rows={15}
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
                    name="addAttributes"
                    onClick={handleAddMethodologyAttributes}
                    className={styles.addButton}
                >
                    <IoAddCircle />
                </QuickActionButton>
            </div>
            {value.methodologyAttributes?.map((attribute, index) => (
                <MethodologyAttributesForm
                    onChange={setMethodologyAttributesValue}
                    value={attribute}
                    index={index}
                    error={methodologyAttributesError?.[attribute.clientId]}
                    onRemove={onMethodologyAttributesRemove}
                />
            ))}
        </div>
    );
}

export default MethodologyForm;
