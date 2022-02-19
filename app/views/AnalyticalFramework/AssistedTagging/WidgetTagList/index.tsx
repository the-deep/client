import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Container } from '@the-deep/deep-ui';

import {
    Widget,
    MappingItem,
} from '#types/newAnalyticalFramework';

import Matrix1dTagInput from './Matrix1dTagList';
import Matrix2dTagInput from './Matrix2dTagInput';
import ScaleTagInput from './ScaleTagInput';

import styles from './styles.css';

interface Props {
    className?: string;
    widget: Widget;
    mapping: MappingItem[] | undefined;
    onMappingChange: React.Dispatch<React.SetStateAction<MappingItem[] | undefined>>;
    selectedTag: string | undefined;
}

function WidgetTagList(props: Props) {
    const {
        className,
        widget,
        mapping,
        onMappingChange,
        selectedTag,
    } = props;

    if (widget.widgetId === 'MATRIX1D') {
        return (
            <Container
                className={_cs(styles.widgetTagList, className)}
                heading={widget.title}
                headingSize="extraSmall"
            >
                <Matrix1dTagInput
                    widget={widget}
                    mapping={mapping}
                    onMappingChange={onMappingChange}
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
                    mapping={mapping}
                    onMappingChange={onMappingChange}
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
                <ScaleTagInput
                    widget={widget}
                    mapping={mapping}
                    onMappingChange={onMappingChange}
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
            {widget.title}
        </Container>
    );
}

export default WidgetTagList;
