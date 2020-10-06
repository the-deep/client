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
    droppableOverviewWidgets,
    droppableListWidgets,
    getSchemaForWidget,
    getComputeSchemaForWidget,
} from '#utils/widget';

import {
    VIEW,
    fetchWidgetTagComponent,
} from '#widgets';

import WidgetErrorWrapper from '#components/general/WidgetErrorWrapper';
import WidgetContentWrapper from '#components/general/WidgetContentWrapper';

import styles from './styles.scss';

export interface WidgetFormProps {
    className?: string;
    entry: EntryFields;
    framework: FrameworkFields;
    mode: string;
}

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

function WidgetForm(props: WidgetFormProps) {
    const {
        entry: entryFromProps,
        className,
        framework,
        mode,
    } = props;

    const { widgets } = framework;
    const [entry, setEntry] = React.useState(entryFromProps);

    const handleChange = React.useCallback((faramValues) => {
        setEntry(oldEntry => ({ ...oldEntry, attributes: faramValues }));
    }, [setEntry]);

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
        } = entry;

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
    }, [entry]);

    const onExcerptChange = React.useCallback(() => {}, []);

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
        } = entry;

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
                // tabularFieldData: tabularData,
                entryKey: entry.id,
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
    }, [mode, entry, onExcerptChange]);

    const [schema, computeSchema] = React.useMemo(() => {
        const widgetComputeSchema = {
            fields: {},
        };

        const widgetSchema = {
            fields: {},
        };

        widgets.forEach((widget) => {
            const computeSchemaForWidget = getComputeSchemaForWidget(widget, widgets);

            if (computeSchemaForWidget) {
                widgetComputeSchema.fields[widget.id] = {
                    fields: {
                        data: {
                            fields: {
                                value: computeSchemaForWidget,
                            },
                        },
                    },
                };
            }

            widgetSchema.fields[widget.id] = {
                fields: {
                    id: [],
                    data: getSchemaForWidget(widget),
                },
            };
        });

        return [
            widgetSchema,
            widgetComputeSchema,
        ];
    }, [widgets]);

    return (
        <Faram
            className={className}
            onChange={handleChange}
            schema={schema}
            computeSchema={computeSchema}
            value={entry.attributes}
            error={{}}
        >
            <GridViewLayout
                data={widgets}
                layoutSelector={layoutSelector}
                itemHeaderModifier={getWidgetHeader}
                itemContentModifier={getWidgetContent}
                keySelector={d => d.key}
                itemClassName={styles.widget}
            />
        </Faram>
    );
}

export default WidgetForm;
