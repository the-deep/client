import React, { useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import Faram, { FaramGroup, Schema, ComputeSchema } from '@togglecorp/faram';

import Icon from '#rscg/Icon';
import GridViewLayout from '#rscv/GridViewLayout';

import { Entry } from '#typings/entry';
import {
    FrameworkFields,
    WidgetElement as WidgetFields,
} from '#typings/framework';

import {
    levelOneWidgets,
    levelTwoWidgets,
} from '#utils/widget';

import { fetchWidgetTagComponent, hasWidgetTagComponent } from '#widgets';

import WidgetErrorWrapper from '#components/general/WidgetErrorWrapper';
import WidgetContentWrapper from '#components/general/WidgetContentWrapper';

import styles from './styles.scss';

const widgetKeySelector = (d: { id: string }) => d.id;

interface WidgetHeaderProps {
    hasError: boolean;
    error: string;
}

function getWidgetHeaderComponent(isExcerptWidget: boolean, title: string | undefined) {
    return (p: WidgetHeaderProps) => {
        const {
            hasError,
            error,
        } = p;

        return (
            <div
                className={_cs(
                    styles.header,
                    hasError ? styles.error : '',
                    isExcerptWidget && styles.excerptWidgetHeader,
                )}
                title={error}
            >
                <h5
                    title={error || title}
                    className={_cs(
                        styles.heading,
                        isExcerptWidget && styles.excerptWidgetHeading,
                    )}
                >
                    { hasError && <Icon name="warning" /> }
                    { hasError ? `${title} : ${error}` : title }
                </h5>
            </div>
        );
    };
}

export interface WidgetFormProps {
    className?: string;
    value: Entry;
    framework: FrameworkFields;
    mode: string;
    onAttributesChange: (newValue: Entry['attributes'], errors: Record<string, unknown>) => void;
    onExcerptChange: (newExcerptData: Record<string, unknown>) => void;
    schema: Schema;
    computeSchema: ComputeSchema;
    error: Record<string, unknown>;
    disabled?: boolean;
}

function WidgetForm(props: WidgetFormProps) {
    const {
        className,
        framework,
        mode,
        value,
        onAttributesChange,
        onExcerptChange,
        schema,
        computeSchema,
        error,
        disabled,
    } = props;

    const { widgets } = framework;

    const layoutSelector = useCallback((widget: WidgetFields<unknown>) => {
        const {
            properties: {
                listGridLayout,
                overviewGridLayout,
            } = {},
        } = widget;

        return (mode === 'list' ? listGridLayout : overviewGridLayout);
    }, [mode]);

    const getWidgetHeader = useCallback((widget: WidgetFields<unknown>) => {
        const {
            id,
            title,
            widgetId,
        } = widget;

        const isExcerptWidget = widgetId === 'excerptWidget';
        const Header = getWidgetHeaderComponent(isExcerptWidget, title);

        return (
            <FaramGroup faramElementName={String(id)}>
                <WidgetErrorWrapper
                    faramElementName="data"
                    renderer={Header}
                />
            </FaramGroup>
        );
    }, []);

    const getWidgetContent = useCallback((widget: WidgetFields<unknown>) => {
        const {
            id,
            widgetId,
            properties: { addedFrom },
        } = widget;

        const {
            entryType,
            excerpt,
            droppedExcerpt,
            image,
            imageDetails,
            imageRaw,
            tabularField,
        } = value;

        let widgetProps: {
            [key: string]: unknown;
        } = {
            widgetName: widgetId,
            widgetType: mode,
            widget,
        };

        if (levelOneWidgets.includes(widgetId)) {
            widgetProps = {
                ...widgetProps,
                entryType,
                excerpt,
                droppedExcerpt,
                image,
                imageDetails,
                imageRaw,
                tabularField,
                // TODO: implement tabular field
                // tabularFieldData: tabularData,
                entryKey: value.id,
            };
        }

        if (levelTwoWidgets.includes(widgetId)) {
            widgetProps = {
                ...widgetProps,
                onExcerptChange,
            };
        }

        const Widget = fetchWidgetTagComponent(
            widgetId,
            mode,
            addedFrom,
        );

        return (
            <WidgetContentWrapper className={styles.content}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        <Widget
                            {...widgetProps}
                        />
                    </FaramGroup>
                </FaramGroup>
            </WidgetContentWrapper>
        );
    }, [mode, value, onExcerptChange]);


    const filteredWidgets = useMemo(
        () => (
            widgets.filter(
                w => hasWidgetTagComponent(w.widgetId, mode, w.properties.addedFrom),
            )
        ),
        [widgets, mode],
    );

    return (
        <Faram
            className={_cs(styles.widgetForm, className)}
            onChange={onAttributesChange}
            schema={schema}
            computeSchema={computeSchema}
            value={value.attributes}
            error={error}
            disabled={disabled}
        >
            <GridViewLayout
                data={filteredWidgets}
                layoutSelector={layoutSelector}
                itemHeaderModifier={getWidgetHeader}
                itemContentModifier={getWidgetContent}
                keySelector={widgetKeySelector}
                itemClassName={styles.widget}
            />
        </Faram>
    );
}

export default WidgetForm;
