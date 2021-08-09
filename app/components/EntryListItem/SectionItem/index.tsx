import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
    Obj,
} from '@togglecorp/fujs';
import {
    ListView,
    Container,
} from '@the-deep/deep-ui';

import {
    Widget,
} from '#types/newAnalyticalFramework';
import {
    WidgetValue,
} from '#types/newEntry';
import ListWidgetPreview from '#views/AnalyticalFramework/ListWidgetPreview';

import styles from './styles.css';

const widgetKeySelector = (d: Widget) => d.clientId;

interface Props {
    className?: string;
    widgets: Widget[];
    title?: string;
    onChange: (newVal: unknown, widgetName: string) => void;
    attributesMap: Obj<WidgetValue>;
}

function SectionItem(props: Props) {
    const {
        className,
        title,
        onChange,
        widgets,
        attributesMap,
    } = props;

    const widgetsWithValue = useMemo(() => (
        widgets.filter(
            (widget) => isDefined(attributesMap[widget.clientId]?.data?.value),
        )
    ), [attributesMap, widgets]);

    const widgetRendererParams = useCallback((key: string, data: Widget) => ({
        name: key,
        clientId: key,
        value: attributesMap[key]?.data?.value,
        widget: data,
        onChange,
    }), [onChange, attributesMap]);

    return (
        <Container
            className={_cs(className, styles.sectionItem)}
            heading={title}
            headingSize="extraSmall"
            horizontallyCompactContent
        >
            <ListView
                data={widgetsWithValue}
                keySelector={widgetKeySelector}
                renderer={ListWidgetPreview}
                rendererParams={widgetRendererParams}
            />
        </Container>
    );
}

export default SectionItem;
