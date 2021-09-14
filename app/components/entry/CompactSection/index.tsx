import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
    Container,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
} from '@togglecorp/toggle-form';

import { Widget } from '#types/newAnalyticalFramework';
import CompactAttributeInput, { Props as AttributeInputProps } from '#components/framework/CompactAttributeInput';
import { PartialEntryType } from '#views/Project/EntryEdit/schema';

import styles from './styles.css';

const widgetKeySelector = (d: Widget) => d.clientId;
type WidgetAttribute = NonNullable<PartialEntryType['attributes']>[number];

export interface Props {
    className?: string;
    widgets: Widget[] | undefined | null;
    title?: string;
    onAttributeChange: (val: SetValueArg<WidgetAttribute>, index: number | undefined) => void;
    attributesMap: Partial<Record<string, { index: number, value: WidgetAttribute }>>;
    readOnly?: boolean;
    emptyValueHidden?: boolean;
    disabled?: boolean;
}

function CompactSection(props: Props) {
    const {
        className,
        title,
        onAttributeChange,
        widgets,
        attributesMap,
        emptyValueHidden,
        readOnly,
        disabled,
    } = props;

    const widgetsWithValue = useMemo(() => {
        if (!emptyValueHidden) {
            return widgets;
        }
        return widgets?.filter(
            // FIXME: should only check into data, not value
            (widget) => isDefined(attributesMap?.[widget.clientId]?.value?.data?.value),
        );
    }, [emptyValueHidden, attributesMap, widgets]);

    const widgetRendererParams = useCallback(
        (key: string, data: Widget): AttributeInputProps<number | undefined> => {
            const attribute = attributesMap[key];
            return {
                name: attribute?.index,
                value: attribute?.value,
                widget: data,
                onChange: onAttributeChange,
                readOnly,
                disabled,
            };
        },
        [onAttributeChange, attributesMap, readOnly, disabled],
    );

    return (
        <Container
            className={_cs(className, styles.compactSection)}
            heading={title}
            headingSize="extraSmall"
        >
            <ListView
                data={widgetsWithValue ?? undefined}
                keySelector={widgetKeySelector}
                renderer={CompactAttributeInput}
                rendererParams={widgetRendererParams}
            />
        </Container>
    );
}

export default CompactSection;
