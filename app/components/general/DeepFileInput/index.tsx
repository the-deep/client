import React, { useCallback, useState } from 'react';
import { FileInput, FileInputProps } from '@the-deep/deep-ui';

import { useLazyRequest } from '#base/utils/restRequest';

interface Option {
    id: number;
    title: string;
    file: string; // this is a url
    mimeType: string;
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
        url: 'server://files/',
        method: 'POST',
        body: (ctx) => ({
            file: ctx,
            title: ctx.name,
            isPublic,
        }),
        onSuccess: (response) => {
            onChange(response.id, name);
            setOption(response);
        },
        onFailure: () => {
            // FIXME: handle error
            // eslint-disable-next-line no-console
            console.error('Could not upload file!');
        },
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
            disabled={disabled || pending}
            name={name}
            overrideStatus
            status={currentStatus}
            value={value}
            onChange={handleChange}
            multiple={false}
        />
    );
}
export default DeepFileInput;
