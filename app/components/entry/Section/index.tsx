import React, { useCallback, useMemo } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    ListView,
    Kraken,
} from '@the-deep/deep-ui';
import { SetValueArg, Error, getErrorObject } from '@togglecorp/toggle-form';
import {
    IoGitBranchOutline,
} from 'react-icons/io5';

import { GeoArea } from '#components/GeoMultiSelectInput';
import NonFieldError from '#components/NonFieldError';
import { Widget, getHiddenWidgetIds } from '#types/newAnalyticalFramework';
import AttributeInput, { Props as AttributeInputProps } from '#components/framework/AttributeInput';
import { PartialEntryType } from '#views/Project/EntryEdit/schema';

import styles from './styles.css';

const widgetKeySelector = (d: Widget) => d.clientId;
type WidgetAttribute = NonNullable<PartialEntryType['attributes']>[number];

interface Props {
    // NOTE: if allWidgets is null/undefined/empty then the conditional widgets will be visible
    allWidgets: Widget[] | undefined | null;

    widgets: Widget[] | undefined | null;
    onAttributeChange: (val: SetValueArg<WidgetAttribute>, index: number | undefined) => void;
    error: Error<WidgetAttribute[]> | undefined;
    attributesMap: Partial<Record<string, { index: number, value: WidgetAttribute }>>;
    readOnly?: boolean;
    disabled?: boolean;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
}

function Section(props: Props) {
    const {
        allWidgets,
        onAttributeChange,
        widgets,
        attributesMap,
        readOnly,
        disabled,
        error: riskyError,
        geoAreaOptions,
        onGeoAreaOptionsChange,
    } = props;

    const filteredWidgets = useMemo(
        () => {
            const hiddenWidgetIds = getHiddenWidgetIds(
                allWidgets ?? [],
                Object.values(attributesMap)
                    .filter(isDefined)
                    .map((item) => item.value),
            );
            return widgets?.filter((w) => !hiddenWidgetIds[w.id]);
        },
        [allWidgets, attributesMap, widgets],
    );

    const error = getErrorObject(riskyError);

    const widgetRendererParams = useCallback(
        (key: string, data: Widget): AttributeInputProps<number | undefined> => {
            const attribute = attributesMap[key];
            const err = attribute
                ? error?.[attribute.value.clientId]
                : undefined;

            return {
                className: _cs(
                    styles.widgetContainer,
                    data.width === 'HALF' && styles.halfWidget,
                    data.conditional && styles.conditional,
                ),
                icons: data.conditional && (
                    <IoGitBranchOutline
                        title="This is a child widget"
                    />
                ),
                name: attribute?.index,
                value: attribute?.value,
                widget: data,
                onChange: onAttributeChange,
                readOnly,
                disabled,
                error: err,
                geoAreaOptions,
                onGeoAreaOptionsChange,
            };
        },
        [
            onAttributeChange,
            attributesMap,
            readOnly,
            disabled,
            error,
            geoAreaOptions,
            onGeoAreaOptionsChange,
        ],
    );

    return (
        <>
            <NonFieldError error={error} />
            <ListView
                className={_cs(
                    styles.section,
                    (filteredWidgets?.length ?? 0) < 1 && styles.empty,
                )}
                data={filteredWidgets}
                keySelector={widgetKeySelector}
                renderer={AttributeInput}
                rendererParams={widgetRendererParams}
                emptyMessage="There are no widgets in this section."
                filtered={(filteredWidgets?.length ?? 0) > 0}
                errored={false}
                filteredEmptyMessage="No matching widgets found"
                pending={false}
                emptyIcon={(
                    <Kraken
                        size="large"
                        variant="sleep"
                    />
                )}
                messageShown
                messageIconShown
            />
        </>
    );
}
export default Section;
