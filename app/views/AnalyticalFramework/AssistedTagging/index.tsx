import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    listToMap,
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
    MappingsItem,
    isCategoricalMappings,
    categoricalWidgets,
} from '#types/newAnalyticalFramework';
import useLocalStorage from '#hooks/useLocalStorage';

import { WidgetsType } from '../schema';
import CheckButton from './CheckButton';
import WidgetTagList from './WidgetTagList';
import CellGroup from './CellGroup';

import styles from './styles.css';

const nlpLabelGroupKeySelector = (tag: AssistedTag) => tag.labelGroup;
const nlpLabelKeySelector = (tag: AssistedTag) => tag.id;
const widgetKeySelector = (widget: Widget) => widget.clientId;

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
    // FIXME: Remove this later after it is saveable in server
    const [mappings, setMappings] = useLocalStorage<MappingsItem[] | undefined>(`mappings-${frameworkId}`, undefined);

    const categoricalMappings = useMemo(
        () => mappings?.filter(isCategoricalMappings),
        [mappings],
    );

    const widgets = useMemo(() => (
        allWidgets
            ?.filter((widget) => (
                isDefined(widget.id) && categoricalWidgets.includes(widget.widgetId)
            ))
    ), [allWidgets]);

    const geoWidgets = useMemo(() => (
        allWidgets?.filter((widget) => isDefined(widget.id) && widget.widgetId === 'GEO')
    ), [allWidgets]);

    const numberWidgets = useMemo(() => (
        allWidgets?.filter((widget) => isDefined(widget.id) && widget.widgetId === 'NUMBER')
    ), [allWidgets]);

    const nlpLabelGroupRendererParams = useCallback((title: string) => ({
        title,
    }), []);

    const handleTagClick = useCallback((newTag: string) => {
        setSelectedTag((oldTag) => (oldTag === newTag ? undefined : newTag));
    }, []);

    const nlpRendererParams = useCallback((itemKey: string, tag: AssistedTag) => ({
        children: tag.label,
        name: itemKey,
        value: selectedTag === itemKey,
        mappedCount: categoricalMappings?.filter((m) => m.tagId === itemKey).length ?? 0,
        onClick: handleTagClick,
    }), [
        handleTagClick,
        selectedTag,
        categoricalMappings,
    ]);

    const handleGeoWidgetClick = useCallback((widgetPk: string) => {
        setMappings((oldMappings = []) => {
            const selectedWidgetIndex = oldMappings.findIndex(
                (mapping) => mapping.widgetPk === widgetPk,
            );
            if (selectedWidgetIndex !== -1) {
                return oldMappings.filter((mapping) => mapping.widgetPk !== widgetPk);
            }
            return [
                ...oldMappings,
                {
                    widgetType: 'GEO',
                    widgetPk,
                },
            ];
        });
    }, [setMappings]);

    const geoWidgetsMappingValue = useMemo(() => (
        listToMap(
            mappings?.filter((mapping) => mapping.widgetType === 'GEO'),
            (mapping) => mapping.widgetPk,
            () => true,
        )
    ), [mappings]);

    const geoWidgetsRendererParas = useCallback((itemKey: string, widget: Widget) => ({
        children: widget.title,
        name: itemKey,
        value: !!geoWidgetsMappingValue?.[widget.id],
        onClick: handleGeoWidgetClick,
    }), [
        geoWidgetsMappingValue,
        handleGeoWidgetClick,
    ]);

    const handleNumberWidgetClick = useCallback((widgetPk: string) => {
        setMappings((oldMappings = []) => {
            const selectedWidgetIndex = oldMappings.findIndex(
                (mapping) => mapping.widgetPk === widgetPk,
            );
            if (selectedWidgetIndex !== -1) {
                return oldMappings.filter((mapping) => mapping.widgetPk !== widgetPk);
            }
            return [
                ...oldMappings,
                {
                    widgetType: 'NUMBER',
                    widgetPk,
                },
            ];
        });
    }, [setMappings]);

    const numberWidgetsMappingValue = useMemo(() => (
        listToMap(
            mappings?.filter((mapping) => mapping.widgetType === 'NUMBER'),
            (mapping) => mapping.widgetPk,
            () => true,
        )
    ), [mappings]);

    const numberWidgetsRendererParas = useCallback((itemKey: string, widget: Widget) => ({
        children: widget.title,
        name: itemKey,
        value: !!numberWidgetsMappingValue?.[widget.id],
        onClick: handleNumberWidgetClick,
    }), [
        numberWidgetsMappingValue,
        handleNumberWidgetClick,
    ]);

    const handleWidgetMappingsChange = useCallback((
        newWidgetMappings: MappingsItem[],
        widgetPk: string,
    ) => {
        setMappings((oldMappings = []) => {
            const filteredMappings = oldMappings.filter((mapping) => mapping.widgetPk !== widgetPk);
            return [
                ...filteredMappings,
                ...newWidgetMappings,
            ];
        });
    }, [setMappings]);

    const widgetRendererParams = useCallback((_: string, widget: Widget) => ({
        widget,
        mappings: categoricalMappings?.filter((mapping) => mapping.widgetPk === widget.id),
        onMappingsChange: handleWidgetMappingsChange,
        selectedTag,
    }), [
        categoricalMappings,
        selectedTag,
        handleWidgetMappingsChange,
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