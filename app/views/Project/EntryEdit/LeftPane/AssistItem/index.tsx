import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FaBrain } from 'react-icons/fa';
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
    useAlert,
    Container,
} from '@the-deep/deep-ui';
import { IoClose } from 'react-icons/io5';

import { useModalState } from '#hooks/stateManagement';
import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    mappingsSupportedWidgets,
    isCategoricalMappings,
    WidgetHint,
    filterMatrix1dMappings,
    filterMatrix2dMappings,
    filterScaleMappings,
    filterSelectMappings,
    filterMultiSelectMappings,
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
} from '../../schema';
import { createDefaultAttributes } from '../../utils';
import { Framework } from '../../types';
import AssistPopup from '../AssistPopup';
import {
    createMatrix1dAttr,
    createMatrix2dAttr,
    createScaleAttr,
    createSelectAttr,
    createMultiSelectAttr,
} from '../AssistPopup/utils';

import styles from './styles.css';

const GEOLOCATION_DEEPL_MODEL_ID = 'geolocation';

const CREATE_DRAFT_ENTRY = gql`
    mutation CreateProjectDraftEntry(
        $projectId: ID!,
        $leadId: ID!,
        $excerpt: String!,
    ) {
        project(id: $projectId) {
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
                }
            }
        }
    }
`;

interface Props {
    className?: string;
    text: string;
    onAssistedEntryAdd: ((newEntry: EntryInput) => void) | undefined;
    frameworkDetails: Framework;
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
        const widgetsFromPrimary = frameworkDetails.primaryTagging?.flatMap(
            (item) => (item.widgets ?? []),
        ) ?? [];
        const widgetsFromSecondary = frameworkDetails.secondaryTagging ?? [];
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
    const [allHints, setAllHints] = useState<WidgetHint[] | undefined>(undefined);

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
        attributes: createDefaultAttributes(allWidgets),
    }), [
        leadId,
        allWidgets,
        text,
    ]);

    const [
        isAssistedTaggingModalShown,
        showAssistedTaggingModal,
        hideAssistedTaggingModal,
    ] = useModalState(true);

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

    const handleEntryCreateButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                if (onAssistedEntryAdd) {
                    onAssistedEntryAdd(entryData);
                }
            },
        );
        submit();
    }, [
        validate,
        setError,
        onAssistedEntryAdd,
    ]);

    const handleMappingsFetch = useCallback((
        predictions: { tags: string[]; locations: string[]; },
    ) => {
        const matchedMappings = mappings
            ?.filter(isCategoricalMappings)
            .filter((m) => predictions.tags.includes(m.tag));

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
                if (
                    widget.widgetId === 'GEO'
                    && predictions.locations.length > 0
                    && supportedGeoWidgets?.includes(widget.id)
                ) {
                    const hintsWithInfo: WidgetHint = {
                        widgetPk: widget.id,
                        widgetType: 'GEO',
                        hints: predictions.locations,
                    };
                    return {
                        tempAttrs: oldTempAttrs,
                        tempHints: [...oldTempHints, hintsWithInfo],
                    };
                }
                return acc;
            },
            {
                tempAttrs: [],
                tempHints: [],
            },
        );

        setAllHints(widgetsHints);

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
                const oldAttributes = oldEntry.attributes ?? [];

                const newAttributes = mergeLists(
                    oldAttributes,
                    recommendedAttributes,
                    (attr) => attr.widget,
                    (oldAttr, newAttr) => ({
                        ...newAttr,
                        clientId: oldAttr.clientId,
                        widget: oldAttr.widget,
                        id: oldAttr.id,
                        widgetVersion: oldAttr.widgetVersion,
                    }),
                );

                return {
                    ...oldEntry,
                    attributes: newAttributes,
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

    const queryVariables = useMemo(() => (
        draftEntryId && projectId ? ({
            projectId,
            draftEntryId,
        }) : undefined
    ), [
        projectId,
        draftEntryId,
    ]);

    const {
        data,
        loading: loadingPredictions,
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

                const geoPredictions = validPredictions?.filter(
                    (prediction) => (
                        prediction.modelVersionDeeplModelId === GEOLOCATION_DEEPL_MODEL_ID
                    ),
                ).map(
                    (prediction) => prediction.value,
                ) ?? [];

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
                    locations: geoPredictions,
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
            startPolling(2000);
            return () => { stopPolling(); };
        },
        [
            shouldPoll,
            startPolling,
            stopPolling,
        ],
    );

    const [
        createDraftEntry,
        {
            error: createErrors,
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
                    alert.show(
                        'Failed to predict!',
                        { variant: 'error' },
                    );
                    return;
                }

                setDraftEntryId(draftEntryResponse.result?.id);
            },
            onError: () => {
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
                <QuickActionButton
                    name={undefined}
                    title="Assist"
                    className={styles.button}
                    onClick={showAssistedTaggingModal}
                    disabled={disabled}
                    variant="tertiary"
                >
                    <FaBrain />
                </QuickActionButton>
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
            {isAssistedTaggingModalShown && (
                <AssistPopup
                    onCloseButtonClick={hideAssistedTaggingModal}
                    frameworkDetails={frameworkDetails}
                    value={value}
                    onChange={setValue}
                    error={error}
                    leadId={leadId}
                    hints={allHints}
                    onEntryCreateButtonClick={handleEntryCreateButtonClick}
                    geoAreaOptions={geoAreaOptions}
                    onGeoAreaOptionsChange={setGeoAreaOptions}
                    loadingPredictions={loadingPredictions}
                    predictionsErrored={!!fetchErrors || !!createErrors}
                />
            )}
        </Container>
    );
}

export default AssistItem;
