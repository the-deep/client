import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type SetValueArg,
    type Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    ExpandableContainer,
    TextInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import { AnalysisReportUploadType } from '#generated/types';
import FileUpload from '../../FileUpload';
import {
    type ImageConfigType,
    type ImageContentStyleFormType,
} from '../../../schema';
import TextElementsStylesEdit from '../TextElementsStylesEdit';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: ImageConfigType | undefined;
    onChange: (value: SetValueArg<ImageConfigType | undefined>, name: NAME) => void;
    onFileUpload: (file: AnalysisReportUploadType) => void;
    error?: Error<ImageConfigType>;
    disabled?: boolean;
}

function ImageEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        error: riskyError,
        onFileUpload,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject<
        NAME, ImageConfigType
    >(name, onChange, {});

    const onStyleChange = useFormObject<
        'style', ImageContentStyleFormType
    >('style', onFieldChange, {});

    return (
        <div className={_cs(className, styles.imageEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="General"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                defaultVisibility
                withoutBorder
            >
                <FileUpload
                    onSuccess={onFileUpload}
                    acceptFileType="image/*"
                    disabled={disabled}
                />
                <TextInput
                    value={value?.altText}
                    label="Alternate text"
                    name="altText"
                    onChange={onFieldChange}
                    error={error?.altText}
                    disabled={disabled}
                />
                <TextInput
                    value={value?.caption}
                    label="Caption"
                    name="caption"
                    onChange={onFieldChange}
                    error={error?.caption}
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
                <TextElementsStylesEdit
                    name="caption"
                    label="Caption"
                    value={value?.style?.caption}
                    onChange={onStyleChange}
                />
            </ExpandableContainer>
        </div>
    );
}

export default ImageEdit;
