import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    unique,
    randomString,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
} from '@togglecorp/toggle-form';

import useLocalStorage from '#hooks/useLocalStorage';
import EntryInput from '#components/entry/EntryInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    MappingsItem,
    isCategoricalMappings,
    mappingsSupportedWidgets,
} from '#types/newAnalyticalFramework';

import {
    Framework,
} from '../../types';
import {
    PartialAttributeType,
    PartialEntryType,
} from '../../schema';
import {
    filterMatrix1dMappings,
    createMatrix1dAttr,
    filterMatrix2dMappings,
    createMatrix2dAttr,
    filterScaleMappings,
    createScaleAttr,
    filterSelectMappings,
    createSelectAttr,
    filterMultiSelectMappings,
    createMultiSelectAttr,
} from './utils';

import styles from './styles.css';

const mockAssistedMappingsResponse = {
    tags: [
        '9',
        '6',
        '11',
        '12',
        '5',
        '2',
    ],
    numbers: [122, 1123, 541],
    locations: ['Kathmandu'],
};

interface Props {
    className?: string;
    frameworkDetails: Framework;
    leadId: string;
    value: PartialEntryType;
    onChange: (val: SetValueArg<PartialEntryType>, name: undefined) => void;
    selectedText: string;
    error: Error<PartialEntryType> | undefined;
    onEntryCreateButtonClick: () => void;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onCloseButtonClick: () => void;
}

function AssistPopup(props: Props) {
    const {
        className,
        onCloseButtonClick,
        selectedText,
        leadId,
        value,
        onChange,
        error,
        frameworkDetails,
        onEntryCreateButtonClick,
        geoAreaOptions,
        onGeoAreaOptionsChange,
    } = props;

    const [mappings] = useLocalStorage<MappingsItem[] | undefined>(`mappings-${frameworkDetails.id}`, undefined);

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

    // FIXME: Insert this inside onCompleted
    const handleMappingsFetch = useCallback(() => {
        // TODO: Handle Number and Geo widgets
        const matchedMappings = mappings
            ?.filter(isCategoricalMappings)
            .filter((m) => mockAssistedMappingsResponse.tags.includes(m.tagId));

        const recommendedAttributes: PartialAttributeType[] = [];
        const widgetsHints = [];
        filteredWidgets.forEach((widget) => {
            if (widget.widgetId === 'MATRIX1D') {
                const supportedTags = matchedMappings
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterMatrix1dMappings);

                const attr = createMatrix1dAttr(supportedTags, widget);
                if (attr) {
                    recommendedAttributes.push(attr);
                }
            }
            if (widget.widgetId === 'MATRIX2D') {
                const supportedTags = matchedMappings
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterMatrix2dMappings);

                const attr = createMatrix2dAttr(supportedTags, widget);
                if (attr) {
                    recommendedAttributes.push(attr);
                }
            }
            if (widget.widgetId === 'SCALE') {
                const supportedTags = matchedMappings
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterScaleMappings);

                const {
                    attr,
                    hints,
                } = createScaleAttr(supportedTags, widget);

                if (attr) {
                    recommendedAttributes.push(attr);
                }

                if (hints) {
                    widgetsHints.push({
                        widgetPk: widget.id,
                        hints,
                    });
                }
            }
            if (widget.widgetId === 'SELECT') {
                const supportedTags = matchedMappings
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterSelectMappings);

                const {
                    attr,
                    hints,
                } = createSelectAttr(supportedTags, widget);
                if (attr) {
                    recommendedAttributes.push(attr);
                }
                if (hints) {
                    widgetsHints.push({
                        widgetPk: widget.id,
                        hints,
                    });
                }
            }
            if (widget.widgetId === 'MULTISELECT') {
                const supportedTags = matchedMappings
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterMultiSelectMappings);

                const attr = createMultiSelectAttr(
                    supportedTags,
                    widget,
                );
                if (attr) {
                    recommendedAttributes.push();
                }
            }
            return undefined;
        });

        const recommentedAttributesMap = listToMap(
            recommendedAttributes,
            (attr) => attr.widget,
            (attr) => attr,
        );

        onChange(
            (oldEntry) => {
                if (!oldEntry) {
                    const newEntry = {
                        clientId: randomString(),
                        entryType: 'EXCERPT' as const,
                        lead: leadId,
                        excerpt: selectedText,
                        droppedExcerpt: selectedText,
                        attributes: recommendedAttributes,
                    };

                    return newEntry;
                }
                const oldAttributes = oldEntry?.attributes ?? [];

                // NOTE: Updating the existing attributes
                // FIXME: Currently overrides all info, maybe we should only update data
                const updatedAttributes = oldAttributes.map((attr) => (
                    recommentedAttributesMap[attr.widget] ? ({
                        ...recommentedAttributesMap[attr.widget],
                        clientId: attr.clientId,
                        widget: attr.widget,
                        id: attr.id,
                        widgetVersion: attr.widgetVersion,
                    }) : (
                        attr
                    )
                ));

                const oldAttributesMap = listToMap(
                    oldAttributes,
                    (attr) => (attr.widget),
                    () => true,
                );
                const removedNewAttributes = recommendedAttributes.filter(
                    (attr) => !oldAttributesMap[attr.widget],
                );

                // NOTE: Adding new attributes from suggestion and removing duplicates
                const newAttributes = unique([
                    ...removedNewAttributes,
                    ...updatedAttributes,
                ], (attr) => attr.widget);

                // FIXME: Spreading newEntry does not seem right
                // need to discuss
                return {
                    ...oldEntry,
                    attributes: newAttributes,
                };
            },
            undefined,
        );
    }, [
        selectedText,
        leadId,
        mappings,
        onChange,
        filteredWidgets,
    ]);

    return (
        <Modal
            className={_cs(className, styles.assistPopup)}
            heading="Assisted Tagging"
            headingSize="extraSmall"
            onCloseButtonClick={onCloseButtonClick}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={handleMappingsFetch}
                    >
                        Fetch Details
                    </Button>
                    <Button
                        name={undefined}
                        onClick={onEntryCreateButtonClick}
                    >
                        Create Entry
                    </Button>
                </>
            )}
        >
            <EntryInput
                leadId={leadId}
                name={undefined}
                error={error}
                value={value}
                onChange={onChange}
                primaryTagging={frameworkDetails.primaryTagging}
                secondaryTagging={frameworkDetails.secondaryTagging}
                entryImage={undefined}
                onAddButtonClick={undefined}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                allWidgets={allWidgets}
                emptyValueHidden
                addButtonHidden
                compact
            />
        </Modal>
    );
}

export default AssistPopup;
