import React, { useCallback, useState } from 'react';
import { FileInput, FileInputProps, ImagePreview } from '@the-deep/deep-ui';
import { useLazyRequest } from '#base/utils/restRequest';
import _ts from '#ts';

export interface Option<N extends string | number> {
    id: N;
    title: string;
    file: string;
    mimeType?: string;
    metadata?: unknown;
}

interface Props<T extends string, N extends number | string> extends Omit<FileInputProps<T>, 'overrideStatus' | 'status' | 'value' | 'onChange' | 'multiple' | 'className'> {
    className?: string;
    previewClassName?: string;
    fileInputClassName?: string;
    value: N | null | undefined;
    onChange: (value: N | null | undefined, name: T) => void;

    option?: Option<N>;
    onOptionChange: (value: Option<N>) => void;
    isPrivate?: boolean;
    previewVisible?: boolean;
}

function DeepImageInput<T extends string, N extends number | string>(props: Props<T, N>) {
    const {
        className,
        previewClassName,
        fileInputClassName,
        value: valueFromProps,
        option,
        onOptionChange,
        disabled,
        name,
        onChange,
        isPrivate,
        previewVisible,
        ...otherProps
    } = props;

    const [value, setValue] = useState<File | undefined>();

    const {
        pending,
        trigger,
    } = useLazyRequest<Option<N>, File>({
        formData: true,
        url: 'server://files/',
        method: 'POST',
        body: (ctx) => ({
            file: ctx,
            title: ctx.name,
            isPublic: !isPrivate,
        }),
        onSuccess: (response) => {
            onChange(response.id, name);
            onOptionChange(response);
        },
        failureMessage: _ts('deepImageInput', 'title'),
    });
    const handleChange = useCallback(
        (file: File | undefined) => {
            setValue(file);

            if (file) {
                trigger(file);
            } else {
                onChange(undefined, name);
            }
        },
        [trigger, name, onChange],
    );

    let currentStatus;
    if (pending) {
        currentStatus = _ts('deepImageInput', 'uploading');
    } else if (!valueFromProps) {
        currentStatus = _ts('deepImageInput', 'noFiles');
    } else if (option && option.id === valueFromProps) {
        currentStatus = option.title;
    } else {
        currentStatus = _ts('deepImageInput', 'questionMark');
    }

    let src;
    let alt;
    if (option) {
        src = option.file;
        alt = option.title;
    } else if (value) {
        src = URL.createObjectURL(value);
        alt = value.name;
    }

    return (
        <div className={className}>
            <FileInput
                {...otherProps}
                className={fileInputClassName}
                disabled={disabled || pending}
                name={name}
                overrideStatus
                status={currentStatus}
                value={value}
                onChange={handleChange}
                multiple={false}
            />
            { previewVisible && src && (
                <ImagePreview
                    className={previewClassName}
                    src={src}
                    hideTools
                    alt={alt}
                />
            )}
        </div>
    );
}

export default DeepImageInput;
