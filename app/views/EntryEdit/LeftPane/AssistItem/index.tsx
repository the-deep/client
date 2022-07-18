import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
    listToMap,
    isDefined,
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    useForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
    QuickActionButton,
    QuickActionDropdownMenu,
    useAlert,
    Svg,
    Container,
} from '@the-deep/deep-ui';
import { IoClose } from 'react-icons/io5';

import { GeoArea } from '#components/GeoMultiSelectInput';
import brainIcon from '#resources/img/brain.svg';
import {
    mappingsSupportedWidgets,
    isCategoricalMappings,
    WidgetHint,
    filterMatrix1dMappings,
    filterMatrix2dMappings,
    filterScaleMappings,
    filterSelectMappings,
    filterMultiSelectMappings,
    filterOrganigramMappings,
} from '#types/newAnalyticalFramework';
import {
    mergeLists,
} from '#utils/common';
import {
    ProjectDraftEntryQuery,
    ProjectDraftEntryQueryVariables,
    CreateProjectDraftEntryMutation,
    CreateProjectDraftEntryMutationVariables,
} from '#generated/types';

import {
    PartialEntryType as EntryInput,
    PartialAttributeType,
    getEntrySchema,
} from '#components/entry/schema';
import { Framework } from '#components/entry/types';

import { createDefaultAttributes } from '../../utils';
import AssistPopup from './AssistPopup';
import {
    createOrganigramAttr,
    createMatrix1dAttr,
    createMatrix2dAttr,
    createScaleAttr,
    createSelectAttr,
    createMultiSelectAttr,
    createGeoAttr,
} from './utils';

import styles from './styles.css';

const GEOLOCATION_DEEPL_MODEL_ID = 'geolocation';

const CREATE_DRAFT_ENTRY = gql`
    mutation CreateProjectDraftEntry(
        $projectId: ID!,
        $leadId: ID!,
        $excerpt: String!,
    ) {
        project(id: $projectId) {
            id
            assistedTagging {
                draftEntryCreate(data: { lead: $leadId, excerpt: $excerpt }) {
                    ok
                    errors
                    result {
                        id
                        predictionStatus
                        predictions {
                            category
                            dataType
                            dataTypeDisplay
                            draftEntry
                            id
                            isSelected
                            modelVersion
                            modelVersionDeeplModelId
                            prediction
                            tag
                            threshold
                            value
                        }
                        relatedGeoareas {
                            id
                            regionTitle
                            adminLevelTitle
                            title
                        }
                    }
                }
            }
        }
    }
`;

const PROJECT_DRAFT_ENTRY = gql`
    query ProjectDraftEntry(
        $projectId: ID!,
        $draftEntryId: ID!,
    ) {
        project(id: $projectId) {
            id
            assistedTagging {
                draftEntry(id: $draftEntryId) {
                    id
                    predictionStatus
                    predictions {
                        category
                        dataType
                        dataTypeDisplay
                        draftEntry
                        id
                        isSelected
                        modelVersion
                        modelVersionDeeplModelId
                        prediction
                        tag
                        threshold
                        value
                    }
                    relatedGeoareas {
                        id
                        regionTitle
                        adminLevelTitle
                        title
                    }
                }
            }
        }
    }
`;

interface Props {
    className?: string;
    text: string;
    onAssistedEntryAdd: (
        (newEntry: EntryInput, locations?: GeoArea[]) => void
    ) | undefined;
    frameworkDetails?: Framework;
    leadId: string;
    onAssistCancel: () => void;
    disabled?: boolean;
    projectId?: string;
}

function AssistItem(props: Props) {
    const {
        className,
        text,
        onAssistedEntryAdd,
        frameworkDetails,
        leadId,
        onAssistCancel,
        projectId,
        disabled,
    } = props;

    const {
        allWidgets,
        filteredWidgets,
    } = useMemo(() => {
        const widgetsFromPrimary = frameworkDetails?.primaryTagging?.flatMap(
            (item) => (item.widgets ?? []),
        ) ?? [];
        const widgetsFromSecondary = frameworkDetails?.secondaryTagging ?? [];
        const widgets = [
            ...widgetsFromPrimary,
            ...widgetsFromSecondary,
        ];
        return {
            allWidgets: widgets,
            filteredWidgets: widgets.filter((w) => mappingsSupportedWidgets.includes(w.widgetId)),
        };
    }, [
        frameworkDetails,
    ]);

    const mappings = frameworkDetails?.predictionTagsMapping;
    const alert = useAlert();
    const [
        allRecommendations,
        setAllRecommendations,
    ] = useState<PartialAttributeType[] | undefined>(undefined);

    const [allHints, setAllHints] = useState<WidgetHint[] | undefined>(undefined);

    const assistPopupRef = useRef<
        { setShowPopup: React.Dispatch<React.SetStateAction<boolean>> }
    >(null);

    // NOTE: This is done to open assist popup immediately after clicking
    // on the entry add button
    useEffect(() => {
        assistPopupRef?.current?.setShowPopup(true);
    }, [
        assistPopupRef,
    ]);

    const handleDiscardButtonClick = useCallback(() => {
        assistPopupRef?.current?.setShowPopup(false);
        onAssistCancel();
    }, [
        assistPopupRef,
        onAssistCancel,
    ]);

    const schema = useMemo(
        () => {
            const widgetsMapping = listToMap(
                allWidgets,
                (item) => item.id,
                (item) => item,
            );
            return getEntrySchema(widgetsMapping);
        },
        [allWidgets],
    );

    const emptyEntry: EntryInput = useMemo(() => ({
        clientId: randomString(),
        entryType: 'EXCERPT' as const,
        lead: leadId,
        excerpt: text,
        droppedExcerpt: text,
        attributes: [],
    }), [
        leadId,
        text,
    ]);

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const {
        setValue,
        value,
        validate,
        setError,
        error,
    } = useForm(schema, emptyEntry);

    const [messageText, setMessageText] = useState<string | undefined>();

    const handleMappingsFetch = useCallback((
        predictions: { tags: string[]; locations: GeoArea[]; },
    ) => {
        if (predictions.tags.length <= 0 && predictions.locations.length <= 0) {
            setMessageText('DEEP could not provide any recommendations for the selected text.');
            return;
        }

        setGeoAreaOptions(predictions.locations);

        const matchedMappings = mappings
            ?.filter(isCategoricalMappings)
            .filter((m) => m.tag && predictions.tags.includes(m.tag));

        const supportedGeoWidgets = mappings
            ?.filter((mappingItem) => mappingItem.widgetType === 'GEO')
            ?.map((mappingItem) => mappingItem.widget);

        const {
            tempAttrs: recommendedAttributes,
            tempHints: widgetsHints,
        } = filteredWidgets.reduce(
            (
                acc: { tempAttrs: PartialAttributeType[]; tempHints: WidgetHint[]; },
                widget,
            ) => {
                const {
                    tempAttrs: oldTempAttrs,
                    tempHints: oldTempHints,
                } = acc;

                if (widget.widgetId === 'MATRIX1D') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterMatrix1dMappings);

                    const attr = createMatrix1dAttr(supportedTags, widget);
                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (widget.widgetId === 'MATRIX2D') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterMatrix2dMappings);

                    const attr = createMatrix2dAttr(supportedTags, widget);

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (widget.widgetId === 'SCALE') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterScaleMappings);

                    const {
                        attr,
                        hints,
                    } = createScaleAttr(supportedTags, widget);

                    const hintsWithInfo: WidgetHint | undefined = hints ? {
                        widgetPk: widget.id,
                        widgetType: 'SCALE',
                        hints,
                    } : undefined;

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: hintsWithInfo ? [...oldTempHints, hintsWithInfo] : oldTempHints,
                    };
                }
                if (widget.widgetId === 'SELECT') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterSelectMappings);

                    const {
                        attr,
                        hints,
                    } = createSelectAttr(supportedTags, widget);

                    const hintsWithInfo: WidgetHint | undefined = hints ? {
                        widgetPk: widget.id,
                        widgetType: 'SELECT',
                        hints,
                    } : undefined;

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: hintsWithInfo ? [...oldTempHints, hintsWithInfo] : oldTempHints,
                    };
                }
                if (widget.widgetId === 'MULTISELECT') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterMultiSelectMappings);

                    const attr = createMultiSelectAttr(
                        supportedTags,
                        widget,
                    );

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (widget.widgetId === 'ORGANIGRAM') {
                    const supportedTags = matchedMappings
                        ?.filter((m) => m.widget === widget.id)
                        .filter(filterOrganigramMappings);

                    const attr = createOrganigramAttr(
                        supportedTags,
                        widget,
                    );

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                if (
                    widget.widgetId === 'GEO'
                    && predictions.locations.length > 0
                    && supportedGeoWidgets?.includes(widget.id)
                ) {
                    const attr = createGeoAttr(
                        predictions.locations,
                        widget,
                    );

                    return {
                        tempAttrs: attr ? [...oldTempAttrs, attr] : oldTempAttrs,
                        tempHints: oldTempHints,
                    };
                }
                return acc;
            },
            {
                tempAttrs: [],
                tempHints: [],
            },
        );

        if (recommendedAttributes.length <= 0 && widgetsHints.length <= 0) {
            setMessageText('The provided recommendations for this text did not fit any tags in this project.');
            return;
        }

        setAllHints(widgetsHints);
        setAllRecommendations(recommendedAttributes);

        setValue(
            (oldEntry) => {
                if (!oldEntry) {
                    return {
                        clientId: randomString(),
                        entryType: 'EXCERPT',
                        lead: leadId,
                        excerpt: text,
                        droppedExcerpt: text,
                        attributes: recommendedAttributes,
                    };
                }

                return {
                    ...oldEntry,
                    attributes: recommendedAttributes,
                };
            },
            undefined,
        );
    }, [
        text,
        leadId,
        mappings,
        setValue,
        filteredWidgets,
    ]);

    const [draftEntryId, setDraftEntryId] = useState<string | undefined>(undefined);
    const [predictionsLoading, setPredictionsLoading] = useState(false);

    const queryVariables = useMemo(() => (
        draftEntryId && projectId ? ({
            projectId,
            draftEntryId,
        }) : undefined
    ), [
        projectId,
        draftEntryId,
    ]);

    const [isErrored, setIsErrored] = useState(false);

    const {
        loading: draftEntryFetchPending,
        data,
        startPolling,
        stopPolling,
        error: fetchErrors,
    } = useQuery<ProjectDraftEntryQuery, ProjectDraftEntryQueryVariables>(
        PROJECT_DRAFT_ENTRY,
        {
            skip: !queryVariables,
            variables: queryVariables,
            onCompleted: (response) => {
                const result = response?.project?.assistedTagging?.draftEntry;

                // FIXME: Handle errors more gracefully
                if (!result) {
                    setIsErrored(true);
                    alert.show(
                        'Failed to predict!',
                        { variant: 'error' },
                    );
                    return;
                }
                if (
                    result?.predictionStatus === 'PENDING'
                    || result?.predictionStatus === 'STARTED'
                ) {
                    return;
                }

                const validPredictions = result?.predictions?.filter(isDefined);

                /*
                const geoPredictions = validPredictions?.filter(
                    (prediction) => (
                        prediction.modelVersionDeeplModelId === GEOLOCATION_DEEPL_MODEL_ID
                    ),
                ).map(
                    (prediction) => prediction.value,
                ) ?? [];
                */

                const categoricalTags = validPredictions?.filter(
                    (prediction) => (
                        prediction.modelVersionDeeplModelId !== GEOLOCATION_DEEPL_MODEL_ID
                        && prediction.isSelected
                    ),
                ).map(
                    (prediction) => prediction.tag,
                ).filter(isDefined) ?? [];

                handleMappingsFetch({
                    tags: categoricalTags,
                    locations: result.relatedGeoareas?.filter(isDefined) ?? [],
                });
            },
            onError: () => {
                alert.show(
                    'Failed to predict!',
                    { variant: 'error' },
                );
            },
        },
    );

    const shouldPoll = useMemo(() => {
        const draftEntry = data?.project?.assistedTagging?.draftEntry;
        return draftEntry?.predictionStatus === 'PENDING' || draftEntry?.predictionStatus === 'STARTED';
    }, [data]);

    useEffect(
        () => {
            if (!shouldPoll) {
                return undefined;
            }
            setPredictionsLoading(true);
            startPolling(2000);

            return () => {
                setPredictionsLoading(false);
                stopPolling();
            };
        },
        [
            shouldPoll,
            startPolling,
            stopPolling,
        ],
    );

    const handleNormalEntryCreateButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                if (onAssistedEntryAdd) {
                    const defaultAttributes = createDefaultAttributes(allWidgets);

                    onAssistedEntryAdd(
                        {
                            ...entryData,
                            attributes: defaultAttributes,
                        },
                        undefined,
                    );
                }
            },
        );

        submit();
    }, [
        setError,
        validate,
        onAssistedEntryAdd,
        allWidgets,
    ]);

    const handleEntryCreateButtonClick = useCallback(() => {
        if (!allRecommendations) {
            return;
        }

        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                if (onAssistedEntryAdd) {
                    const defaultAttributes = createDefaultAttributes(allWidgets);

                    const newAttributes = mergeLists(
                        defaultAttributes,
                        entryData?.attributes ?? [],
                        (attr) => attr.widget,
                        (defaultAttr, newAttr) => ({
                            ...newAttr,
                            clientId: defaultAttr.clientId,
                            widget: defaultAttr.widget,
                            id: defaultAttr.id,
                            widgetVersion: defaultAttr.widgetVersion,
                        }),
                    );

                    onAssistedEntryAdd(
                        {
                            ...entryData,
                            attributes: newAttributes,
                            draftEntry: data?.project?.assistedTagging?.draftEntry?.id,
                        },
                        geoAreaOptions ?? undefined,
                    );
                }
            },
        );

        submit();
    }, [
        data,
        allWidgets,
        geoAreaOptions,
        allRecommendations,
        validate,
        setError,
        onAssistedEntryAdd,
    ]);

    const [
        createDraftEntry,
        {
            error: createErrors,
            loading: draftEntryCreationPending,
        },
    ] = useMutation<CreateProjectDraftEntryMutation, CreateProjectDraftEntryMutationVariables>(
        CREATE_DRAFT_ENTRY,
        {
            onCompleted: (response) => {
                const draftEntryResponse = response?.project?.assistedTagging?.draftEntryCreate;

                // FIXME: Handle errors more gracefully
                if (
                    !draftEntryResponse
                    || !draftEntryResponse.ok
                    || !!draftEntryResponse.errors
                    || !draftEntryResponse.result
                ) {
                    setIsErrored(true);
                    alert.show(
                        'Failed to predict!',
                        { variant: 'error' },
                    );
                    return;
                }

                setDraftEntryId(draftEntryResponse.result?.id);
            },
            onError: () => {
                setIsErrored(true);
                alert.show(
                    'Failed to predict!',
                    { variant: 'error' },
                );
            },
        },
    );

    useEffect(() => {
        if (projectId && !draftEntryId) {
            createDraftEntry({
                variables: {
                    projectId,
                    leadId,
                    excerpt: text,
                },
            });
        }
    }, [
        draftEntryId,
        projectId,
        leadId,
        text,
        createDraftEntry,
    ]);

    return (
        <Container
            className={_cs(className, styles.assistItem)}
            footerActions={(
                <QuickActionDropdownMenu
                    title="Assist"
                    label={(
                        <Svg
                            className={styles.brainIcon}
                            src={brainIcon}
                        />
                    )}
                    componentRef={assistPopupRef}
                    className={styles.button}
                    disabled={disabled}
                    variant="nlp-primary"
                    popupPlacementDirection="horizontal"
                    popupClassName={styles.popup}
                    popupContentClassName={styles.popupContent}
                    popupMatchesParentWidth={false}
                    persistent
                >
                    {frameworkDetails && (
                        <AssistPopup
                            frameworkDetails={frameworkDetails}
                            value={value}
                            onChange={setValue}
                            error={error}
                            leadId={leadId}
                            hints={allHints}
                            recommendations={allRecommendations}
                            onEntryDiscardButtonClick={handleDiscardButtonClick}
                            onEntryCreateButtonClick={handleEntryCreateButtonClick}
                            onNormalEntryCreateButtonClick={handleNormalEntryCreateButtonClick}
                            geoAreaOptions={geoAreaOptions}
                            onGeoAreaOptionsChange={setGeoAreaOptions}
                            predictionsLoading={
                                predictionsLoading
                                || draftEntryFetchPending
                                || draftEntryCreationPending
                            }
                            predictionsErrored={!!fetchErrors || !!createErrors || isErrored}
                            messageText={messageText}
                        />
                    )}
                </QuickActionDropdownMenu>
            )}
            headerActions={(
                <QuickActionButton
                    name={undefined}
                    title="Cancel"
                    onClick={onAssistCancel}
                    disabled={disabled}
                    variant="action"
                >
                    <IoClose />
                </QuickActionButton>
            )}
            contentClassName={styles.content}
        >
            {text}
        </Container>
    );
}

export default AssistItem;
