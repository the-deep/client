import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Error, getErrorObject, analyzeErrors } from '@togglecorp/toggle-form';
import { ListView } from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import { Widget } from '#types/newAnalyticalFramework';
import WidgetPreview from '#components/framework/WidgetPreview';

import styles from './styles.css';

interface WidgetProps {
    className?: string;
    widget: Widget;
    clientId: string;
    onWidgetValueChange: (value: unknown, widgetName: string) => void;
    disabled?: boolean;
}

function WidgetWrapper(props: WidgetProps) {
    const {
        className,
        widget,
        clientId,
        onWidgetValueChange,
        disabled,
    } = props;

    return (
        <WidgetPreview
            className={className}
            key={clientId}
            name={clientId}
            value={undefined}
            onChange={onWidgetValueChange}
            widget={widget}
            readOnly={disabled}
        />
    );
}

const widgetKeySelector = (d: Widget) => d.clientId;

interface Props<T> {
    name: T;
    isSecondary?: boolean;
    disabled?: boolean;
    error?: Error<Widget[]> | undefined;
    widgets: Widget[] | undefined;
}

function Canvas<T>(props: Props<T>) {
    const {
        name,
        /*
        widgets,
        onWidgetDelete,
        onWidgetEdit,
        onWidgetOrderChange,
        */
        disabled,
        isSecondary = false,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);

    const handleWidgetValueChange = useCallback(
        (_: unknown, widgetName: string) => {
            // NOTE: when we start work no tagging page, we need to handle this
            // for preview page, we can skip this as the components are disabled any way
            // eslint-disable-next-line no-console
            console.warn(`Trying to edit widget ${widgetName} from section ${name}`);
        },
        [name],
    );

    const widgetRendererParams = useCallback((key: string, data: Widget) => ({
        clientId: key,
        className: _cs(
            styles.widgetContainer,
            analyzeErrors(error?.[key]) && styles.errored,
            (isSecondary && data?.width === 'HALF') && styles.halfWidget,
        ),
        isSecondary,
        widget: data,
        onWidgetValueChange: handleWidgetValueChange,
        disabled,
    }), [
        isSecondary,
        handleWidgetValueChange,
        disabled,
        error,
    ]);

    return (
        <>
            <NonFieldError
                error={error}
            />
            <ListView
                className={styles.canvas}
                // eslint-disable-next-line react/destructuring-assignment
                data={props.widgets}
                keySelector={widgetKeySelector}
                renderer={WidgetWrapper}
                rendererParams={widgetRendererParams}
            />
        </>
    );
}
export default Canvas;
