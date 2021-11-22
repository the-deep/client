import React, { useCallback, useMemo } from 'react';
import {
    Button,
    Container,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    randomString,
} from '@togglecorp/fujs';

import { Widget } from '#types/newAnalyticalFramework';

import GeoLocationConditionalWidgetForm from './GeoLocationConditionalWidgetForm';
import TextConditionalWidgetForm from './TextConditionalWidgetForm';
import SingleSelectConditionalWidgetForm from './SingleSelectConditionalWidgetForm';
import ScaleConditionalWidgetForm from './ScaleConditionalWidgetForm';
import NumberConditionalWidgetForm from './NumberConditionalWidgetForm';
import DateConditionalWidgetForm from './DateConditionalWidgetForm';
import TimeConditionalWidgetForm from './TimeConditionalWidgetForm';
import DateRangeConditionalWidgetForm from './DateRangeConditionalWidgetForm';
import TimeRangeConditionalWidgetForm from './TimeRangeConditionalWidgetForm';

interface BaseFormContainerProps {
    title: string | undefined;
    onCancel: () => void;
    onSave: () => void;
    children?: React.ReactNode;
}
function BaseFormContainer(props: BaseFormContainerProps) {
    const {
        title,
        onCancel,
        onSave,
        children,
    } = props;
    return (
        <Container
            heading={title}
            headerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={onCancel}
                        variant="tertiary"
                    // FIXME: use strings
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        type="submit"
                        onClick={onSave}
                    >
                        Save
                    </Button>
                </>
            )}
        >
            {children}
        </Container>
    );
}

function widgetKeySelector(value: Widget) {
    return value.clientId;
}
function widgetLabelSelector(value: Widget) {
    return value.title;
}

interface Props<T> {
    name: T;
    value: Widget['conditional'],
    title: string | undefined,
    widgets: Widget[];
    onChange: (value: Widget['conditional'], name: T) => void;
    onSave: (value: Widget['conditional'], name: T) => void;
    onCancel: () => void;
    className?: string;
}
function WidgetConditionalEditor<T>(props: Props<T>) {
    const {
        name,
        value,
        onSave,
        onCancel,
        onChange,
        className,
        widgets,
        title,
    } = props;

    const handleSave = useCallback(
        (val: Widget['conditional']) => {
            onSave(val, name);
        },
        [onSave, name],
    );

    const handleUnhandledSave = useCallback(
        () => {
            handleSave(value);
        },
        [value, handleSave],
    );

    const handleWidgetSelection = useCallback(
        (widgetId: string | undefined) => {
            if (!widgetId) {
                onChange(undefined, name);
            }
            const widget = widgets.find((w) => w.clientId === widgetId);
            if (!widget) {
                // eslint-disable-next-line no-console
                console.error('Widget not found');
                return;
            }
            // NOTE: we are passing changed value to parent because we aren't
            // storing this value locally on this component
            onChange({
                id: undefined,
                parentId: undefined,
                clientId: randomString(),
                parentClientId: widget.clientId,
                parentWidgetId: widget.widgetId,
                conditions: [{
                    key: randomString(),
                    order: 1,
                    conjunctionOperator: 'AND',
                    invert: false,
                    operator: 'empty',
                }],
            }, name);
        },
        [widgets, onChange, name],
    );

    const parentWidget = useMemo(
        () => (
            value
                ? widgets.find((widget) => widget.clientId === value.parentClientId)
                : undefined
        ),
        [widgets, value],
    );

    const parentSwitcher = (
        <SelectInput
            label="Parent Widget"
            name={undefined}
            options={widgets}
            keySelector={widgetKeySelector}
            labelSelector={widgetLabelSelector}
            value={value?.parentClientId}
            error={undefined}
            onChange={handleWidgetSelection}
        />
    );

    if (!value) {
        return (
            <BaseFormContainer
                title={title}
                onSave={handleUnhandledSave}
                onCancel={onCancel}
            >
                {parentSwitcher}
            </BaseFormContainer>
        );
    }

    switch (value.parentWidgetId) {
        case 'TEXT': {
            return (
                <TextConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                >
                    {parentSwitcher}
                </TextConditionalWidgetForm>
            );
        }
        case 'NUMBER': {
            return (
                <NumberConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                >
                    {parentSwitcher}
                </NumberConditionalWidgetForm>
            );
        }
        case 'GEO': {
            return (
                <GeoLocationConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                >
                    {parentSwitcher}
                </GeoLocationConditionalWidgetForm>
            );
        }
        case 'DATE': {
            return (
                <DateConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                >
                    {parentSwitcher}
                </DateConditionalWidgetForm>
            );
        }
        case 'TIME': {
            return (
                <TimeConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                >
                    {parentSwitcher}
                </TimeConditionalWidgetForm>
            );
        }
        case 'DATE_RANGE': {
            return (
                <DateRangeConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                >
                    {parentSwitcher}
                </DateRangeConditionalWidgetForm>
            );
        }
        case 'TIME_RANGE': {
            return (
                <TimeRangeConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                >
                    {parentSwitcher}
                </TimeRangeConditionalWidgetForm>
            );
        }
        case 'SELECT': {
            return (
                <SingleSelectConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                    parentWidget={parentWidget?.widgetId === 'SELECT' ? parentWidget : undefined}
                >
                    {parentSwitcher}
                </SingleSelectConditionalWidgetForm>
            );
        }
        case 'SCALE': {
            return (
                <ScaleConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                    parentWidget={parentWidget?.widgetId === 'SCALE' ? parentWidget : undefined}
                >
                    {parentSwitcher}
                </ScaleConditionalWidgetForm>
            );
        }
        default: {
            return (
                <BaseFormContainer
                    title={title}
                    onSave={handleUnhandledSave}
                    onCancel={onCancel}
                >
                    {parentSwitcher}
                    <div> Not implemented </div>
                </BaseFormContainer>
            );
        }
    }
}

export default WidgetConditionalEditor;
