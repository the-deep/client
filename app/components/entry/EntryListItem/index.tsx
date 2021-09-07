import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import {
    List,
    Container,
} from '@the-deep/deep-ui';

import { Entry } from '#types/newEntry';
import ExcerptOutput from '#components/entry/ExcerptOutput';
import {
    Widget,
    Section,
} from '#types/newAnalyticalFramework';
import ListWidgetPreview from '#components/framework/ListWidgetPreview';

import SectionItem from './SectionItem';

import styles from './styles.css';

const sectionKeySelector = (d: Section) => d.clientId;
const widgetKeySelector = (d: Widget) => d.clientId;

interface Props {
    className?: string;
    entry: Entry;
    index?: number;
    hideExcerpt?: boolean;
    sectionContainerClassName?: string;
    secondaryTaggingContainerClassName?: string;
    readOnly?: boolean;

    primaryTagging: Section[] | undefined;
    secondaryTagging: Widget[] | undefined;
}

function EntryListItem(props: Props) {
    const {
        className,
        index,
        entry: {
            entryType,
            excerpt,
            imageDetails,
            tabularFieldData,
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
    const sectionRendererParams = useCallback((_: string, sectionItem: Section) => ({
        title: sectionItem.title,
        widgets: sectionItem.widgets,
        onChange: handleWidgetValueChange,
        attributesMap,
        readOnly,
    }), [handleWidgetValueChange, attributesMap, readOnly]);

    const secondaryWidgetsWithValue = useMemo(() => (
        secondaryTagging?.filter(
            (widget) => isDefined(attributesMap[widget.clientId]?.data?.value),
        )
    ), [attributesMap, secondaryTagging]);

    const widgetRendererParams = useCallback((key: string, data: Widget) => ({
        name: key,
        clientId: key,
        value: attributesMap[key]?.data?.value,
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
                        imageDetails={imageDetails}
                        tabularFieldData={tabularFieldData}
                    />
                </Container>
            )}
            <List
                data={primaryTagging}
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
                <List
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
