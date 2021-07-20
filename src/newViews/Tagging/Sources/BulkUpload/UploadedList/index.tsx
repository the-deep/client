import React, { useCallback } from 'react';

import {
    Container,
    List,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import { FileLike } from '../types';
import UploadedItem from './UploadedItem';

const keySelector = (d: FileLike): string => d.key;

interface Props {
    className?: string;
    files: FileLike[];
}

function UploadedList(props: Props) {
    const {
        className,
        files,
    } = props;

    const fileRendererParams = useCallback((_: string, value: FileLike) => ({
        isUploaded: value.isUploaded,
        name: value.name,
    }), []);
    return (
        <div
            className={className}
        >
            <Container
                heading={_ts('bulkUpload', 'sourcesUploadedTitle')}
                sub
            >
                <List
                    data={files}
                    renderer={UploadedItem}
                    keySelector={keySelector}
                    rendererParams={fileRendererParams}
                />
            </Container>
        </div>
    );
}

export default UploadedList;
