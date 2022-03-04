import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
    TextInput,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import {
    PartialSourceType,
} from '../../schema';
import ReliefWebParamsInput from './ReliefWebParamsInput';

import styles from './styles.css';

interface Props<T extends number> {
    className?: string;
    name: T;
    value: PartialSourceType;
    error: Error<PartialSourceType>;
    onChange: (val: SetValueArg<PartialSourceType>, name: T) => void;
    disabled?: boolean;
}

function ConnectorSourceForm<T extends number>(props: Props<T>) {
    const {
        className,
        name,
        value,
        onChange,
        error: riskyError,
        disabled,
    } = props;

    const setFieldValue = useFormObject(name, onChange, value);
    const error = getErrorObject(riskyError);

    return (
        <Container
            className={_cs(className, styles.connectorSourceForm)}
            heading={value.title ?? value.source}
            headingSize="extraSmall"
            contentClassName={styles.content}
        >
            <NonFieldError error={error} />
            <TextInput
                name="title"
                label="Title"
                value={value.title}
                onChange={setFieldValue}
                error={error?.title}
                // TODO: We might not need to change titles
                readOnly
                disabled={disabled}
            />
            {value?.source === 'RELIEF_WEB' && (
                <ReliefWebParamsInput
                    name="params"
                    value={value?.params}
                    onChange={setFieldValue}
                    error={error?.params}
                    disabled={disabled}
                />
            )}
        </Container>
    );
}

export default ConnectorSourceForm;
