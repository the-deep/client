import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    unique,
    isDefined,
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
    MappingItem,
    isCategoricalMapping,
    mappingSupportedWidgets,
} from '#types/newAnalyticalFramework';
import {
    WidgetAttribute,
} from '#types/newEntry';

import {
    Framework,
} from '../../types';
import {
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

const mockAssistedMappingResponse = {
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

    const [mapping] = useLocalStorage<MappingItem[] | undefined>(`mapping-${frameworkDetails.id}`, undefined);

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
            filteredWidgets: widgets.filter((w) => mappingSupportedWidgets.includes(w.widgetId)),
        };
    }, [
        frameworkDetails,
    ]);

    // FIXME: Insert this inside onCompleted
    const handleMappingFetch = useCallback(() => {
        // TODO: Handle Number and Geo widgets
        const matchedMapping = mapping
            ?.filter(isCategoricalMapping)
            .filter((m) => mockAssistedMappingResponse.tags.includes(m.tagId));

        const recommendedAttributes: (WidgetAttribute | undefined)[] = [];
        filteredWidgets.forEach((widget) => {
            if (widget.widgetId === 'MATRIX1D') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterMatrix1dMappings);

                recommendedAttributes.push(
                    createMatrix1dAttr(
                        supportedTags,
                        widget,
                    ),
                );
            }
            if (widget.widgetId === 'MATRIX2D') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterMatrix2dMappings);

                recommendedAttributes.push(
                    createMatrix2dAttr(
                        supportedTags,
                        widget,
                    ),
                );
            }
            if (widget.widgetId === 'SCALE') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterScaleMappings);

                const {
                    attr,
                } = createScaleAttr(supportedTags, widget);
                recommendedAttributes.push(attr);
            }
            if (widget.widgetId === 'SELECT') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterSelectMappings);

                const {
                    attr,
                } = createSelectAttr(supportedTags, widget);
                recommendedAttributes.push(attr);
            }
            if (widget.widgetId === 'MULTISELECT') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetPk === widget.id)
                    .filter(filterMultiSelectMappings);

                recommendedAttributes.push(
                    createMultiSelectAttr(
                        supportedTags,
                        widget,
                    ),
                );
            }
            return undefined;
        });

        const attributes = recommendedAttributes.filter(isDefined);
        const attributesMap = listToMap(
            attributes,
            (attr) => attr.widget,
            (attr) => attr,
        );

        // FIXME: This should not be required
        const newEntry = {
            clientId: randomString(),
            entryType: 'EXCERPT' as const,
            lead: leadId,
            excerpt: selectedText,
            droppedExcerpt: selectedText,
            attributes,
        };
        onChange(
            (oldEntry) => {
                const oldAttributes = oldEntry?.attributes ?? [];
                // NOTE: Updating the existing attributes
                // FIXME: Currently overrides all info, maybe we should only update data
                const updatedAttributes = oldAttributes.map((attr) => (
                    attributesMap[attr.widget] ? (
                        attributesMap[attr.widget]
                    ) : (
                        attr
                    )
                ));

                // NOTE: Adding new attributes from suggestion and removing duplicates
                const newAttributes = unique([
                    ...updatedAttributes,
                    ...attributes,
                ], (attr) => attr.widget);

                // FIXME: Spreading newEntry does not seem right
                // need to discuss
                return {
                    ...newEntry,
                    ...oldEntry,
                    attributes: newAttributes,
                };
            },
            undefined,
        );
    }, [
        selectedText,
        leadId,
        mapping,
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
                        onClick={handleMappingFetch}
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
