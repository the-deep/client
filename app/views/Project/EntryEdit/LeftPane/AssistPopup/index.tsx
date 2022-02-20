import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Container,
    Button,
} from '@the-deep/deep-ui';

import useLocalStorage from '#hooks/useLocalStorage';
import {
    MappingItem,
    isCategoricalMapping,
} from '#types/newAnalyticalFramework';

import {
    Framework,
} from '../../types';
import {
    filterMatrix1dMappings,
    createMatrix1dAttr,
    filterMatrix2dMappings,
    createMatrix2dAttr,
} from './utils';

import styles from './styles.css';

const supportedWidgets = [
    'MATRIX1D',
    'MATRIX2D',
    'SCALE',
    'MULTISELECT',
    'SELECT',
    'NUMBER',
    'GEO',
];

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
}

function AssistPopup(props: Props) {
    const {
        className,
        frameworkDetails,
    } = props;

    const [mapping] = useLocalStorage<MappingItem[] | undefined>(`mapping-${frameworkDetails.id}`, undefined);

    const allWidgets = useMemo(() => {
        const widgetsFromPrimary = frameworkDetails.primaryTagging?.flatMap(
            (item) => (item.widgets ?? []),
        ) ?? [];
        const widgetsFromSecondary = frameworkDetails.secondaryTagging ?? [];
        return [
            ...widgetsFromPrimary,
            ...widgetsFromSecondary,
        ].filter((w) => supportedWidgets.includes(w.widgetId));
    }, [
        frameworkDetails,
    ]);

    // FIXME: Insert this inside onCompleted
    const handleMappingFetch = useCallback(() => {
        // TODO: Handle Number and Geo widgets
        const matchedMapping = mapping
            ?.filter(isCategoricalMapping)
            .filter((m) => mockAssistedMappingResponse.tags.includes(m.tagId));

        const attributes = allWidgets.map((widget) => {
            if (widget.widgetId === 'MATRIX1D') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetId === widget.clientId)
                    .filter(filterMatrix1dMappings);

                return createMatrix1dAttr(
                    supportedTags,
                    widget,
                );
            }
            if (widget.widgetId === 'MATRIX2D') {
                const supportedTags = matchedMapping
                    ?.filter((m) => m.widgetId === widget.clientId)
                    .filter(filterMatrix2dMappings);

                return createMatrix2dAttr(
                    supportedTags,
                    widget,
                );
            }
            return undefined;
        }).filter(isDefined);
        console.warn('I am here', attributes);
    }, [
        mapping,
        allWidgets,
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
            {frameworkDetails?.id}
        </Container>
    );
}

export default AssistPopup;
