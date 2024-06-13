import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoClose,
    IoCheckmarkSharp,
    IoAdd,
} from 'react-icons/io5';
import {
    Button,
    RawInput,
    List,
    Tag,
    TagProps as PropsFromTag,
    useBooleanState,
} from '@the-deep/deep-ui';

import styles from './styles.css';

type TagVariant = PropsFromTag['variant'];

interface TagProps extends PropsFromTag {
    label: string;
    onRemove: (key: string) => void;
    variant?: TagVariant;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
}

function ModifiedTag(props: TagProps) {
    const {
        className,
        onRemove,
        label,
        variant,
        disabled,
        readOnly,
        ...otherProps
    } = props;

    return (
        <Tag
            className={_cs(className, styles.tag)}
            actions={!readOnly && (
                <Button
                    name={label}
                    onClick={onRemove}
                    className={styles.tagButton}
                    childrenContainerClassName={styles.children}
                    disabled={disabled}
                    icons={(
                        <IoClose />
                    )}
                />
            )}
            variant={variant}
            {...otherProps}
        >
            {label}
        </Tag>
    );
}

const keySelector = (d: string) => d;
const emptyValue: string[] = [];

interface Props<N extends string> extends PropsFromTag{
    className?: string;
    tagClassName?: string;
    value?: string[];
    label: string;
    name: N;
    variant?: TagVariant;
    onChange?: (newVal: string[], name: N) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

function TagInput<N extends string>(props: Props<N>) {
    const {
        className,
        value = emptyValue,
        onChange,
        name,
        label,
        variant,
        disabled,
        readOnly,
        tagClassName,
        ...otherProps
    } = props;

    const [newTagValue, setNewTagValue] = useState<string | undefined>();
    const [newTagAddShown, showNewTagAdd, hideNewTagAdd] = useBooleanState(false);

    const handleTagAdd = useCallback(() => {
        if (!newTagValue) {
            setNewTagValue(undefined);
            hideNewTagAdd();
            return;
        }

        const indexToRemove = value.indexOf(newTagValue);
        if (indexToRemove === -1) {
            const newValues = [...value];
            newValues.push(newTagValue);
            if (onChange) {
                onChange(newValues, name);
            }
        }
        setNewTagValue(undefined);
        hideNewTagAdd();
    }, [onChange, value, name, hideNewTagAdd, newTagValue]);

    const handleTagRemove = useCallback((tagToRemove: string) => {
        const indexToRemove = value.indexOf(tagToRemove);
        if (indexToRemove !== -1) {
            const newValues = [...value];
            newValues.splice(indexToRemove, 1);
            if (onChange) {
                onChange(newValues, name);
            }
        }
    }, [onChange, value, name]);

    const tagRendererParams = useCallback(
        (d: string) => ({
            label: d,
            onRemove: handleTagRemove,
            variant,
            disabled,
            readOnly,
            className: tagClassName,
            ...otherProps,
        }),
        [handleTagRemove, variant, readOnly, disabled, tagClassName, otherProps],
    );

    const handleNewTagAddCancel = useCallback(() => {
        setNewTagValue(undefined);
        hideNewTagAdd();
    }, [hideNewTagAdd]);

    return (
        <div className={_cs(styles.tagInput, className)}>
            <div className={styles.label}>
                {label}
            </div>
            <div className={styles.tags}>
                <List
                    data={value}
                    rendererParams={tagRendererParams}
                    renderer={ModifiedTag}
                    keySelector={keySelector}
                />
                {!readOnly && (
                    <Tag
                        className={styles.tag}
                        actionsContainerClassName={styles.tagActions}
                        actions={newTagAddShown ? (
                            <>
                                <Button
                                    name="done"
                                    onClick={handleTagAdd}
                                    className={_cs(styles.tagButton, styles.checkButton)}
                                    childrenContainerClassName={styles.children}
                                    disabled={disabled}
                                    icons={(
                                        <IoCheckmarkSharp />
                                    )}
                                />
                                <Button
                                    name="remove"
                                    onClick={handleNewTagAddCancel}
                                    className={_cs(styles.tagButton, styles.cancelButton)}
                                    childrenContainerClassName={styles.children}
                                    disabled={disabled}
                                    icons={(
                                        <IoClose />
                                    )}
                                />
                            </>
                        ) : (
                            <Button
                                name="add"
                                onClick={showNewTagAdd}
                                className={styles.tagButton}
                                childrenContainerClassName={styles.children}
                                disabled={disabled}
                                icons={(
                                    <IoAdd />
                                )}
                            />
                        )}
                    >
                        {newTagAddShown ? (
                            <RawInput
                                name="newTag"
                                value={newTagValue}
                                onChange={setNewTagValue}
                                autoFocus
                                disabled={disabled}
                            />
                        ) : ''}
                    </Tag>
                )}
            </div>
        </div>
    );
}

export default TagInput;
