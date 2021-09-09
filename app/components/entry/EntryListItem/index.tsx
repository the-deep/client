import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import {
    List,
    ListView,
    Container,
} from '@the-deep/deep-ui';

import {
    EntryType,
    WidgetType as WidgetRaw,
    AnalysisFrameworkDetailType,
} from '#generated/types';
import ExcerptOutput from '#components/entry/ExcerptOutput';
import { Widget } from '#types/newAnalyticalFramework';
import ListWidgetPreview from '#components/framework/ListWidgetPreview';
import { DeepReplace } from '#utils/types';

import SectionItem, { Props as SectionProps } from './SectionItem';
import styles from './styles.css';

export type Framework = DeepReplace<AnalysisFrameworkDetailType, WidgetRaw, Widget>;
type Section = NonNullable<Framework['primaryTagging']>[number];

const sectionKeySelector = (d: Section) => d.clientId;
const widgetKeySelector = (d: Widget) => d.clientId;

interface Props {
    className?: string;
    entry: Pick<EntryType, 'entryType' | 'excerpt' | 'droppedExcerpt' | 'image' | 'attributes'>;
    index?: number;
    hideExcerpt?: boolean;
    sectionContainerClassName?: string;
    secondaryTaggingContainerClassName?: string;
    readOnly?: boolean;

    primaryTagging: Section[] | undefined | null;
    secondaryTagging: Widget[] | undefined | null;
}

function EntryListItem(props: Props) {
    const {
        className,
        index,
        entry: {
            entryType,
            excerpt,
            droppedExcerpt,
            image,
            attributes,
        },
        hideExcerpt = false,
        primaryTagging,
        secondaryTagging,
        sectionContainerClassName,
        secondaryTaggingContainerClassName,
        readOnly,
    } = props;

    const attributesMap = useMemo(() => (
        listToMap(attributes, (d) => d.id, (d) => d)
    ), [attributes]);

    const handleWidgetValueChange = useCallback(
        (newValue: unknown, widgetName: string) => {
            // NOTE: when we start work no tagging page, we need to handle this
            // for preview page, we can skip this as the components are disabled any way
            // eslint-disable-next-line no-console
            console.warn(`Trying to edit widget ${widgetName}`, newValue);
        },
        [],
    );
    const sectionRendererParams = useCallback((_: string, sectionItem: Section): SectionProps => ({
        title: sectionItem.title,
        widgets: sectionItem.widgets,
        onChange: handleWidgetValueChange,
        attributesMap,
        readOnly,
    }), [handleWidgetValueChange, attributesMap, readOnly]);

    const secondaryWidgetsWithValue = useMemo(() => (
        secondaryTagging?.filter(
            (widget) => isDefined(attributesMap?.[widget.clientId]?.data?.value),
        )
    ), [attributesMap, secondaryTagging]);

    const widgetRendererParams = useCallback((key: string, data: Widget) => ({
        name: key,
        clientId: key,
        value: attributesMap?.[key]?.data?.value,
        widget: data,
        onChange: handleWidgetValueChange,
        readOnly,
    }), [handleWidgetValueChange, attributesMap, readOnly]);

    return (
        <div className={_cs(className, styles.entryListItem)}>
            {!hideExcerpt && (
                <Container
                    className={styles.excerpt}
                    heading={index ? `Entry ${index + 1}` : undefined}
                    headingSize="extraSmall"
                >
                    <ExcerptOutput
                        entryType={entryType}
                        excerpt={excerpt}
                        droppedExcerpt={droppedExcerpt}
                        image={image}
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
            <Container
                className={_cs(
                    styles.secondaryTagging,
                    secondaryTaggingContainerClassName,
                )}
                heading="Secondary Tagging"
                headingSize="extraSmall"
            >
                <ListView
                    data={secondaryWidgetsWithValue}
                    keySelector={widgetKeySelector}
                    renderer={ListWidgetPreview}
                    rendererParams={widgetRendererParams}
                />
            </Container>
        </div>
    );
}

export default EntryListItem;
