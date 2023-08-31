import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import MarkdownEditor from '#components/MarkdownEditor';

import {
    type TextConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props {
    className?: string;
    value: TextConfigType | undefined;
    onFieldChange: (...entries: EntriesAsList<TextConfigType>) => void;
    error?: Error<TextConfigType>;
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
                <MarkdownEditor
                    className={styles.editor}
                    label="Content"
                    name="content"
                    onChange={onFieldChange}
                    value={value?.content}
                    error={error?.content}
                    height={300}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default TextEdit;
