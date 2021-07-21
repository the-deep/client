import React, { useCallback } from 'react';

import {
    Container,
    List,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import { FileUploadResponse } from '../types';
import UploadedItem from './UploadedItem';

const keySelector = (d: FileUploadResponse): number => d.id;

interface Props {
    className?: string;
    files: FileUploadResponse[];
}

function UploadedList(props: Props) {
    const {
        className,
        files,
    } = props;

    const fileRendererParams = useCallback((_: number, value: FileUploadResponse) => ({
        name: value.title,
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
