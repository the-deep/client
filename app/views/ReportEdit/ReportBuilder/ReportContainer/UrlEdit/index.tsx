import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
    ExpandableContainer,
} from '@the-deep/deep-ui';
import {
    type SetValueArg,
    type Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import {
    type UrlConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: UrlConfigType | undefined;
    onChange: (value: SetValueArg<UrlConfigType | undefined>, name: NAME) => void;
    error?: Error<UrlConfigType>;
    disabled?: boolean;
}

function UrlEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        name,
        onChange,
        error: riskyError,
        disabled,
    } = props;

    const onFieldChange = useFormObject<
        NAME, UrlConfigType
    >(name, onChange, {});

    const error = getErrorObject(riskyError);

    return (
        <div className={_cs(className, styles.urlEdit)}>
            <ExpandableContainer
                heading="General"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <TextInput
                    value={value?.url}
                    name="url"
                    onChange={onFieldChange}
                    error={error?.url}
                    disabled={disabled}
                />
            </ExpandableContainer>
        </div>
    );
}

export default UrlEdit;
