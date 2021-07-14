import React from 'react';

import {
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';

interface Props {
    className?: string;
}

function Details(props: Props) {
    const {
        className,
    } = props;

    return (
        <div
            className={className}
        >
            <Container
                heading={_ts('bulkUpload', 'sourcesUploadedTitle')}
                sub
            />
        </div>
    );
}

export default Details;
