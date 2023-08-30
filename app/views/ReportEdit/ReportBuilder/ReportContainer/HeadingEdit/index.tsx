import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { TextInput } from '@the-deep/deep-ui';
import {
    type EntriesAsList,
} from '@togglecorp/toggle-form';

import {
    type HeadingConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props {
    className?: string;
    value: HeadingConfigType | undefined;
    onFieldChange: (...entries: EntriesAsList<HeadingConfigType>) => void;
}

function HeadingEdit(props: Props) {
    const {
        className,
        value,
        onFieldChange,
    } = props;

    return (
        <div className={_cs(className, styles.headingEdit)}>
            <div className={styles.left}>
                <TextInput
                    value={value?.content}
                    name="content"
                    onChange={onFieldChange}
                />
            </div>
        </div>
    );
}

export default HeadingEdit;
