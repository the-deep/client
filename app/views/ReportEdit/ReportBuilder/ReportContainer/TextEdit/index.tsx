import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ExpandableContainer } from '@the-deep/deep-ui';

import MarkdownEditor from '#components/MarkdownEditor';

import {
    type TextConfigType,
    type TextContentStyleFormType,
} from '../../../schema';
import TextElementsStylesEdit from '../TextElementsStylesEdit';

import styles from './styles.css';

interface Props {
    className?: string;
    value: TextConfigType | undefined;
    onFieldChange: (...entries: EntriesAsList<TextConfigType>) => void;
    error?: Error<TextConfigType>;
    disabled?: boolean;
    additionalStylingSettings?: React.ReactNode;
}

function TextEdit(props: Props) {
    const {
        className,
        value,
        onFieldChange,
        error: riskyError,
        disabled,
        additionalStylingSettings,
    } = props;

    const error = getErrorObject(riskyError);

    const onStyleChange = useFormObject<
        'style', TextContentStyleFormType
    >('style', onFieldChange, {});

    return (
        <div className={_cs(className, styles.textEdit)}>
            <ExpandableContainer
                heading="General"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                defaultVisibility
                withoutBorder
            >
                <MarkdownEditor
                    className={styles.editor}
                    label="Content"
                    name="content"
                    onChange={onFieldChange}
                    value={value?.content}
                    error={error?.content}
                    height={300}
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
                    name="content"
                    label="Content"
                    value={value?.style?.content}
                    onChange={onStyleChange}
                />
                {additionalStylingSettings}
            </ExpandableContainer>
        </div>
    );
}

export default TextEdit;
