import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
    Card,
    Container,
    ContainerCard,
    Header,
    Switch,
} from '@the-deep/deep-ui';

import {
    mockAssistedTags,
    AssistedTag,
    Widget,
    MappingItem,
    isCategoricalMapping,
    categoricalWidgets,
} from '#types/newAnalyticalFramework';
import useLocalStorage from '#hooks/useLocalStorage';

import { WidgetsType } from '../schema';
import CheckButton from './CheckButton';
import WidgetTagList from './WidgetTagList';
import CellGroup from './CellGroup';

import styles from './styles.css';

const nlpLabelGroupKeySelector = (n: AssistedTag) => n.labelGroup;
const nlpLabelKeySelector = (n: AssistedTag) => n.id;
const widgetKeySelector = (n: Widget) => n.clientId;

interface Props {
    className?: string;
    allWidgets: WidgetsType | undefined;
    assistedTaggingEnabled: boolean | undefined;
    onAssistedTaggingStatusChange: (newVal: boolean) => void;
    pending?: boolean;
    frameworkId?: string;
}

function AssistedTagging(props: Props) {
    const {
        frameworkId,
        className,
        allWidgets,
        assistedTaggingEnabled,
        pending,
        onAssistedTaggingStatusChange,
    } = props;

    const [selectedTag, setSelectedTag] = useState<string | undefined>();
    const [mapping, setMapping] = useLocalStorage<MappingItem[] | undefined>(`mapping-${frameworkId}`, undefined);

    const categoricalMapping = mapping?.filter(isCategoricalMapping);

    const widgets = useMemo(() => (
        allWidgets
            ?.filter((w) => (
                isDefined(w.id) && categoricalWidgets.includes(w.widgetId)
            ))
    ), [allWidgets]);

    const geoWidgets = useMemo(() => (
        allWidgets?.filter((w) => isDefined(w.id) && w.widgetId === 'GEO')
    ), [allWidgets]);

    const numberWidgets = useMemo(() => (
        allWidgets?.filter((w) => isDefined(w.id) && w.widgetId === 'NUMBER')
    ), [allWidgets]);

    const nlpLabelGroupRendererParams = useCallback((title: string) => ({
        title,
    }), []);

    const handleTagClick = useCallback((newTag: string) => {
        setSelectedTag((oldTag) => (oldTag === newTag ? undefined : newTag));
    }, []);

    const nlpRendererParams = useCallback((itemKey: string, tag: AssistedTag) => ({
        title: tag.label,
        itemKey,
        value: selectedTag === itemKey,
        mappedCount: categoricalMapping?.filter((m) => m.tagId === itemKey).length ?? 0,
        onTagClick: handleTagClick,
    }), [
        handleTagClick,
        selectedTag,
        categoricalMapping,
    ]);

    const handleGeoWidgetClick = useCallback((widgetClientId: string) => {
        setMapping((oldMapping = []) => {
            const selectedWidgetIndex = oldMapping.findIndex(
                (om) => om.widgetClientId === widgetClientId,
            );
            if (selectedWidgetIndex !== -1) {
                return oldMapping.filter((om) => om.widgetClientId !== widgetClientId);
            }
            return [
                ...oldMapping,
                {
                    widgetType: 'GEO',
                    widgetClientId,
                },
            ];
        });
    }, [setMapping]);

    const geoWidgetsRendererParas = useCallback((itemKey: string, widget: Widget) => ({
        title: widget.title,
        itemKey,
        value: !!mapping?.some((m) => m.widgetClientId === widget.clientId && m.widgetType === 'GEO'),
        onTagClick: handleGeoWidgetClick,
    }), [
        mapping,
        handleGeoWidgetClick,
    ]);

    const handleNumberWidgetClick = useCallback((widgetClientId: string) => {
        setMapping((oldMapping = []) => {
            const selectedWidgetIndex = oldMapping.findIndex(
                (om) => om.widgetClientId === widgetClientId,
            );
            if (selectedWidgetIndex !== -1) {
                return oldMapping.filter((om) => om.widgetClientId !== widgetClientId);
            }
            return [
                ...oldMapping,
                {
                    widgetType: 'NUMBER',
                    widgetClientId,
                },
            ];
        });
    }, [setMapping]);

    const numberWidgetsRendererParas = useCallback((itemKey: string, widget: Widget) => ({
        title: widget.title,
        itemKey,
        value: !!mapping?.find((m) => m.widgetClientId === widget.clientId && m.widgetType === 'NUMBER'),
        onTagClick: handleNumberWidgetClick,
    }), [
        mapping,
        handleNumberWidgetClick,
    ]);

    const handleWidgetMappingChange = useCallback((
        newWidgetMapping: MappingItem[],
        widgetClientId: string,
    ) => {
        setMapping((oldMapping = []) => {
            const filteredMapping = oldMapping.filter((om) => om.widgetClientId !== widgetClientId);
            return [
                ...filteredMapping,
                ...newWidgetMapping,
            ];
        });
    }, [setMapping]);

    const widgetRendererParams = useCallback((_: string, widget: Widget) => ({
        widget,
        mapping: categoricalMapping?.filter((m) => m.widgetClientId === widget.clientId),
        onMappingChange: handleWidgetMappingChange,
        selectedTag,
    }), [
        categoricalMapping,
        selectedTag,
        handleWidgetMappingChange,
    ]);

    return (
        <div className={_cs(className, styles.assistedTagging)}>
            <Header
                className={styles.header}
                heading="Assisted Tagging"
                headingSize="small"
                description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
                actions={(
                    <Switch
                        name="isAssistedTaggingEnabled"
                        value={assistedTaggingEnabled}
                        onChange={onAssistedTaggingStatusChange}
                        disabled={pending}
                        label="Active"
                    />
                )}
            />
            <div className={styles.content}>
                <Card className={styles.card}>
                    <Container
                        className={styles.nlpFramework}
                        headingSize="small"
                        heading="NLP Framework"
                    >
                        <ListView
                            data={mockAssistedTags}
                            renderer={CheckButton}
                            rendererParams={nlpRendererParams}
                            keySelector={nlpLabelKeySelector}
                            filtered={false}
                            pending={false}
                            errored={false}
                            groupRendererParams={nlpLabelGroupRendererParams}
                            groupKeySelector={nlpLabelGroupKeySelector}
                            groupRenderer={CellGroup}
                            grouped
                        />
                    </Container>
                    <ContainerCard
                        className={styles.currentFramework}
                        heading="Selected Framework"
                        headingSize="small"
                    >
                        <ListView
                            data={widgets}
                            renderer={WidgetTagList}
                            rendererParams={widgetRendererParams}
                            keySelector={widgetKeySelector}
                            filtered={false}
                            pending={false}
                            errored={false}
                        />
                    </ContainerCard>
                </Card>
                <Card className={styles.card}>
                    {(geoWidgets?.length ?? 0) > 0 && (
                        <ContainerCard
                            heading="Geo Widgets"
                            spacing="compact"
                            headingSize="small"
                        >
                            <ListView
                                className={styles.geoWidgetList}
                                data={geoWidgets}
                                renderer={CheckButton}
                                rendererParams={geoWidgetsRendererParas}
                                keySelector={widgetKeySelector}
                                filtered={false}
                                pending={false}
                                errored={false}
                            />
                        </ContainerCard>
                    )}
                    {(numberWidgets?.length ?? 0) > 0 && (
                        <ContainerCard
                            heading="Number Widgets"
                            spacing="compact"
                            headingSize="small"
                        >
                            <ListView
                                className={styles.numberWidgetList}
                                data={numberWidgets}
                                renderer={CheckButton}
                                rendererParams={numberWidgetsRendererParas}
                                keySelector={widgetKeySelector}
                                filtered={false}
                                pending={false}
                                errored={false}
                            />
                        </ContainerCard>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default AssistedTagging;
