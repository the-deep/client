import React, { useCallback, useState, useMemo } from 'react';
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

import FrameworkImageButton from '#components/FrameworkImageButton';
import { Widget } from '#types/newAnalyticalFramework';
import _ts from '#ts';

import { PartialWidget } from '#components/framework/WidgetPreview';
import Canvas from '../components/Canvas';
import WidgetEditor from '../components/WidgetEditor';
import WidgetList from '../components/WidgetList';

import {
    findWidget,
    injectWidget,
    deleteWidget,
} from './utils';

import { WidgetsType } from '../schema';

import styles from './styles.css';

interface Props<K extends string> {
    className?: string;
    frameworkId: number | undefined;

    name: K;
    value: WidgetsType | undefined;
    onChange: (value: SetValueArg<WidgetsType>, name: K) => void;
    error: Error<WidgetsType> | undefined;
    disabled?: boolean;
}

function SecondaryTagging<K extends string>(props: Props<K>) {
    const {
        className,
        frameworkId,

        value: widgetsFromProps = [],
        onChange: setWidgetsFromProps,
        name,
        disabled,
        error: errorFromProps,
    } = props;

    // NOTE: we are casting to a more stricter version of Widget
    const widgets = widgetsFromProps as Widget[];
    const setWidgets = setWidgetsFromProps as (value: SetValueArg<Widget[]>, name: K) => void;
    const error = errorFromProps as Error<Widget[]>;

    const [tempWidget, setTempWidget] = useState<PartialWidget | undefined>();

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

    const handleWidgetOrderChange = useCallback(
        (newWidgets: Widget[]) => {
            const orderedWidgets = newWidgets.map((v, i) => ({ ...v, order: i }));
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

    type AppliedWidgets = {
        editMode: false;
        appliedWidgets: Widget[];
    } | {
        editMode: true;
        appliedWidgets: PartialWidget[];
    };

    const widgetsState: AppliedWidgets = useMemo(
        () => {
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
        [tempWidget, widgets],
    );

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
