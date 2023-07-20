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
        <div className={styles.methodlogyForm}>
            <Heading size="extraSmall">
                Methodlogy content
            </Heading>
            <div className={styles.methodlogyContent}>
                <TextArea
                    label="OBJECTIVES"
                    name="objectives"
                    onChange={setFieldValue}
                    value={value?.objectives}
                    error={error?.objectives}
                />

                <TextArea
                    label="LIMITATIONS"
                    name="limitations"
                    onChange={setFieldValue}
                    value={value?.limitations}
                    error={error?.limitations}
                />
            </div>
            <div className={styles.attributesHeading}>
                <Heading size="extraSmall">
                    Collection Technique
                </Heading>
                <Heading size="extraSmall">
                    Sampling
                </Heading>
                <Heading size="extraSmall">
                    Proximity
                </Heading>
                <Heading size="extraSmall">
                    Unit of Analysis
                </Heading>
                <Heading size="extraSmall">
                    Unit of Reporting
                </Heading>
                <QuickActionButton
                    name="addAttributes"
                    onClick={handleAddMethodologyAttributes}
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
