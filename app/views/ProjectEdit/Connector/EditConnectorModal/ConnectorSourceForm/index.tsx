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

import {
    PartialSourceType,
} from '../../schema';

import styles from './styles.css';

interface Props {
    className?: string;
    name: number | undefined;
    value: PartialSourceType;
    error: Error<PartialSourceType>;
    onChange: (val: SetValueArg<PartialSourceType>, name: number | undefined) => void;
}

function ConnectorSourceForm(props: Props) {
    const {
        className,
        name,
        value,
        onChange,
        error: riskyError,
    } = props;

    const setFieldValue = useFormObject(name, onChange, value);
    const error = getErrorObject(riskyError);

    return (
        <Container
            className={_cs(className, styles.connectorSourceForm)}
            heading={value.title ?? value.source}
            headingSize="extraSmall"
        >
            <TextInput
                name="title"
                label="Title"
                value={value.title}
                onChange={setFieldValue}
                error={error?.title}
            />
        </Container>
    );
}

export default ConnectorSourceForm;
