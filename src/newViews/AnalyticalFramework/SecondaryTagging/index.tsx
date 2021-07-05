import React, { useCallback, useState, useMemo } from 'react';

import {
    ElementFragments,
    ImagePreview,
    Button,
    Container,
    Modal,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';
import useLocalStorage from '#hooks/useLocalStorage';

import _ts from '#ts';

import { PartialWidget } from '../WidgetPreview';
import Canvas from '../Canvas';
import WidgetEditor from '../WidgetEditor';
import WidgetList from '../WidgetList';
import { Widget } from '../types';

import {
    findWidget,
    injectWidget,
    deleteWidget,
} from './utils';
import styles from './styles.scss';

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
    console.info('secondary tagging in the framework', frameworkId);

    const [
        showPreviewModal,
        setShowPreviewModalTrue,
        setShowPreviewModalFalse,
    ] = useModalState(false);

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
            setWidgets(oldWidgets => deleteWidget(oldWidgets, widgetId));
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
        (newWidgets: PartialWidget[]) => {
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
            setWidgets(oldWidgets => injectWidget(oldWidgets, value));
        },
        [setWidgets],
    );

    const appliedWidgets = useMemo(
        () => {
            if (tempWidget) {
                return injectWidget(widgets, tempWidget);
            }
            return widgets;
        },
        [tempWidget, widgets],
    );

    const editMode = !!tempWidget;

    return (
        <div className={_cs(styles.secondaryTagging, className)}>
            <Container
                className={styles.widgetListContainer}
                heading={_ts('analyticalFramework.secondaryTagging', 'buildingModulesHeading')}
                contentClassName={styles.content}
                horizontallyCompactContent
            >
                {!editMode && (
                    <WidgetList
                        sectionsDisabled
                        onWidgetAdd={handleWidgetAdd}
                    />
                )}
                {editMode && tempWidget && (
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
                        <Button
                            name={undefined}
                            variant="secondary"
                            onClick={setShowPreviewModalTrue}
                        >
                            {_ts('analyticalFramework.secondaryTagging', 'viewFrameworkImageButtonLabel')}
                        </Button>
                    </ElementFragments>
                </div>
                <div className={styles.canvas}>
                    <Canvas
                        name={undefined}
                        widgets={appliedWidgets}
                        onWidgetDelete={handleWidgetDeleteClick}
                        onWidgetEdit={handleWidgetEditClick}
                        onWidgetOrderChange={handleWidgetOrderChange}
                        editMode={editMode}
                        isSecondary
                    />
                </div>
            </div>
            {showPreviewModal && (
                <Modal
                    className={styles.frameworkImagePreviewModal}
                    onCloseButtonClick={setShowPreviewModalFalse}
                    bodyClassName={styles.body}
                >
                    <ImagePreview
                        className={styles.preview}
                        src="https://i.imgur.com/3Zk4aNH.jpg"
                        alt="Under construction"
                    />
                </Modal>
            )}
        </div>
    );
}

export default SecondaryTagging;
