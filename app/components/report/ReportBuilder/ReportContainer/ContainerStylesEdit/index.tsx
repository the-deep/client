import React from 'react';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    ExpandableContainer,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';

import {
    type ContainerStyleFormType,
} from '../../../schema';
import PaddingEdit from '../PaddingEdit';
import BorderEdit from '../BorderEdit';
import BackgroundEdit from '../BackgroundEdit';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: ContainerStyleFormType | undefined;
    onChange: (value: SetValueArg<ContainerStyleFormType | undefined>, name: NAME) => void;
    error?: Error<ContainerStyleFormType>;
    disabled?: boolean;
    additionalStylingSettings?: React.ReactNode;
}

function ContainerStylesEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        onChange,
        error: riskyError,
        disabled,
        additionalStylingSettings,
        name,
    } = props;

    const onFieldChange = useFormObject<
        NAME, ContainerStyleFormType
    >(name, onChange, {});

    const error = getErrorObject(riskyError);

    return (
        <ExpandableContainer
            className={className}
            heading="Container"
            headingSize="small"
            spacing="compact"
            contentClassName={styles.expandedBody}
            withoutBorder
        >
            <NonFieldError error={error} />
            {additionalStylingSettings}
            <BorderEdit
                name="border"
                value={value?.border}
                onChange={onFieldChange}
                disabled={disabled}
                error={error?.border}
            />
            <PaddingEdit
                name="padding"
                value={value?.padding}
                onChange={onFieldChange}
                disabled={disabled}
                error={error?.padding}
            />
            <BackgroundEdit
                name="background"
                value={value?.background}
                onChange={onFieldChange}
                // disabled={disabled}
                error={error?.background}
            />
        </ExpandableContainer>
    );
}

export default ContainerStylesEdit;
