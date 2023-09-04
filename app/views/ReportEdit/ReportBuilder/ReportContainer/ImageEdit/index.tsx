import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    ExpandableContainer,
    TextInput,
} from '@the-deep/deep-ui';

import { AnalysisReportUploadType } from '#generated/types';
import FileUpload from '../../FileUpload';
import {
    type ImageConfigType,
    type ImageContentStyleFormType,
} from '../../../schema';
import TextElementsStylesEdit from '../TextElementsStylesEdit';

import styles from './styles.css';

interface Props {
    className?: string;
    value: ImageConfigType | undefined;
    onFieldChange: (...entries: EntriesAsList<ImageConfigType>) => void;
    onFileUpload: (file: AnalysisReportUploadType) => void;
    error?: Error<ImageConfigType>;
    disabled?: boolean;
    additionalStylingSettings?: React.ReactNode;
}

function ImageEdit(props: Props) {
    const {
        className,
        value,
        onFieldChange,
        error: riskyError,
        additionalStylingSettings,
        onFileUpload,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);

    const onStyleChange = useFormObject<
        'style', ImageContentStyleFormType
    >('style', onFieldChange, {});

    return (
        <div className={_cs(className, styles.imageEdit)}>
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
                {additionalStylingSettings}
            </ExpandableContainer>
        </div>
    );
}

export default ImageEdit;
