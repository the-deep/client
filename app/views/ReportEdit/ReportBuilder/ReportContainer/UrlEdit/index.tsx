import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
    ExpandableContainer,
} from '@the-deep/deep-ui';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import {
    type UrlConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props {
    className?: string;
    value: UrlConfigType | undefined;
    onFieldChange: (...entries: EntriesAsList<UrlConfigType>) => void;
    error?: Error<UrlConfigType>;
    disabled?: boolean;
    additionalStylingSettings?: React.ReactNode;
}

function UrlEdit(props: Props) {
    const {
        className,
        value,
        onFieldChange,
        error: riskyError,
        disabled,
        additionalStylingSettings,
    } = props;

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
            <ExpandableContainer
                heading="Styling"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                {additionalStylingSettings}
            </ExpandableContainer>
        </div>
    );
}

export default UrlEdit;
