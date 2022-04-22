import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    listToMap,
    listToGroupList,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    Error,
    SetValueArg,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import {
    ListView,
    Card,
    Container,
    ContainerCard,
    Header,
    Switch,
} from '@the-deep/deep-ui';

import {
    Widget,
    MappingsItem,
    isCategoricalMappings,
    categoricalWidgets,
    GeoMappingsItem,
} from '#types/newAnalyticalFramework';
import {
    AssistedPredictionTagsQuery,
} from '#generated/types';

import { WidgetsType } from '../schema';
import CheckButton from './CheckButton';
import WidgetTagList from './WidgetTagList';
import CellGroup from './CellGroup';

import styles from './styles.css';

type AssistedTag = NonNullable<NonNullable<NonNullable<AssistedPredictionTagsQuery>['assistedTagging']>['predictionTags']>[number];

const nlpLabelGroupKeySelector = (tag: AssistedTag) => tag.group ?? 'Miscellaneous';
const nlpLabelKeySelector = (tag: AssistedTag) => tag.id;
const widgetKeySelector = (widget: Widget) => widget.clientId;

interface Props<K extends string> {
    className?: string;
    allWidgets: WidgetsType | undefined;
    assistedTaggingEnabled: boolean | undefined;
    onAssistedTaggingStatusChange: (newVal: boolean) => void;
    pending?: boolean;
    assistedPredictionTags: AssistedTag[] | undefined | null;

    name: K;
    value: MappingsItem[] | undefined;
    error: Error<MappingsItem[]> | undefined;
    onChange: (value: SetValueArg<MappingsItem[] | undefined>, name: K) => void;
    disabled?: boolean;
}

function AssistedTagging<K extends string>(props: Props<K>) {
    const {
        className,
        allWidgets,
        assistedTaggingEnabled,
        pending,
        onAssistedTaggingStatusChange,
        assistedPredictionTags,
        name,
        value: mappings,
        error,
        onChange,
        disabled,
    } = props;

    const [selectedTag, setSelectedTag] = useState<string | undefined>();

    const errored = analyzeErrors(error);

    const predictionTags = useMemo(() => (
        assistedPredictionTags?.filter((tag) => (
            !tag.isCategory && !tag.hideInAnalysisFrameworkMapping
        ))
    ), [assistedPredictionTags]);

    type SetMappingsFn = React.Dispatch<React.SetStateAction<MappingsItem[] | undefined>>;
    const setMappings = useCallback<SetMappingsFn>((newMappings) => {
        onChange(newMappings, name);
    }, [
        onChange,
        name,
    ]);

    const widgets = useMemo(() => (
        allWidgets
            ?.filter((widget) => (
                isDefined(widget.id) && categoricalWidgets.includes(widget.widgetId)
            ))
    ), [allWidgets]);

    const geoWidgets = useMemo(() => (
        allWidgets?.filter((widget) => isDefined(widget.id) && widget.widgetId === 'GEO')
    ), [allWidgets]);

    const categoricalMappings = useMemo(
        () => mappings?.filter(isCategoricalMappings),
        [mappings],
    );

    const mappingsByTagId = useMemo(() => (
        listToGroupList(
            categoricalMappings,
            (mappingItem) => mappingItem.tag,
        )
    ), [categoricalMappings]);

    const geoWidgetsMappingValue = useMemo(() => (
        listToMap(
            mappings?.filter((mapping) => mapping.widgetType === 'GEO'),
            (mapping) => mapping.widget,
            () => true,
        )
    ), [mappings]);

    const handleTagClick = useCallback((newTag: string) => {
        setSelectedTag((oldTag) => (oldTag === newTag ? undefined : newTag));
    }, []);

    const handleGeoWidgetClick = useCallback((widgetPk: string) => {
        setMappings((oldMappings = []) => {
            const selectedWidgetIndex = oldMappings.findIndex(
                (mapping) => mapping.widget === widgetPk,
            );
            if (selectedWidgetIndex !== -1) {
                return oldMappings.filter((mapping) => mapping.widget !== widgetPk);
            }
            return [
                ...oldMappings,
                {
                    widgetType: 'GEO',
                    widget: widgetPk,
                    clientId: randomString(),
                    // FIXME: need to cast here because we cannot set id
                    // and a proper fix would require more time
                } as GeoMappingsItem,
            ];
        });
    }, [setMappings]);

    const handleWidgetMappingsChange = useCallback((
        newWidgetMappings: MappingsItem[],
        widgetPk: string,
    ) => {
        setMappings((oldMappings = []) => {
            const filteredMappings = oldMappings.filter(
                (mapping) => mapping.widget !== widgetPk,
            );
            const finalMappings = [
                ...filteredMappings,
                ...newWidgetMappings,
            ];
            return finalMappings;
        });
    }, [setMappings]);

    const nlpLabelGroupRendererParams = useCallback((groupKey: string) => ({
        title: groupKey,
    }), []);

    const nlpRendererParams = useCallback((itemKey: string, tag: AssistedTag) => ({
        children: tag.name,
        name: itemKey,
        value: selectedTag === itemKey,
        badgeCount: mappingsByTagId?.[itemKey]?.length ?? 0,
        onClick: handleTagClick,
        disabled: disabled || !assistedTaggingEnabled,
    }), [
        disabled,
        assistedTaggingEnabled,
        handleTagClick,
        selectedTag,
        mappingsByTagId,
    ]);

    const geoWidgetsRendererParams = useCallback((itemKey: string, widget: Widget) => ({
        children: widget.title,
        name: itemKey,
        value: !!geoWidgetsMappingValue?.[widget.id],
        onClick: handleGeoWidgetClick,
        disabled: disabled || !assistedTaggingEnabled,
    }), [
        assistedTaggingEnabled,
        disabled,
        geoWidgetsMappingValue,
        handleGeoWidgetClick,
    ]);

    const widgetRendererParams = useCallback((_: string, widget: Widget) => ({
        widget,
        mappings: categoricalMappings,
        onMappingsChange: handleWidgetMappingsChange,
        selectedTag,
        disabled: disabled || !assistedTaggingEnabled,
    }), [
        disabled,
        assistedTaggingEnabled,
        categoricalMappings,
        selectedTag,
        handleWidgetMappingsChange,
    ]);

    return (
        <div className={_cs(className, styles.assistedTagging)}>
            <Header
                className={styles.header}
                heading={errored ? 'Assisted Tagging (errored)' : 'Assisted Tagging'}
                headingSize="small"
                // FIXME: Get actual description from DFS
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
            <div
                className={_cs(
                    styles.content,
                    !assistedTaggingEnabled && styles.fadeOut,
                )}
            >
                <Card className={styles.card}>
                    <Container
                        className={styles.nlpFramework}
                        headingSize="small"
                        heading="NLP Framework"
                        spacing="compact"
                    >
                        <ListView
                            className={styles.nlpFrameworkList}
                            data={predictionTags}
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
                        spacing="compact"
                    >
                        <ListView
                            className={styles.selectedFrameworkList}
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
                {(geoWidgets?.length ?? 0) > 0 && (
                    <Card
                        className={_cs(
                            styles.card,
                            styles.geoWidgets,
                        )}
                    >
                        <ContainerCard
                            heading="Geo Widgets"
                            spacing="compact"
                            headingSize="small"
                        >
                            <ListView
                                className={styles.geoWidgetList}
                                data={geoWidgets}
                                renderer={CheckButton}
                                rendererParams={geoWidgetsRendererParams}
                                keySelector={widgetKeySelector}
                                filtered={false}
                                pending={false}
                                errored={false}
                            />
                        </ContainerCard>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default AssistedTagging;
