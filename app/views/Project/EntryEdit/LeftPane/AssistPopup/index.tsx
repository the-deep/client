import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    Container,
    Button,
} from '@the-deep/deep-ui';

import useLocalStorage from '#hooks/useLocalStorage';
import {
    MappingItem,
    isCategoricalMapping,
    getWidgetVersion,
    mappingSupportedWidgets,
} from '#types/newAnalyticalFramework';

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
import AssistEntryForm from './AssistEntryForm';

import styles from './styles.css';

const mockAssistedMappingResponse = {
    tags: [
        '9',
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
    selectedText: string;
    onEntryCreate: (newEntry: PartialEntryType) => void;
}

function AssistPopup(props: Props) {
    const {
        className,
        selectedText,
        leadId,
        frameworkDetails,
        onEntryCreate,
    } = props;

    const [mapping] = useLocalStorage<MappingItem[] | undefined>(`mapping-${frameworkDetails.id}`, undefined);
    const [partialEntry, setPartialEntry] = useState<PartialEntryType>();
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

        const attributes = filteredWidgets.map((widget) => {
            if (widget.widgetId === 'MATRIX1D') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetClientId === widget.clientId)
                    .filter(filterMatrix1dMappings);

                return createMatrix1dAttr(
                    supportedTags,
                    widget,
                );
            }
            if (widget.widgetId === 'MATRIX2D') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetClientId === widget.clientId)
                    .filter(filterMatrix2dMappings);

                return createMatrix2dAttr(
                    supportedTags,
                    widget,
                );
            }
            if (widget.widgetId === 'SCALE') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetClientId === widget.clientId)
                    .filter(filterScaleMappings);

                return createScaleAttr(
                    supportedTags,
                    widget,
                ).attr;
            }
            if (widget.widgetId === 'SELECT') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetClientId === widget.clientId)
                    .filter(filterSelectMappings);

                return createSelectAttr(
                    supportedTags,
                    widget,
                ).attr;
            }
            if (widget.widgetId === 'MULTISELECT') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetClientId === widget.clientId)
                    .filter(filterMultiSelectMappings);

                return createMultiSelectAttr(
                    supportedTags,
                    widget,
                );
            }
            if (
                (
                    widget.widgetId === 'TEXT'
                    || widget.widgetId === 'DATE'
                    || widget.widgetId === 'TIME'
                )
                && widget.properties?.defaultValue
            ) {
                return ({
                    clientId: randomString(),
                    widget: widget.id,
                    widgetType: widget.widgetId,
                    widgetVersion: getWidgetVersion(widget.widgetId),
                    data: {
                        value: widget.properties.defaultValue,
                    },
                });
            }
            return undefined;
        }).filter(isDefined);

        const entry = {
            clientId: randomString(),
            entryType: 'EXCERPT' as const,
            lead: leadId,
            excerpt: selectedText,
            droppedExcerpt: selectedText,
            attributes,
        };
        setPartialEntry(entry);
    }, [
        mapping,
        selectedText,
        leadId,
        filteredWidgets,
    ]);

    return (
        <Container
            className={_cs(className, styles.assistPopup)}
            headingSize="extraSmall"
            spacing="compact"
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleMappingFetch}
                >
                    Create Entry
                </Button>
            )}
        >
            {partialEntry && (
                <AssistEntryForm
                    leadId={leadId}
                    entry={partialEntry}
                    onEntryCreate={onEntryCreate}
                    allWidgets={allWidgets}
                    frameworkDetails={frameworkDetails}
                />
            )}
        </Container>
    );
}

export default AssistPopup;
