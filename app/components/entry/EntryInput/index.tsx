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
} from '@togglecorp/toggle-form';
import {
    List,
    Container,
} from '@the-deep/deep-ui';

import {
    WidgetType as WidgetRaw,
    AnalysisFrameworkDetailType,
} from '#generated/types';
// FIXME: move this component
import { PartialEntryType } from '#views/Project/EntryEdit/schema';
import { Entry } from '#views/Project/EntryEdit/types';
import ExcerptOutput from '#components/entry/ExcerptOutput';
import { Widget } from '#types/newAnalyticalFramework';
import { DeepReplace } from '#utils/types';

import CompactSection from '../CompactSection';
import styles from './styles.css';

export type Framework = DeepReplace<AnalysisFrameworkDetailType, WidgetRaw, Widget>;
type Section = NonNullable<Framework['primaryTagging']>[number];

const sectionKeySelector = (d: Section) => d.clientId;

interface EntryInputProps<T extends string | number | undefined> {
    className?: string;

    leadId: string;

    index?: number;
    name: T;
    value: PartialEntryType;
    onChange: (val: SetValueArg<PartialEntryType>, name: T) => void;
    // TODO: error

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
    } = props;

    const defaultOptionVal = useCallback(
        (): PartialEntryType => ({
            clientId: randomString(),
            entryType: 'EXCERPT',
            lead: leadId,
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

    const sectionRendererParams = useCallback((_: string, sectionItem: Section) => ({
        title: sectionItem.title,
        widgets: sectionItem.widgets,
        onAttributeChange,
        attributesMap,
        readOnly,
        emptyValueHidden,
    }), [emptyValueHidden, onAttributeChange, attributesMap, readOnly]);

    return (
        <div
            className={_cs(
                className,
                compact && styles.compact,
                styles.entryInput,
            )}
        >
            {!compact && (
                <Container
                    className={styles.excerpt}
                    heading={isDefined(index) ? `Entry ${index + 1}` : undefined}
                    headingSize="extraSmall"
                >
                    <ExcerptOutput
                        entryType={value.entryType}
                        excerpt={value.excerpt}
                        droppedExcerpt={value.droppedExcerpt}
                        image={entryImage}
                        imageRaw={value.imageRaw}
                        // FIXME: pass this after image drag/drop is implemented
                        leadImageUrl={undefined}
                        // TODO: edit excerpt
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
                emptyValueHidden={emptyValueHidden}
                widgets={secondaryTagging}
            />
        </div>
    );
}

export default EntryInput;
