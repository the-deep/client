import React from 'react';
import {
    Tag,
} from '@the-deep/deep-ui';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

function TestTag(props: Props) {
    const { className } = props;

    return (
        <Tag
            className={_cs(className, styles.testTag)}
            spacing="compact"
            icons={(
                <IoInformationCircleOutline
                    title="This project has been set as test project by the admin of the project."
                />
            )}
        >
            Test Project
        </Tag>
    );
}

export default TestTag;
