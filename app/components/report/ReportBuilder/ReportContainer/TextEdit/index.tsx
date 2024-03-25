import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    useFormObject,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import { ExpandableContainer } from '@the-deep/deep-ui';

import MarkdownEditor from '#components/MarkdownEditor';
import NonFieldError from '#components/NonFieldError';

import {
    type TextConfigType,
    type TextContentStyleFormType,
} from '../../../schema';
import TextElementsStylesEdit from '../TextElementsStylesEdit';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: TextConfigType | undefined;
    onChange: (value: SetValueArg<TextConfigType | undefined>, name: NAME) => void;
    error?: Error<TextConfigType>;
    disabled?: boolean;
}

function TextEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        onChange,
        name,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject<
        NAME, TextConfigType
    >(name, onChange, {});

    const onStyleChange = useFormObject<
        'style', TextContentStyleFormType
    >('style', onFieldChange, {});

    return (
        <div className={_cs(className, styles.textEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="General"
                headingSize="small"
                spacing="compact"
                errored={analyzeErrors(error?.content)}
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
            </ExpandableContainer>
        </div>
    );
}

export default TextEdit;
