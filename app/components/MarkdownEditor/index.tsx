import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import MDEditor, { commands, MDEditorProps } from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import {
    InputContainer,
    InputContainerProps,
} from '@the-deep/deep-ui';

import { genericMemo } from '#utils/common';

import styles from './styles.css';

export type MarkdownEditorProps<T> = Omit<InputContainerProps, 'input' | 'onChange' | 'name' | 'value'> & {
    name: T;
    onChange: (value: string | undefined, name: T) => void;
    editorClassName?: string;
} & Omit<MDEditorProps, 'onChange' | 'className'>;

function MarkdownEditor<T extends string>(props: MarkdownEditorProps<T>) {
    const {
        actions,
        actionsContainerClassName,
        className,
        disabled,
        error,
        errorContainerClassName,
        hint,
        hintContainerClassName,
        icons,
        iconsContainerClassName,
        inputSectionClassName,
        label,
        labelContainerClassName,
        readOnly,
        uiMode,
        name,
        value,
        onChange,
        commands: commandsFromProps,
        preview = 'edit',
        previewOptions: previewOptionsFromProps,
        editorClassName,
        height,
    } = props;

    const handleChange = useCallback((val: string | undefined) => {
        onChange(val, name);
    }, [onChange, name]);

    const previewOptions = useMemo(() => ({
        rehypePlugins: [rehypeSanitize],
        ...previewOptionsFromProps,
    }), [previewOptionsFromProps]);

    return (
        <InputContainer
            actions={actions}
            actionsContainerClassName={actionsContainerClassName}
            className={className}
            disabled={disabled}
            error={error}
            errorContainerClassName={errorContainerClassName}
            hint={hint}
            hintContainerClassName={hintContainerClassName}
            icons={icons}
            iconsContainerClassName={iconsContainerClassName}
            inputSectionClassName={inputSectionClassName}
            label={label}
            labelContainerClassName={labelContainerClassName}
            readOnly={readOnly}
            uiMode={uiMode}
            input={(
                <div data-color-mode="light" className={styles.container}>
                    <div className="wmde-markdown-var" />
                    <MDEditor
                        className={_cs(editorClassName, styles.markdownEditor)}
                        value={value}
                        onChange={handleChange}
                        commands={[
                            commands.bold,
                            commands.italic,
                            ...(commandsFromProps ?? []),
                        ]}
                        preview={preview}
                        previewOptions={previewOptions}
                        height={height}
                    />
                </div>

            )}
        />
    );
}

export default genericMemo(MarkdownEditor);
