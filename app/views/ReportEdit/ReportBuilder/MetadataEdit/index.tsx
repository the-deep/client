import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { TextInput } from '@the-deep/deep-ui';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import NewOrganizationMultiSelectInput, {
    BasicOrganization,
} from '#components/selections/NewOrganizationMultiSelectInput';

import {
    type PartialFormType,
} from '../../schema';
import styles from './styles.css';

interface Props {
    className?: string;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    value: PartialFormType;
    organizationOptions: BasicOrganization[] | undefined | null;
    onOrganizationOptionsChange: React.Dispatch<React.SetStateAction<
        BasicOrganization[] | undefined | null
    >>;
    error?: Error<PartialFormType>;
}

function MetadataEdit(props: Props) {
    const {
        className,
        value,
        setFieldValue,
        error: riskyError,
        organizationOptions,
        onOrganizationOptionsChange,
    } = props;

    const error = getErrorObject(riskyError);

    return (
        <div className={_cs(className, styles.metadataEdit)}>
            <TextInput
                name="title"
                label="Title"
                value={value?.title}
                onChange={setFieldValue}
                error={error?.title}
            />
            <TextInput
                name="subTitle"
                label="Subtitle"
                value={value?.subTitle}
                onChange={setFieldValue}
                error={error?.subTitle}
            />
            <TextInput
                name="slug"
                // FIXME: Find better label for this
                label="Slug"
                value={value?.slug}
                onChange={setFieldValue}
                error={error?.slug}
            />
            <NewOrganizationMultiSelectInput
                className={styles.input}
                name="organizations"
                value={value?.organizations}
                onChange={setFieldValue}
                options={organizationOptions}
                onOptionsChange={onOrganizationOptionsChange}
                label="Organizations"
                error={getErrorString(error?.organizations)}
            />
        </div>
    );
}

export default MetadataEdit;
