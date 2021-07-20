import React, { useEffect } from 'react';
import { useLazyRequest } from '#utils/request';

import { FileLike, FileUploadResponse } from '../../types';

interface Props<T> {
    isFormData?: boolean;
    bodyTransformer: (v: T) => void;
    url: string;
    onSuccess: (v: FileLike) => void;
    onFailure: () => void;
    active: boolean;
    data: T;
}

function UploadItem<T extends FileLike>(props: Props<T>) {
    const {
        onSuccess,
        onFailure,
        active,
        data,
        isFormData,
        bodyTransformer,
        url,
    } = props;

    const {
        trigger: uploadFile,
    } = useLazyRequest<FileUploadResponse, T>({
        url,
        method: 'POST',
        formData: isFormData,
        body: ctx => bodyTransformer(ctx),
        onSuccess: (response) => {
            onSuccess({ ...data, isUploaded: true, response });
        },
        onFailure: () => {
            onFailure();
        },
    });

    useEffect(() => {
        if (active) {
            uploadFile(data);
        }
    }, [active, uploadFile, data]);

    return <></>;
}

export default UploadItem;
