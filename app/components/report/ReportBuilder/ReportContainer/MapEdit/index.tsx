import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ExpandableContainer,
} from '@the-deep/deep-ui';
import {
    type SetValueArg,
    type Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import GeoDataUploadButton from '../../GeoDataUploadButton';
import {
    type MapConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: MapConfigType | undefined;
    onChange: (value: SetValueArg<MapConfigType | undefined>, name: NAME) => void;
    error?: Error<MapConfigType>;
    disabled?: boolean;
}

function MapEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        name,
        onChange,
        error: riskyError,
        disabled,
    } = props;

    const onFieldChange = useFormObject<
        NAME, MapConfigType
    >(name, onChange, {});

    const error = getErrorObject(riskyError);

    return (
        <div className={_cs(className, styles.mapEdit)}>
            <NonFieldError error={error} />
            <GeoDataUploadButton />
            <ExpandableContainer
                heading="General"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                Here
            </ExpandableContainer>
        </div>
    );
}

export default MapEdit;
