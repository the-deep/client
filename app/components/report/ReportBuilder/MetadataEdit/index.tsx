import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Checkbox,
    TextInput,
    NumberInput,
    ExpandableContainer,
    Heading,
} from '@the-deep/deep-ui';
import {
    type EntriesAsList,
    type Error,
    useFormObject,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import NewOrganizationMultiSelectInput, {
    BasicOrganization,
} from '#components/selections/NewOrganizationMultiSelectInput';

import {
    type PartialFormType,
    type TextContentStyleFormType,
    type BodyStyleConfig,
    type ImageContentStyleFormType,
    type HeadingContentStyleFormType,
    type ConfigType,
} from '../../schema';
import TextElementsStylesEdit from '../ReportContainer/TextElementsStylesEdit';
import ContainerStylesEdit from '../ReportContainer/ContainerStylesEdit';
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
    disabled?: boolean;
}

function MetadataEdit(props: Props) {
    const {
        className,
        value,
        setFieldValue,
        error: riskyError,
        organizationOptions,
        onOrganizationOptionsChange,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);

    const onConfigChange = useFormObject<
        'configuration', ConfigType
    >('configuration', setFieldValue, {});

    const handleBodyStyleChange = useFormObject<
        'bodyStyle', BodyStyleConfig
    >('bodyStyle', onConfigChange, {});

    const handleTextContentStyleChange = useFormObject<
        'textContentStyle', TextContentStyleFormType
    >('textContentStyle', onConfigChange, {});

    const handleImageContentStyleChange = useFormObject<
        'imageContentStyle', ImageContentStyleFormType
    >('imageContentStyle', onConfigChange, {});

    const handleHeadingContentStyleChange = useFormObject<
        'headingContentStyle', HeadingContentStyleFormType
    >('headingContentStyle', onConfigChange, {});

    const configurationError = getErrorObject(error?.configuration);

    return (
        <div className={_cs(className, styles.metadataEdit)}>
            <TextInput
                name="title"
                label="Title"
                value={value?.title}
                onChange={setFieldValue}
                error={error?.title}
                disabled={disabled}
            />
            <TextInput
                name="subTitle"
                label="Subtitle"
                value={value?.subTitle}
                onChange={setFieldValue}
                error={error?.subTitle}
                disabled={disabled}
            />
            <TextInput
                name="slug"
                // FIXME: Find better label for this
                label="Slug"
                value={value?.slug}
                onChange={setFieldValue}
                error={error?.slug}
                disabled={disabled}
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
                disabled={disabled}
            />
            <Checkbox
                name="isPublic"
                label="Shared Publicly"
                value={value?.isPublic}
                onChange={setFieldValue}
                // FIXME: Error is not implemented on checkbox
                // error={error?.isPublic}
                disabled={disabled}
            />
            <ContainerStylesEdit
                name="containerStyle"
                value={value?.configuration?.containerStyle}
                error={configurationError?.containerStyle}
                onChange={onConfigChange}
            />
            <ExpandableContainer
                heading="Body"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <NumberInput
                    label="Gap"
                    value={value?.configuration?.bodyStyle?.gap}
                    error={getErrorObject(configurationError?.bodyStyle)?.gap}
                    name="gap"
                    onChange={handleBodyStyleChange}
                />
            </ExpandableContainer>
            <ExpandableContainer
                heading="Text"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <TextElementsStylesEdit
                    name="content"
                    value={value?.configuration?.textContentStyle?.content}
                    onChange={handleTextContentStyleChange}
                    error={getErrorObject(configurationError?.textContentStyle)?.content}
                />
            </ExpandableContainer>
            <ExpandableContainer
                heading="Image"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <TextElementsStylesEdit
                    name="caption"
                    value={value?.configuration?.imageContentStyle?.caption}
                    onChange={handleImageContentStyleChange}
                    error={getErrorObject(configurationError?.imageContentStyle)?.caption}
                />
            </ExpandableContainer>
            <ExpandableContainer
                heading="Heading"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <Heading size="extraSmall">H1</Heading>
                <TextElementsStylesEdit
                    name="h1"
                    value={value?.configuration?.headingContentStyle?.h1}
                    onChange={handleHeadingContentStyleChange}
                    error={getErrorObject(configurationError?.headingContentStyle)?.h1}
                />
                <Heading size="extraSmall">H2</Heading>
                <TextElementsStylesEdit
                    name="h2"
                    value={value?.configuration?.headingContentStyle?.h2}
                    onChange={handleHeadingContentStyleChange}
                    error={getErrorObject(configurationError?.headingContentStyle)?.h2}
                />
                <Heading size="extraSmall">H3</Heading>
                <TextElementsStylesEdit
                    name="h3"
                    value={value?.configuration?.headingContentStyle?.h3}
                    onChange={handleHeadingContentStyleChange}
                    error={getErrorObject(configurationError?.headingContentStyle)?.h3}
                />
                <Heading size="extraSmall">H4</Heading>
                <TextElementsStylesEdit
                    name="h4"
                    value={value?.configuration?.headingContentStyle?.h4}
                    onChange={handleHeadingContentStyleChange}
                    error={getErrorObject(configurationError?.headingContentStyle)?.h4}
                />
            </ExpandableContainer>
        </div>
    );
}

export default MetadataEdit;
