import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';

import Upload from './Upload';
import Details from './Details';
import styles from './styles.scss';

interface Props {
    className?: string;
}

function BulkUpload(props: Props) {
    const {
        className,
    } = props;

    return (
        <Container
            className={_cs(styles.bulkUpload, className)}
            heading={_ts('bulkUpload', 'title')}
            contentClassName={styles.content}
        >
            <Upload
                className={styles.upload}
            />
            <Details
                className={styles.details}
            />
        </Container>
    );
}

export default BulkUpload;
