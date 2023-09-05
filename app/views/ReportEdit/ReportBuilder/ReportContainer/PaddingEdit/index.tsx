import React from 'react';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    NumberInput,
    Heading,
} from '@the-deep/deep-ui';
import { MdPadding } from 'react-icons/md';

import {
    type PaddingStyleFormType,
} from '../../../schema';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    value: PaddingStyleFormType | undefined;
    onChange: (value: SetValueArg<PaddingStyleFormType | undefined>, name: NAME) => void;
    error?: Error<PaddingStyleFormType>;
    disabled?: boolean;
}

function PaddingEdit<NAME extends string>(props: Props<NAME>) {
    const {
        value,
        onChange,
        error: riskyError,
        disabled,
        name,
    } = props;

    const onFieldChange = useFormObject<
        NAME, PaddingStyleFormType
    >(name, onChange, {});

    const error = getErrorObject(riskyError);

    return (
        <div className={styles.paddingEdit}>
            <Heading size="extraSmall">Padding</Heading>
            <div className={styles.inputs}>
                <NumberInput
                    className={styles.input}
                    name="top"
                    label="Top"
                    value={value?.top}
                    icons={(
                        <MdPadding className={styles.icon} />
                    )}
                    onChange={onFieldChange}
                    error={error?.top}
                    disabled={disabled}
                />
                <NumberInput
                    className={styles.input}
                    name="right"
                    label="Right"
                    value={value?.right}
                    icons={(
                        <MdPadding className={styles.icon} />
                    )}
                    onChange={onFieldChange}
                    error={error?.right}
                    disabled={disabled}
                />
                <NumberInput
                    className={styles.input}
                    name="bottom"
                    label="Bottom"
                    value={value?.bottom}
                    icons={(
                        <MdPadding className={styles.icon} />
                    )}
                    onChange={onFieldChange}
                    error={error?.bottom}
                    disabled={disabled}
                />
                <NumberInput
                    className={styles.input}
                    name="left"
                    label="Left"
                    value={value?.left}
                    icons={(
                        <MdPadding className={styles.icon} />
                    )}
                    onChange={onFieldChange}
                    error={error?.left}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default PaddingEdit;
