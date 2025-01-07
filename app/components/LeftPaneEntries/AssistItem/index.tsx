import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
    listToMap,
    _cs,
    isDefined,
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
import { FiEdit2 } from 'react-icons/fi';

import { GeoArea } from '#components/GeoMultiSelectInput';
import brainIcon from '#resources/img/brain.svg';
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
    PartialAttributeType,
    PartialEntryType as EntryInput,
    getEntrySchema,
} from '#components/entry/schema';
import { Framework } from '#components/entry/types';
import {
    ModelTagsType,
    Matrix1dValue,
    Matrix2dValue,
    SingleSelectValue,
    MultiSelectValue,
    ScaleValue,
    OrganigramValue,
} from '#types/newAnalyticalFramework';

import AssistPopup from './AssistPopup';
import {
    createDefaultAttributes,
} from '../utils';
import {
    isValidObject,
    createMatrix1dAttrFromTags,
    createMatrix2dAttrFromTags,
    createSingleSelectAttrFromTags,
    createMultiSelectAttrFromTags,
    createScaleAttrFromTags,
    createOrganigramAttrFromTags,
} from './utils';

import styles from './styles.css';

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
                        tags {
                            id
                            modelTags
                        }
                        geoAreas {
                            adminLevelLevel
                            adminLevelTitle
                            id
                            regionTitle
                            title
                            parentTitles
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
                    tags {
                        modelTags
                        id
                    }
                    geoAreas {
                        adminLevelLevel
                        adminLevelTitle
                        id
                        regionTitle
                        title
                        parentTitles
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
         (
             newEntry: EntryInput,
             locations?: GeoArea[],
             selectCreatedEntry?: boolean,
         ) => void
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
        };
    }, [
        frameworkDetails,
    ]);

    const alert = useAlert();

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

    const [draftEntryId, setDraftEntryId] = useState<string | undefined>(undefined);
    // FIXME: randomId is used to create different query variables after each poll
    // so that apollo doesn't create unnecessary cache
    const [randomId, setRandomId] = useState<string>(randomString());
    const [predictionsLoading, setPredictionsLoading] = useState(false);

    const queryVariables = useMemo(() => (
        draftEntryId && projectId ? ({
            projectId,
            draftEntryId,
            randomId,
        }) : undefined
    ), [
        randomId,
        projectId,
        draftEntryId,
    ]);

    const [isErrored, setIsErrored] = useState(false);
    const [recommendations, setRecommendations] = useState<PartialAttributeType[]>();

    const handleTagsFetch = useCallback((recommendedTags: ModelTagsType) => {
        const newAttributes = allWidgets.map((widget) => {
            if (widget.widgetId === 'MATRIX1D') {
                return createMatrix1dAttrFromTags(
                    recommendedTags[widget.key] as Matrix1dValue,
                    widget,
                );
            }
            if (widget.widgetId === 'MATRIX2D') {
                return createMatrix2dAttrFromTags(
                    recommendedTags[widget.key] as Matrix2dValue,
                    widget,
                );
            }
            if (widget.widgetId === 'MULTISELECT') {
                return createMultiSelectAttrFromTags(
                    recommendedTags[widget.key] as MultiSelectValue,
                    widget,
                );
            }
            if (widget.widgetId === 'SELECT') {
                return createSingleSelectAttrFromTags(
                    recommendedTags[widget.key] as unknown as SingleSelectValue,
                    widget,
                );
            }
            if (widget.widgetId === 'SCALE') {
                return createScaleAttrFromTags(
                    recommendedTags[widget.key] as unknown as ScaleValue,
                    widget,
                );
            }
            if (widget.widgetId === 'ORGANIGRAM') {
                return createOrganigramAttrFromTags(
                    recommendedTags[widget.key] as OrganigramValue,
                    widget,
                );
            }
            return undefined;
        }).filter(isDefined);

        if (newAttributes.length < 1) {
            setIsErrored(true);
            setMessageText('DEEP could not provide any recommendations for the selected text.');
        }

        setRecommendations(newAttributes);
        setValue(
            (oldEntry) => {
                if (!oldEntry) {
                    return {
                        clientId: randomString(),
                        entryType: 'EXCERPT',
                        lead: leadId,
                        excerpt: text,
                        droppedExcerpt: text,
                        attributes: newAttributes,
                    };
                }

                return {
                    ...oldEntry,
                    attributes: newAttributes,
                };
            },
            undefined,
        );
    }, [
        allWidgets,
        leadId,
        setValue,
        text,
    ]);

    const {
        loading: draftEntryFetchPending,
        data,
        refetch,
        error: fetchErrors,
    } = useQuery<ProjectDraftEntryQuery, ProjectDraftEntryQueryVariables>(
        PROJECT_DRAFT_ENTRY,
        {
            skip: !queryVariables,
            variables: queryVariables,
            onCompleted: (response) => {
                const result = response?.project?.assistedTagging?.draftEntry;
                setPredictionsLoading(true);

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

                const modelTags = result?.tags?.modelTags;
                if (!isValidObject(modelTags)) {
                    setIsErrored(true);
                    setMessageText('DEEP could not provide any recommendations for the selected text.');
                    return;
                }

                handleTagsFetch(modelTags as ModelTagsType);
            },
            onError: () => {
                alert.show(
                    'Failed to predict!',
                    { variant: 'error' },
                );
            },
        },
    );

    useEffect(
        () => {
            const timeout = setTimeout(
                () => {
                    const draftEntry = data?.project?.assistedTagging?.draftEntry;
                    const shouldPoll = draftEntry?.predictionStatus === 'PENDING'
                    || draftEntry?.predictionStatus === 'STARTED';

                    if (shouldPoll) {
                        setPredictionsLoading(true);
                        setRandomId(randomString());
                        refetch();
                    } else {
                        setPredictionsLoading(false);
                    }
                },
                2000,
            );

            return () => {
                clearTimeout(timeout);
            };
        },
        [
            data,
            refetch,
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
                        true,
                    );
                }
            },
        );

        submit();
    }, [
        data,
        allWidgets,
        geoAreaOptions,
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
                            recommendations={recommendations}
                            onChange={setValue}
                            name={undefined}
                            error={error}
                            leadId={leadId}
                            geoAreaOptions={geoAreaOptions}
                            onGeoAreaOptionsChange={setGeoAreaOptions}
                            predictionsLoading={
                                predictionsLoading
                                || draftEntryFetchPending
                                || draftEntryCreationPending
                            }
                            predictionsErrored={!!fetchErrors || !!createErrors || isErrored}
                            messageText={messageText}
                            footerActions={(
                                <>
                                    <QuickActionButton
                                        name={undefined}
                                        onClick={handleDiscardButtonClick}
                                        title="Discard Entry"
                                        variant="nlp-secondary"
                                    >
                                        <IoClose />
                                    </QuickActionButton>
                                    <QuickActionButton
                                        name={undefined}
                                        onClick={
                                            (
                                                (!!fetchErrors || !!createErrors || isErrored)
                                                || !!messageText
                                            )
                                                ? handleNormalEntryCreateButtonClick
                                                : handleEntryCreateButtonClick
                                        }
                                        disabled={predictionsLoading}
                                        variant="nlp-primary"
                                        title="Create Entry"
                                    >
                                        <FiEdit2 />
                                    </QuickActionButton>
                                </>
                            )}
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
