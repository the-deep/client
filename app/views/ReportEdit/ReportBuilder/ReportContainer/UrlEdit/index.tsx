import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
} from '@the-deep/deep-ui';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import {
    type UrlConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props {
    className?: string;
    value: UrlConfigType | undefined;
    onFieldChange: (...entries: EntriesAsList<UrlConfigType>) => void;
    error?: Error<UrlConfigType>;
    disabled?: boolean;
}

function TextEdit(props: Props) {
    const {
        className,
        value,
        onFieldChange,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);

    return (
        <div className={_cs(className, styles.textEdit)}>
            <div className={styles.left}>
                <TextInput
                    value={value?.url}
                    name="url"
                    onChange={onFieldChange}
                    error={error?.url}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default TextEdit;
