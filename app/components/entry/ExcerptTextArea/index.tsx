import React, { useCallback } from 'react';
import {
    _cs,
    formatPdfText,
} from '@togglecorp/fujs';
import {
    QuickActionButton,
    TextArea,
    TextAreaProps,
} from '@the-deep/deep-ui';
import { IoBandageOutline } from 'react-icons/io5';

import styles from './styles.css';

type Props<N extends string> = Omit<TextAreaProps<N>, 'onChange'> & {
    onChange?: (
        value: string | undefined,
        name: N,
        e?: React.FormEvent<HTMLTextAreaElement>,
    ) => void;

};

function ExcerptTextArea<N extends string>(props: Props<N>) {
    const {
        className,
        onChange,
        readOnly,
        disabled,
        value,
        name,
        ...otherProps
    } = props;

    const handleAutoFormatButtonClick = useCallback(() => {
        if (readOnly || disabled) {
            return;
        }

        if (onChange) {
            onChange(formatPdfText(value ?? ''), name);
        }
    }, [
        name,
        readOnly,
        value,
        disabled,
        onChange,
    ]);

    return (
        <TextArea
            className={_cs(className, styles.textArea)}
            name={name}
            readOnly={readOnly}
            disabled={disabled}
            onChange={onChange}
            value={value}
            icons={(
                <QuickActionButton
                    name={undefined}
                    onClick={handleAutoFormatButtonClick}
                    title="Auto format"
                >
                    <IoBandageOutline />
                </QuickActionButton>
            )}
            iconsContainerClassName={styles.icons}
            {...otherProps}
        />
    );
}

export default ExcerptTextArea;
