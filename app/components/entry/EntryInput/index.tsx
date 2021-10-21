import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    SetValueArg,
    useFormObject,
    useFormArray,
    getErrorObject,
    Error,
} from '@togglecorp/toggle-form';
import {
    List,
    Container,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import {
    WidgetType as WidgetRaw,
    AnalysisFrameworkDetailType,
} from '#generated/types';
// FIXME: move this component
import { PartialEntryType } from '#views/Project/EntryEdit/schema';

import { Entry } from '#views/Project/EntryEdit/types';
import ExcerptInput from '#components/entry/ExcerptInput';
import { Widget } from '#types/newAnalyticalFramework';
import { DeepReplace } from '#utils/types';

import CompactSection from '../CompactSection';
import styles from './styles.css';

export type Framework = DeepReplace<AnalysisFrameworkDetailType, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, Widget>;
type Section = NonNullable<Framework['primaryTagging']>[number];

const sectionKeySelector = (d: Section) => d.clientId;

interface EntryInputProps<T extends string | number | undefined> {
    className?: string;

    leadId: string;

    index?: number;
    name: T;
    value: PartialEntryType;
    onChange: (val: SetValueArg<PartialEntryType>, name: T) => void;
    error: Error<PartialEntryType> | undefined;
    onAddButtonClick: (entryId: string, sectionId?: string) => void;

    sectionContainerClassName?: string;
    secondaryTaggingContainerClassName?: string;
    readOnly?: boolean;

    emptyValueHidden?: boolean;
    primaryTagging: Section[] | undefined | null;
    secondaryTagging: Widget[] | undefined | null;
    compact?: boolean;

    entryImage: Entry['image'] | undefined | null;
}

function EntryInput<T extends string | number | undefined>(props: EntryInputProps<T>) {
    const {
        className,
        value,
        onAddButtonClick,
        primaryTagging,
        secondaryTagging,
        sectionContainerClassName,
        secondaryTaggingContainerClassName,
        readOnly,
        emptyValueHidden = false,
        name,
        index,
        onChange,
        leadId,
        compact,
        entryImage,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    const defaultOptionVal = useCallback(
        (): PartialEntryType => ({
            clientId: randomString(),
            entryType: 'EXCERPT',
            lead: leadId,
            excerpt: '',
            droppedExcerpt: '',
        }),
        [leadId],
    );

    const onFieldChange = useFormObject(name, onChange, defaultOptionVal);

    const {
        setValue: onAttributeChange,
    } = useFormArray('attributes', onFieldChange);

    // NOTE: we are creating a map of index and value because we are iterating
    // over widgets but modifying attributes
    const attributesMap = useMemo(() => (
        listToMap(
            value.attributes ?? [],
            (d) => d.widget,
            (d, _, i) => ({
                index: i,
                value: d,
            }),
        )
    ), [value.attributes]);

    const sectionRendererParams = useCallback((sectionId: string, sectionItem: Section) => ({
        title: sectionItem.title,
        widgets: sectionItem.widgets,
        sectionId,
        onAttributeChange,
        attributesMap,
        readOnly,
        emptyValueHidden,
        error: error?.attributes,
        onAddButtonClick,
        entryClientId: value.clientId,
    }), [
        onAddButtonClick,
        emptyValueHidden,
        onAttributeChange,
        attributesMap,
        readOnly,
        error?.attributes,
        value.clientId,
    ]);

    return (
        <div
            className={_cs(
                className,
                compact && styles.compact,
                styles.entryInput,
            )}
        >
            <NonFieldError error={error} />
            {!compact && (
                <Container
                    className={styles.excerpt}
                    heading={isDefined(index) ? `Entry ${index + 1}` : undefined}
                    headingSize="extraSmall"
                    contentClassName={styles.excerptContent}
                >
                    <ExcerptInput
                        className={styles.excerptInput}
                        name="excerpt"
                        onChange={onFieldChange}
                        entryType={value.entryType}
                        value={value.excerpt}
                        // droppedExcerpt={value.droppedExcerpt}
                        image={entryImage}
                        imageRaw={value.imageRaw}
                        readOnly={readOnly}
                        // FIXME: pass this after image drag/drop is implemented
                        leadImageUrl={undefined}
                    />
                </Container>
            )}
            <List
                data={primaryTagging ?? undefined}
                rendererParams={sectionRendererParams}
                rendererClassName={_cs(styles.section, sectionContainerClassName)}
                renderer={CompactSection}
                keySelector={sectionKeySelector}
            />
            <CompactSection
                className={_cs(
                    styles.secondaryTagging,
                    secondaryTaggingContainerClassName,
                )}
                title="Secondary Tagging"
                attributesMap={attributesMap}
                onAttributeChange={onAttributeChange}
                readOnly={readOnly}
                onAddButtonClick={onAddButtonClick}
                emptyValueHidden={emptyValueHidden}
                widgets={secondaryTagging}
                error={error?.attributes}
                entryClientId={value.clientId}
            />
        </div>
    );
}

export default EntryInput;
