import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    listToMap,
    listToGroupList,
    isDefined,
    randomString,
    unique,
} from '@togglecorp/fujs';
import {
    Error,
    SetValueArg,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import { compareTwoStrings } from 'string-similarity';
import {
    ConfirmButton,
    ListView,
    useAlert,
    Card,
    Container,
    ContainerCard,
    Header,
    Switch,
    Link,
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
import ProgressLine from '#components/ProgressLine';
import generateString from '#utils/string';

import {
    getMatrix2dPossibleMappings,
    getMatrix1dPossibleMappings,
    getOptionTypePossibleMappings,
    getOrganigramPossibleMappings,
} from './utils';
import { WidgetsType } from '../schema';
import TagWithBadge from './TagWithBadge';
import CheckButton from './CheckButton';
import WidgetTagList from './WidgetTagList';
import CellGroup from './CellGroup';

import styles from './styles.css';

function isCaseInsensitiveMatch(foo: string | undefined = '', bar: string | undefined = '') {
    return (compareTwoStrings(foo?.toLowerCase(), bar?.toLowerCase()) > 0.7);
}

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
    const alert = useAlert();

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

    const possibleTagsInFramework = useMemo(() => (
        widgets?.map((widget) => {
            if (widget.widgetId === 'MATRIX2D') {
                return getMatrix2dPossibleMappings(widget);
            }
            if (widget.widgetId === 'MATRIX1D') {
                return getMatrix1dPossibleMappings(widget);
            }
            if (
                widget.widgetId === 'SCALE'
            || widget.widgetId === 'SELECT'
            || widget.widgetId === 'MULTISELECT'
            ) {
                return getOptionTypePossibleMappings(widget);
            }
            if (widget.widgetId === 'ORGANIGRAM') {
                return getOrganigramPossibleMappings(widget);
            }
            return [];
        }).flat()
    ), [widgets]);

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
        predictionTags,
        disabled: disabled || !assistedTaggingEnabled,
    }), [
        predictionTags,
        disabled,
        assistedTaggingEnabled,
        categoricalMappings,
        handleWidgetMappingsChange,
    ]);

    const uniqueMappedPercent = useMemo(() => {
        if (!categoricalMappings || !possibleTagsInFramework) {
            return 0;
        }
        const uniqueMappings = unique(
            categoricalMappings,
            (map) => JSON.stringify(map?.association),
        ).length;
        return Math.round((uniqueMappings / possibleTagsInFramework.length) * 10000) / 100;
    }, [
        categoricalMappings,
        possibleTagsInFramework,
    ]);

    const handleAutoMatchClick = useCallback(() => {
        if (!possibleTagsInFramework) {
            return;
        }
        const mapping = possibleTagsInFramework.map((item) => (
            predictionTags?.reduce((acc, tag) => {
                if (!isCaseInsensitiveMatch(item?.label, tag.name)) {
                    return acc;
                }
                return ([
                    {
                        ...item,
                        tag: tag.id,
                        clientId: randomString(),
                    },
                    ...acc,
                ]);
            }, [] as Omit<MappingsItem, 'id'>[])
        )).flat().filter(isDefined);

        // FIXME: MappingsItem requires id, but its not required at first
        setMappings(mapping as MappingsItem[]);
        const newMappings = (mapping ?? []) as MappingsItem[];
        const uniqueMappings = unique(
            newMappings.filter(isCategoricalMappings),
            (map) => JSON.stringify(map?.association),
        ).length;
        const newMappedPercent = Math.round(
            (uniqueMappings / possibleTagsInFramework.length) * 10000,
        ) / 100;

        alert.show(
            `DEEP was able to match ${newMappedPercent}% tags in your framework. Please, verify the matches and add the ones that are missing.`,
            {
                variant: 'success',
                duration: 6000,
            },
        );
    }, [
        alert,
        possibleTagsInFramework,
        setMappings,
        predictionTags,
    ]);

    const viewOnlyNlpRendererParams = useCallback((itemKey: string, tag: AssistedTag) => ({
        children: tag.name,
        badgeCount: mappingsByTagId?.[itemKey]?.length ?? 0,
        badgeKey: tag.id,
    }), [
        mappingsByTagId,
    ]);

    return (
        <div className={_cs(className, styles.assistedTagging)}>
            <Header
                className={styles.header}
                heading={errored ? 'Assisted Tagging (errored)' : 'Assisted Tagging'}
                headingSize="small"
                description={generateString(
                    'The NLP feature in the DEEP Platform automatically extracts and categorizes information more accurately when paired with the standard DEEP NLP framework. With the matching feature, you can determine how closely your custom framework aligns with the standard one. This comparison is done using a string-matching method. At present, the best results are achieved with English content. If there are any incorrect matches or items that don\'t match, they can be manually adjusted to improve the classification accuracy, ensuring better utilization of the automatic extraction and classification features. See {descriptiveVideo} for further explanation',
                    {
                        descriptiveVideo: (
                            <Link
                                className={styles.link}
                                // NOTE: Need to add a hide chevron button
                                actionsContainerClassName={styles.linkActions}
                                to="https://www.youtube.com/watch?v=cZFjq6L5Zl8"
                            >
                                this video
                            </Link>
                        ),
                    },
                )}
                actionsContainerClassName={styles.actions}
                actions={(
                    <>
                        <Switch
                            name="isAssistedTaggingEnabled"
                            value={assistedTaggingEnabled}
                            onChange={onAssistedTaggingStatusChange}
                            disabled={pending}
                            label="Active"
                        />
                        <ProgressLine
                            className={styles.progressLine}
                            progress={uniqueMappedPercent}
                            titleClassName={styles.title}
                            title={`Matching = ${uniqueMappedPercent}%`}
                            variant="accent"
                            hideInfoCircle
                        />
                    </>
                )}
            />
            <div
                className={_cs(
                    styles.content,
                    !assistedTaggingEnabled && styles.fadeOut,
                )}
            >
                <Card className={styles.card}>
                    <ContainerCard
                        className={styles.currentFramework}
                        headingClassName={styles.headingContainer}
                        headingSize="small"
                        heading={(
                            <div className={styles.heading}>
                                <div
                                    className={styles.leftContainer}
                                >
                                    My Framework
                                </div>
                                <Header
                                    className={styles.rightContainer}
                                    heading="Selected NLP Models"
                                    actions={(
                                        <ConfirmButton
                                            name={undefined}
                                            onConfirm={handleAutoMatchClick}
                                            message="Auto-matching will remove all the current mappings and replace them with the recommended ones. Are you sure you want to auto-match?"
                                            disabled={
                                                pending
                                                || disabled
                                                || !assistedTaggingEnabled
                                            }
                                            variant="tertiary"
                                        >
                                            Auto Match
                                        </ConfirmButton>
                                    )}
                                />
                            </div>
                        )}
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
                    <Container
                        className={styles.nlpFramework}
                        headingSize="small"
                        heading="Available DEEP NLP models"
                        spacing="compact"
                    >
                        <ListView
                            className={styles.nlpFrameworkList}
                            data={predictionTags}
                            renderer={TagWithBadge}
                            rendererParams={viewOnlyNlpRendererParams}
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
