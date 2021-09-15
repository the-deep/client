import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { ListView } from '@the-deep/deep-ui';
import { SetValueArg, Error, getErrorObject } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { Widget } from '#types/newAnalyticalFramework';
import AttributeInput, { Props as AttributeInputProps } from '#components/framework/AttributeInput';
import { PartialEntryType } from '#views/Project/EntryEdit/schema';

import styles from './styles.css';

const widgetKeySelector = (d: Widget) => d.clientId;
type WidgetAttribute = NonNullable<PartialEntryType['attributes']>[number];

interface Props {
    widgets: Widget[] | undefined | null;
    onAttributeChange: (val: SetValueArg<WidgetAttribute>, index: number | undefined) => void;
    error: Error<WidgetAttribute[]> | undefined;
    attributesMap: Partial<Record<string, { index: number, value: WidgetAttribute }>>;
    readOnly?: boolean;
    disabled?: boolean;
}

function Section(props: Props) {
    const {
        onAttributeChange,
        widgets,
        attributesMap,
        readOnly,
        disabled,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    const widgetRendererParams = useCallback(
        (key: string, data: Widget): AttributeInputProps<number | undefined> => {
            const attribute = attributesMap[key];
            const err = error?.[key];
            return {
                className: _cs(
                    styles.widgetContainer,
                    data?.width === 'HALF' && styles.halfWidget,
                ),
                name: attribute?.index,
                value: attribute?.value,
                widget: data,
                onChange: onAttributeChange,
                readOnly,
                disabled,
                error: err,
            };
        },
        [onAttributeChange, attributesMap, readOnly, disabled, error],
    );

    return (
        <>
            <NonFieldError error={error} />
            <ListView
                className={styles.section}
                data={widgets ?? undefined}
                keySelector={widgetKeySelector}
                renderer={AttributeInput}
                rendererParams={widgetRendererParams}
            />
        </>
    );
}
export default Section;
