import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    ExpandableContainer,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';

import DatasetsConfigureButton from '../../DatasetsConfigureButton';
import {
    type TextConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    onChange: (value: SetValueArg<TextConfigType | undefined>, name: NAME) => void;
    error?: Error<TextConfigType>;
}

function TimeseriesChartEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        onChange,
        name,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    return (
        <div className={_cs(className, styles.timeseriesChartEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="Configure"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <DatasetsConfigureButton />
            </ExpandableContainer>
        </div>
    );
}

export default TimeseriesChartEdit;
