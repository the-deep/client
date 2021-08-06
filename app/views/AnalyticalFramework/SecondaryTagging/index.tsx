import React, { useCallback, useState, useMemo } from 'react';

import {
    ElementFragments,
    Button,
    Container,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import useLocalStorage from '#hooks/useLocalStorage';
import FrameworkImageButton from '#components/FrameworkImageButton';

import _ts from '#ts';

import { PartialWidget } from '../WidgetPreview';
import Canvas from '../Canvas';
import WidgetEditor from '../WidgetEditor';
import WidgetList from '../WidgetList';
import { Widget } from '#types/newAnalyticalFramework';

import {
    findWidget,
    injectWidget,
    deleteWidget,
} from './utils';

import styles from './styles.css';

interface Props {
    className?: string;
    frameworkId: number;
}

function SecondaryTagging(props: Props) {
    const {
        className,
        frameworkId,
    } = props;

    // NOTE: intentional console.info
    // eslint-disable-next-line no-console
    console.info('secondary tagging in the framework', frameworkId);

    const [widgets, setWidgets] = useLocalStorage<Widget[]>('secondaryTagging', []);

    const [tempWidget, setTempWidget] = useState<PartialWidget | undefined>();

    const handleWidgetAdd = useCallback(
        (value: PartialWidget) => {
            setTempWidget(value);
        },
        [],
    );

    const handleWidgetDeleteClick = useCallback(
        (widgetId: string) => {
            setWidgets((oldWidgets) => deleteWidget(oldWidgets, widgetId));
        },
        [setWidgets],
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
            setWidgets(orderedWidgets);
        },
        [setWidgets],
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
            setWidgets((oldWidgets) => injectWidget(oldWidgets, value));
        },
        [setWidgets],
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
                horizontallyCompactContent
            >
                {!widgetsState.editMode && (
                    <WidgetList
                        sectionsDisabled
                        onWidgetAdd={handleWidgetAdd}
                    />
                )}
                {widgetsState.editMode && tempWidget && (
                    <WidgetEditor
                        name={undefined}
                        initialValue={tempWidget}
                        onChange={handleTempWidgetChange}
                        onSave={handleTempWidgetSave}
                        onCancel={handleWidgetEditCancel}
                    />
                )}
            </Container>
            <div className={styles.frameworkPreview}>
                <div className={styles.topBar}>
                    <ElementFragments
                        actions={(
                            <Button
                                name={undefined}
                                disabled
                            >
                                {_ts('analyticalFramework.secondaryTagging', 'nextButtonLabel')}
                            </Button>
                        )}
                    >
                        <FrameworkImageButton
                            frameworkId={frameworkId}
                            label={_ts('analyticalFramework.secondaryTagging', 'viewFrameworkImageButtonLabel')}
                            variant="secondary"
                        />
                    </ElementFragments>
                </div>
                <div className={styles.canvas}>
                    {widgetsState.editMode ? (
                        <Canvas
                            name={undefined}
                            widgets={widgetsState.appliedWidgets}
                            editMode
                            isSecondary
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
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default SecondaryTagging;
