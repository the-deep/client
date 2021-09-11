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
import ExcerptOutput from '#components/entry/ExcerptOutput';
import { Widget } from '#types/newAnalyticalFramework';
import { DeepReplace } from '#utils/types';

import SectionItem from './SectionItem';
import styles from './styles.css';

export type Framework = DeepReplace<AnalysisFrameworkDetailType, WidgetRaw, Widget>;
type Section = NonNullable<Framework['primaryTagging']>[number];

const sectionKeySelector = (d: Section) => d.clientId;

const defaultOptionVal = (): PartialEntryType => ({
    clientId: randomString(),
    entryType: 'EXCERPT',
    // FIXME: get this from parent
    lead: 'get-this-from-parent',
});

interface EntryInputProps<T extends string | number | undefined> {
    className?: string;

    index?: number;
    name: T;
    value: PartialEntryType;
    onChange: (val: SetValueArg<PartialEntryType>, name: T) => void;
    // TODO: error

    hideExcerpt?: boolean;
    sectionContainerClassName?: string;
    secondaryTaggingContainerClassName?: string;
    readOnly?: boolean;

    emptyValueHidden?: boolean;
    primaryTagging: Section[] | undefined | null;
    secondaryTagging: Widget[] | undefined | null;
}
function EntryInput<T extends string | number | undefined>(props: EntryInputProps<T>) {
    const {
        className,
        value,
        hideExcerpt = false,
        primaryTagging,
        secondaryTagging,
        sectionContainerClassName,
        secondaryTaggingContainerClassName,
        readOnly,
        emptyValueHidden = false,
        name,
        index,
        onChange,
    } = props;

    const onFieldChange = useFormObject(name, onChange, defaultOptionVal);

    // FIXME: move this inside attributes
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
        <div className={_cs(className, styles.entryInput)}>
            {!hideExcerpt && (
                <Container
                    className={styles.excerpt}
                    heading={isDefined(index) ? `Entry ${index + 1}` : undefined}
                    headingSize="extraSmall"
                >
                    <ExcerptOutput
                        entryType={value.entryType}
                        excerpt={value.excerpt}
                        droppedExcerpt={value.droppedExcerpt}
                        // TODO: instead of passing image id, we should pass image object
                        // Should work similarly to SearchSelectInput
                        // image={value.image}
                        image={undefined}
                        // TODO: edit excerpt
                    />
                </Container>
            )}
            <List
                data={primaryTagging ?? undefined}
                rendererParams={sectionRendererParams}
                rendererClassName={_cs(styles.section, sectionContainerClassName)}
                renderer={SectionItem}
                keySelector={sectionKeySelector}
            />
            <SectionItem
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
