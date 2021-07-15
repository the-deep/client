import React from 'react';

import {
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';

interface Props {
    className?: string;
}

function Upload(props: Props) {
    const {
        className,
    } = props;

    return (
        <Container
            className={className}
            heading={_ts('bulkUpload', 'uploadFilesTitle')}
            sub
        />
    );
}

export default Upload;
