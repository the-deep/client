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
import MultiSelectConditionalWidgetForm from './MultiSelectConditionalWidgetForm';
import Matrix1dConditionalWidgetForm from './Matrix1dConditionalWidgetForm';
import Matrix2dConditionalWidgetForm from './Matrix2dConditionalWidgetForm';
import OrganigramConditionalWidgetForm from './OrganigramConditionalWidgetForm';
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
    return value.id;
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
            const widget = widgets.find((w) => w.id === widgetId);
            if (!widget) {
                // eslint-disable-next-line no-console
                console.error('Widget not found');
                return;
            }
            // NOTE: we are passing changed value to parent because we aren't
            // storing this value locally on this component
            onChange({
                parentWidget: widget.id,
                parentWidgetType: widget.widgetId,
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
                ? widgets.find((widget) => widget.id === value.parentWidget)
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
            value={value?.parentWidget}
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

    switch (value.parentWidgetType) {
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
        case 'MULTISELECT': {
            return (
                <MultiSelectConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                    parentWidget={parentWidget?.widgetId === 'MULTISELECT' ? parentWidget : undefined}
                >
                    {parentSwitcher}
                </MultiSelectConditionalWidgetForm>
            );
        }
        case 'MATRIX1D': {
            return (
                <Matrix1dConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                    parentWidget={parentWidget?.widgetId === 'MATRIX1D' ? parentWidget : undefined}
                >
                    {parentSwitcher}
                </Matrix1dConditionalWidgetForm>
            );
        }
        case 'MATRIX2D': {
            return (
                <Matrix2dConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                    parentWidget={parentWidget?.widgetId === 'MATRIX2D' ? parentWidget : undefined}
                >
                    {parentSwitcher}
                </Matrix2dConditionalWidgetForm>
            );
        }
        case 'ORGANIGRAM': {
            return (
                <OrganigramConditionalWidgetForm
                    className={className}
                    initialValue={value}
                    title={title}
                    onSave={handleSave}
                    onCancel={onCancel}
                    parentWidget={parentWidget?.widgetId === 'ORGANIGRAM' ? parentWidget : undefined}
                >
                    {parentSwitcher}
                </OrganigramConditionalWidgetForm>
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
