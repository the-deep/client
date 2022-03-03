import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Container } from '@the-deep/deep-ui';

import {
    Widget,
    CategoricalMappingsItem,
    Matrix1dMappingsItem,
    Matrix2dMappingsItem,
    ScaleMappingsItem,
    SelectMappingsItem,
    MultiSelectMappingsItem,
} from '#types/newAnalyticalFramework';

import Matrix1dTagInput from './Matrix1dTagInput';
import Matrix2dTagInput from './Matrix2dTagInput';
import OptionTypeTagInput from './OptionTypeTagInput';

import styles from './styles.css';

interface Props {
    className?: string;
    widget: Widget;
    mappings: CategoricalMappingsItem[] | undefined;
    onMappingsChange: (newMappings: CategoricalMappingsItem[], widgetPk: string) => void;
    selectedTag: string | undefined;
}

function WidgetTagList(props: Props) {
    const {
        className,
        widget,
        mappings,
        onMappingsChange,
        selectedTag,
    } = props;

    const filteredMappings = useMemo(
        () => mappings?.filter((mappingItem) => mappingItem.widgetType === widget.widgetId),
        [
            mappings,
            widget,
        ],
    );

    if (widget.widgetId === 'MATRIX1D') {
        return (
            <Container
                className={_cs(styles.widgetTagList, className)}
                heading={widget.title}
                headingSize="extraSmall"
            >
                <Matrix1dTagInput
                    widget={widget}
                    // NOTE: We know its safe
                    mappings={filteredMappings as Matrix1dMappingsItem[] | undefined}
                    onMappingsChange={onMappingsChange}
                    selectedTag={selectedTag}
                />
            </Container>
        );
    }

    if (widget.widgetId === 'MATRIX2D') {
        return (
            <Container
                className={_cs(styles.widgetTagList, className)}
                heading={widget.title}
                headingSize="extraSmall"
            >
                <Matrix2dTagInput
                    widget={widget}
                    // NOTE: We know its safe
                    mappings={filteredMappings as Matrix2dMappingsItem[] | undefined}
                    onMappingsChange={onMappingsChange}
                    selectedTag={selectedTag}
                />
            </Container>
        );
    }

    if (
        widget.widgetId === 'SCALE'
        || widget.widgetId === 'SELECT'
        || widget.widgetId === 'MULTISELECT'
    ) {
        return (
            <Container
                className={_cs(styles.widgetTagList, className)}
                heading={widget.title}
                headingSize="extraSmall"
            >
                <OptionTypeTagInput
                    widget={widget}
                    // NOTE: We know its safe
                    mappings={filteredMappings as (
                        ScaleMappingsItem | SelectMappingsItem
                        | MultiSelectMappingsItem
                    )[] | undefined}
                    onMappingsChange={onMappingsChange}
                    selectedTag={selectedTag}
                />
            </Container>
        );
    }

    return (
        <Container
            className={_cs(styles.widgetTagList, className)}
            heading={widget.title}
            headingSize="extraSmall"
        >
            This widget is not supported at the moment.
        </Container>
    );
}

export default WidgetTagList;
