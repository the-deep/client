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

    const {
        pending,
        trigger,
    } = useLazyRequest<Option, File>({
        url: '/files/',
        method: 'POST',
        // FIXME: IDK how this works
        body: (ctx) => {
            const formData = new FormData();
            formData.append('file', ctx);
            formData.append('title', ctx.name);
            formData.append('isPublic', String(isPublic));
            return formData;
        },
        onSuccess: (response) => {
            onChange(response.id, name);
            setOption(response);
        },
        onFailure: () => {
            console.error('Could not upload file!');
        },
    });

    const handleChange = useCallback(
        (files: File[]) => {
            if (files.length <= 0) {
                console.error('No file was selected');
                return;
            }
            const [firstFile] = files;
            trigger(firstFile);
        },
        [trigger],
    );

    let currentStatus;
    if (pending) {
        currentStatus = 'Uploading file';
    } else if (!valueFromProps) {
        currentStatus = 'No file selected';
    } else if (option && option.id === valueFromProps) {
        currentStatus = option.title;
    } else {
        currentStatus = '?';
    }

    const [value, setValue] = useState<File | undefined>();

    return (
        <FileInput
            {...otherProps}
            value={value}
            onChange={setValue}
            disabled={disabled || pending}
            name={name}
            onChange={handleChange}
            overrideStatus
            status={currentStatus}
        />
    );
}
export default DeepFileInput;
