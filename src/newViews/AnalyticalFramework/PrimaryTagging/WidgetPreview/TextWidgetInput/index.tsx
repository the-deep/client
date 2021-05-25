import React from 'react';
import {
    TextArea,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export interface Props <N extends string>{
    title: string;

    name: N,
    value: string | null | undefined,
    onChange: (value: string | undefined) => void,

    actions?: React.ReactNode,
    disabled?: boolean;
    readOnly?: boolean;
}

function TextWidgetInput<N extends string>(props: Props<N>) {
    const {
        title,
        name,
        value,
        onChange,
        disabled,
        readOnly,
        actions,
    } = props;

    return (
        <div className={styles.widgetPreview}>
            <div className={styles.header}>
                <h3 className={styles.header}>
                    {title}
                </h3>
                {actions && (
                    <div className={styles.actions}>
                        {actions}
                    </div>
                )}
            </div>
            <TextArea
                name={name}
                onChange={onChange}
                value={value}
                rows={5}
                readOnly={readOnly}
                disabled={disabled}
            />
        </div>
    );
}

export default TextWidgetInput;
