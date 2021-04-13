import React from 'react';
import { IoClose } from 'react-icons/io5';
import { QuickActionButton } from '@the-deep/deep-ui';
import {
    PartialForm,
    Error,
} from '@togglecorp/toggle-form';

import { AnalyticalEntryType } from '../../schema';

import styles from './styles.scss';

interface AnalyticalEntryInputProps {
   value: PartialForm<AnalyticalEntryType>;
   error: Error<AnalyticalEntryType> | undefined;
   // onChange: (value: PartialForm<AnalyticalEntryType>, index: number) => void;
   onRemove: (index: number) => void;
   index: number;
}

function AnalyticalEntryInput(props: AnalyticalEntryInputProps) {
    const {
        value,
        error,
        // onChange,
        onRemove,
        index,
    } = props;

    // const onFieldChange = useFormObject(index, value, onChange);

    return (
        <div className={styles.entry}>
            {error?.$internal && (
                <p>
                    {error.$internal}
                </p>
            )}
            <h4>
                {value.entry}
            </h4>
            <QuickActionButton
                name={index}
                onClick={onRemove}
                // FIXME: use translation
                title="Remove Analytical Entry"
            >
                <IoClose />
            </QuickActionButton>
        </div>
    );
}

export default AnalyticalEntryInput;
