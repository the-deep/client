import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
    isNotDefined,
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
    NumberOutput,
    Tag,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import {
    WidgetType as WidgetRaw,
    AnalysisFrameworkDetailType,
} from '#generated/types';
// FIXME: move this component
import {
    PartialAttributeType,
    PartialEntryType,
} from '#components/entry/schema';

import { Entry } from '#components/entry/types';
import { GeoArea } from '#components/GeoMultiSelectInput';
import ExcerptInput from '#components/entry/ExcerptInput';
import {
    Widget,
    WidgetHint,
} from '#types/newAnalyticalFramework';
import { DeepReplace } from '#utils/types';

import CompactSection from '../CompactSection';
import styles from './styles.css';

export type Framework = DeepReplace<AnalysisFrameworkDetailType, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, Widget>;
type Section = NonNullable<Framework['primaryTagging']>[number];

const sectionKeySelector = (d: Section) => d.clientId;

interface EntryInputProps<T extends string | number | undefined> {
    className?: string;

    leadId: string;

    name: T;
    value: PartialEntryType;
    onChange: (val: SetValueArg<PartialEntryType>, name: T) => void;
    error: Error<PartialEntryType> | undefined;
    onAddButtonClick?: (entryId: string, sectionId?: string) => void;
    addButtonHidden?: boolean;
    hideEntryId?: boolean;

    widgetsHints?: WidgetHint[];
    recommendations?: PartialAttributeType[];

    sectionContainerClassName?: string;
    secondaryTaggingContainerClassName?: string;
    readOnly?: boolean;

    emptyValueHidden?: boolean;
    primaryTagging: Section[] | undefined | null;
    secondaryTagging: Widget[] | undefined | null;
    variant?: 'normal' | 'compact' | 'nlp';

    entryImage: Entry['image'] | undefined | null;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    excerptHeaderActions?: React.ReactNode;
    onApplyToAll?: (entryId: string, widgetId: string, applyBelowOnly?: boolean) => void;

    allWidgets: Widget[] | undefined | null;
    rightComponent?: React.ReactNode;
    noPaddingInWidgetContainer?: boolean;

    excerptShown?: boolean;
    displayHorizontally?: boolean;
    relevant?: boolean;
}

function EntryInput<T extends string | number | undefined>(props: EntryInputProps<T>) {
    const {
        allWidgets,
        className,
        value,
        onAddButtonClick,
        addButtonHidden,
        hideEntryId,
        primaryTagging,
        secondaryTagging,
        sectionContainerClassName,
        secondaryTaggingContainerClassName,
        readOnly,
        emptyValueHidden = false,
        name,
        onChange,
        leadId,
        variant = 'normal',
        entryImage,
        widgetsHints,
        error: riskyError,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        excerptHeaderActions,
        recommendations,
        onApplyToAll,
        rightComponent,
        noPaddingInWidgetContainer = false,
        excerptShown = false,
        displayHorizontally = false,
        relevant = true,
    } = props;

    const error = getErrorObject(riskyError);

    const defaultOptionVal = useCallback(
        (): PartialEntryType => ({
            clientId: `auto-${randomString()}`,
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
        addButtonHidden,
        entryClientId: value.clientId,
        widgetsHints,
        recommendations,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        onApplyToAll,
        emptyMessageHidden: variant === 'nlp',
        suggestionMode: variant === 'nlp',
        allWidgets,
        rightComponent,
        noPadding: noPaddingInWidgetContainer,
    }), [
        variant,
        allWidgets,
        widgetsHints,
        recommendations,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        onAddButtonClick,
        emptyValueHidden,
        addButtonHidden,
        onAttributeChange,
        attributesMap,
        readOnly,
        error?.attributes,
        value.clientId,
        onApplyToAll,
        rightComponent,
        noPaddingInWidgetContainer,
    ]);

    const compactMode = variant === 'compact' || variant === 'nlp';

    return (
        <div
            className={_cs(
                className,
                styles.entryInput,
            )}
        >
            {!relevant && (
                <Tag
                    variant="gradient1"
                    className={styles.tag}
                >
                    Untagged Entry
                </Tag>
            )}
            <div
                className={_cs(
                    styles.content,
                    compactMode && styles.compact,
                    displayHorizontally && styles.horizontal,
                )}
            >
                <NonFieldError error={error} />
                {(!compactMode || excerptShown) && (
                    <Container
                        className={styles.excerpt}
                        heading={(
                            <>
                                {!hideEntryId && isDefined(value.id) && (
                                    <NumberOutput
                                        className={styles.entryId}
                                        prefix="#"
                                        value={Number(value.id)}
                                    />
                                )}
                                {!hideEntryId && isNotDefined(value.id) && (
                                    <span className={styles.unsavedEntry}>(unsaved entry)</span>
                                )}
                            </>
                        )}
                        headingSize="extraSmall"
                        headingClassName={styles.heading}
                        headerActions={excerptHeaderActions}
                        headerActionsContainerClassName={styles.headerActions}
                        headingSectionClassName={styles.headingSection}
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
                    rendererClassName={_cs(
                        styles.section,
                        sectionContainerClassName,
                        compactMode && styles.compact,
                        displayHorizontally && styles.horizontal,
                    )}
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
                    geoAreaOptions={geoAreaOptions}
                    onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                    addButtonHidden={addButtonHidden}
                    onApplyToAll={onApplyToAll}
                    entryClientId={value.clientId}
                    allWidgets={allWidgets}
                    widgetsHints={widgetsHints}
                    recommendations={recommendations}
                    emptyMessageHidden={variant === 'nlp'}
                    suggestionMode={variant === 'nlp'}
                    rightComponent={rightComponent}
                    noPadding={noPaddingInWidgetContainer}
                />
            </div>
        </div>
    );
}

export default EntryInput;
