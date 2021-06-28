import React, { useCallback, useState } from 'react';

import { useLazyRequest } from '#utils/request';
import { FileInput, FileInputProps } from '@the-deep/deep-ui';

interface Option {
    id: number;
    title: string;
    file: string; // this is a url
    mimeType?: string;
    metadata?: unknown;
}

interface Props<T extends string> extends Omit<FileInputProps<T>, 'overrideStatus' | 'status' | 'value' | 'onChange' | 'multiple'> {
    value?: number;
    onChange: (value: number | undefined, name: T) => void;

    option?: Option;
    setOption: (value: Option) => void;
    isPublic?: boolean;
}

function DeepFileInput<T extends string>(props: Props<T>) {
    const {
        value: valueFromProps,
        option,
        setOption,
        disabled,
        name,
        onChange,
        isPublic = true,
        ...otherProps
    } = props;

    const [value, setValue] = useState<File | undefined>();

    const {
        pending,
        trigger,
    } = useLazyRequest<Option, File>({
        formData: true,
        url: '/files/',
        method: 'POST',
        body: ctx => ({
            file: ctx,
            title: ctx.name,
            isPublic,
        }),
        onSuccess: (response) => {
            onChange(response.id, name);
            setOption(response);
        },
        onFailure: () => {
            console.error('Could not upload file!');
        },
    });

    const handleChange = useCallback(
        (file: File) => {
            trigger(file);
            setValue(file);
        },
        [trigger],
    );

    let currentStatus;
    if (pending) {
        currentStatus = 'Uploading file'; // FIXME add translations
    } else if (!valueFromProps) {
        currentStatus = 'No file selected'; // FIXME add translations
    } else if (option && option.id === valueFromProps) {
        currentStatus = option.title;
    } else {
        currentStatus = '?'; // FIXME add translations
    }

    return (
        <FileInput
            {...otherProps}
            value={value}
            disabled={disabled || pending}
            name={name}
            onChange={handleChange}
            overrideStatus
            status={currentStatus}
        />
    );
}
export default DeepFileInput;
