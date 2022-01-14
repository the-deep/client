import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
    Button,
    Container,
} from '@the-deep/deep-ui';
import {
    // Error,
    SetValueArg,
    Error,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import { Widget } from '#types/newAnalyticalFramework';
import _ts from '#ts';

import { PartialWidget } from '#components/framework/AttributeInput';
import Canvas from '../components/Canvas';
import WidgetEditor from '../components/WidgetEditor';
import WidgetConditionalEditor from '../components/WidgetConditionalEditor';
import WidgetList from '../components/WidgetList';
import { cloneWidget } from '../utils';

import {
    findWidget,
    injectWidget,
    injectWidgetConditional,
    deleteWidget,
    TempConditional,
} from './utils';

import { WidgetsType } from '../schema';

import styles from './styles.css';

interface Props<K extends string> {
    className?: string;
    frameworkId: number | undefined;

    allWidgets: WidgetsType | undefined;

    name: K;
    value: WidgetsType | undefined;
    onChange: (value: SetValueArg<WidgetsType | undefined>, name: K) => void;
    error: Error<WidgetsType> | undefined;
    disabled?: boolean;
    onTempStateChange: (disabled: boolean) => void;
}

function SecondaryTagging<K extends string>(props: Props<K>) {
    const {
        className,
        frameworkId,

        allWidgets = [],

        value: widgetsFromProps = [],
        onChange: setWidgetsFromProps,
        name,
        disabled,
        error: errorFromProps,
        onTempStateChange,
    } = props;

    // NOTE: we are casting to a more stricter version of Widget
    const widgets = widgetsFromProps;
    const setWidgets = setWidgetsFromProps;
    const error = errorFromProps;

    const [tempWidget, setTempWidget] = useState<PartialWidget | undefined>();

    const [conditional, setConditional] = useState<TempConditional | undefined>();

    const handleWidgetAdd = useCallback(
        (value: PartialWidget) => {
            setTempWidget(value);
        },
        [],
    );

    const handleWidgetDeleteClick = useCallback(
        (widgetId: string) => {
            setWidgets((oldWidgets) => deleteWidget(oldWidgets, widgetId), name);
        },
        [setWidgets, name],
    );

    const handleWidgetEditClick = useCallback(
        (widgetId: string) => {
            const widget = findWidget(widgets, widgetId);
            if (widget) {
                setTempWidget(widget);
            }
        },
        [widgets],
    );

    const handleWidgetConditionEditClick = useCallback(
        (widgetId: string) => {
            const widget = findWidget(widgets, widgetId);
            if (widget) {
                setConditional({
                    widgetId,
                    value: widget.conditional,
                    title: widget.title,
                });
            }
        },
        [widgets],
    );

    const handleWidgetCloneClick = useCallback(
        (widgetId: string) => {
            const widget = findWidget(widgets, widgetId);
            if (widget) {
                const clonedWidget = cloneWidget(widget);
                if (clonedWidget) {
                    setTempWidget(clonedWidget);
                }
            }
        },
        [widgets],
    );

    const handleWidgetOrderChange = useCallback(
        (newWidgets: Widget[]) => {
            const orderedWidgets = newWidgets.map((v, i) => ({ ...v, order: i + 1 }));
            setWidgets(orderedWidgets, name);
        },
        [setWidgets, name],
    );

    const handleWidgetEditCancel = useCallback(
        () => {
            setTempWidget(undefined);
        },
        [],
    );

    const handleTempWidgetChange = useCallback(
        (value: PartialWidget) => {
            setTempWidget(value);
        },
        [],
    );

    const handleTempWidgetSave = useCallback(
        (value: Widget) => {
            setTempWidget(undefined);
            setWidgets((oldWidgets) => injectWidget(oldWidgets, value), name);
        },
        [setWidgets, name],
    );

    const handleConditionalEditCancel = useCallback(
        () => {
            setConditional(undefined);
        },
        [],
    );

    const handleConditionalChange = useCallback(
        (value: TempConditional['value'] | undefined, meta: { widgetId: string, title?: string }) => {
            setConditional({ ...meta, value });
        },
        [],
    );

    const handleConditionalSave = useCallback(
        (value: TempConditional['value'], meta: { widgetId: string, title?: string }) => {
            setWidgets((oldWidgets) => {
                const newValue = injectWidgetConditional(
                    oldWidgets,
                    { widgetId: meta.widgetId, value },
                );
                return newValue;
            }, name);
            setConditional(undefined);
        },
        [setWidgets, name],
    );

    type AppliedWidgets = {
        editMode: false;
        appliedWidgets: Widget[];
    } | {
        editMode: true;
        appliedWidgets: PartialWidget[];
    };

    const widgetsState: AppliedWidgets = useMemo(
        () => {
            if (conditional) {
                return {
                    editMode: true,
                    appliedWidgets: injectWidgetConditional(widgets, conditional),
                };
            }
            if (tempWidget) {
                return {
                    editMode: true,
                    appliedWidgets: injectWidget(widgets, tempWidget),
                };
            }
            return {
                editMode: false,
                appliedWidgets: widgets,
            };
        },
        [tempWidget, widgets, conditional],
    );

    useEffect(() => {
        onTempStateChange(widgetsState.editMode);
    }, [widgetsState.editMode, onTempStateChange]);

    return (
        <div className={_cs(styles.secondaryTagging, className)}>
            <Container
                className={styles.widgetListContainer}
                heading={_ts('analyticalFramework.secondaryTagging', 'buildingModulesHeading')}
                contentClassName={styles.content}
            >
                {!widgetsState.editMode && (
                    <WidgetList
                        sectionsDisabled
                        onWidgetAdd={handleWidgetAdd}
                        disabled={disabled}
                    />
                )}
                {widgetsState.editMode && tempWidget && (
                    // NOTE: no need to disable as this is used as modal
                    <WidgetEditor
                        name={undefined}
                        initialValue={tempWidget}
                        onChange={handleTempWidgetChange}
                        onSave={handleTempWidgetSave}
                        onCancel={handleWidgetEditCancel}
                    />
                )}
                {widgetsState.editMode && conditional && (
                    // NOTE: no need to disable as this is used as modal
                    <WidgetConditionalEditor
                        widgets={allWidgets}
                        // FIXME: we may not need to pass conditional as name
                        name={conditional}
                        title={conditional.title}
                        value={conditional.value}
                        widgetId={conditional.widgetId}
                        onChange={handleConditionalChange}
                        onSave={handleConditionalSave}
                        onCancel={handleConditionalEditCancel}
                    />
                )}
            </Container>
            <Container
                className={styles.frameworkPreview}
                headerIcons={frameworkId && (
                    <FrameworkImageButton
                        frameworkId={frameworkId}
                        label={_ts('analyticalFramework.secondaryTagging', 'viewFrameworkImageButtonLabel')}
                        variant="secondary"
                    />
                )}
                headerActions={(
                    <Button
                        name={undefined}
                        disabled
                    >
                        {_ts('analyticalFramework.secondaryTagging', 'nextButtonLabel')}
                    </Button>
                )}
                contentClassName={styles.canvas}
            >
                {widgetsState.editMode ? (
                    <Canvas
                        name={undefined}
                        widgets={widgetsState.appliedWidgets}
                        editMode
                        isSecondary
                        disabled={disabled}
                        error={error}
                    />
                ) : (
                    <Canvas
                        name={undefined}
                        widgets={widgetsState.appliedWidgets}
                        onWidgetDelete={handleWidgetDeleteClick}
                        onWidgetEdit={handleWidgetEditClick}
                        onWidgetOrderChange={handleWidgetOrderChange}
                        onWidgetClone={handleWidgetCloneClick}
                        onWidgetConditionEdit={handleWidgetConditionEditClick}
                        editMode={false}
                        isSecondary
                        disabled={disabled}
                        error={error}
                    />
                )}
            </Container>
        </div>
    );
}

export default SecondaryTagging;
