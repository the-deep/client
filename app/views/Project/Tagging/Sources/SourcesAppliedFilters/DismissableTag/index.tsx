import React from 'react';
import {
    Tag,
    TagProps,
    Button,
} from '@the-deep/deep-ui';
import { IoClose } from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface DismissableTagProps<T> extends TagProps {
    label?: React.ReactNode;
    name: T,
    onDismiss: (value: undefined, name: T) => void;
}

function DismissableTag<T>(props: DismissableTagProps<T>) {
    const {
        name,
        label,
        className,
        onDismiss,
        actions,
        ...otherProps
    } = props;

    const handleDismiss = React.useCallback(() => {
        onDismiss(undefined, name);
    }, [name, onDismiss]);

    return (
        <div className={_cs(styles.dismissableTag, className)}>
            <div className={styles.label}>
                {label}
            </div>
            <Tag
                {...otherProps}
                className={styles.tag}
                actions={(
                    <>
                        {actions}
                        <Button
                            name={name}
                            onClick={handleDismiss}
                            variant="action"
                        >
                            <IoClose />
                        </Button>
                    </>
                )}
            />
        </div>
    );
}

export default DismissableTag;
