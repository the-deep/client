import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Faram, { FaramGroup } from '@togglecorp/faram';

import Icon from '#rscg/Icon';
import GridViewLayout from '#rscv/GridViewLayout';

import { EntryFields } from '#typings/entry';
import {
    FrameworkFields,
    WidgetElement as WidgetFields,
} from '#typings/framework';

import {
    levelOneWidgets,
    levelTwoWidgets,
} from '#utils/widget';

import { fetchWidgetTagComponent } from '#widgets';

import WidgetErrorWrapper from '#components/general/WidgetErrorWrapper';
import WidgetContentWrapper from '#components/general/WidgetContentWrapper';

import styles from './styles.scss';

const widgetKeySelector = (d: { id: string }) => d.id;

interface WidgetHeaderProps {
    hasError: boolean;
    error: string;
}

function getWidgetHeaderComponent(isExcerptWidget: boolean, title: string) {
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
    value: EntryFields;
    framework: FrameworkFields;
    mode: string;
    onAttributesChange: (newValue: EntryFields['attributes'], errors: object) => void;
    onExcerptChange: (newExcerptData: object) => void;
    schema: object;
    computeSchema: object;
    error: object;
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

    const layoutSelector = React.useCallback((widget) => {
        const {
            properties: {
                listGridLayout,
                overviewGridLayout,
            } = {},
        } = widget;

        return (mode === 'list' ? listGridLayout : overviewGridLayout);
    }, [mode]);

    const getWidgetHeader = React.useCallback((widget) => {
        const {
            id,
            title,
            widgetId,
        } = widget;

        const {
            attributes: {
                [id]: {
                    data,
                } = {},
            },
        } = value;

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
    }, [value]);

    const getWidgetContent = React.useCallback((widget: WidgetFields<unknown>) => {
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
                data={widgets}
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
