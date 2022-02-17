import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
    Card,
    Container,
    ContainerCard,
    Header,
    Checkbox,
} from '@the-deep/deep-ui';

import {
    mockAssistedTags,
    AssistedTag,
    Widget,
    MappingItem,
} from '#types/newAnalyticalFramework';

import { WidgetsType } from '../schema';
import CheckButton from './CheckButton';
import WidgetTagList from './WidgetTagList';
import CellGroup from './CellGroup';

import styles from './styles.css';

const nlpLabelGroupKeySelector = (n: AssistedTag) => n.labelGroup;
const nlpLabelKeySelector = (n: AssistedTag) => n.id;
const widgetKeySelector = (n: Widget) => n.id;

const supportedWidgets = [
    'MATRIX1D',
    'MATRIX2D',
    'SCALE',
    'MULTISELECT',
    'SELECT',
];

interface Props {
    className?: string;
    allWidgets: WidgetsType | undefined;
    assistedTaggingEnabled: boolean | undefined;
    onAssistedTaggingStatusChange: (newVal: boolean) => void;
    pending?: boolean;
}

function AssistedTagging(props: Props) {
    const {
        className,
        allWidgets,
        assistedTaggingEnabled,
        pending,
        onAssistedTaggingStatusChange,
    } = props;

    const [selectedTag, setSelectedTag] = useState<string | undefined>();
    const [mapping, setMapping] = useState<MappingItem[] | undefined>();

    const widgets = useMemo(() => (
        allWidgets
            ?.filter((w) => (
                isDefined(w.id) && supportedWidgets.includes(w.widgetId)
            ))
    ), [allWidgets]);

    const nlpLabelGroupRendererParams = useCallback((title: string) => ({
        title,
    }), []);

    const nlpRendererParams = useCallback((itemKey: string, tag: AssistedTag) => ({
        title: tag.label,
        itemKey,
        value: selectedTag === itemKey,
        onTagClick: setSelectedTag,
    }), [selectedTag]);

    const widgetRendererParams = useCallback((_: string, widget: Widget) => ({
        widget,
        mapping,
        onMappingChange: setMapping,
        selectedTag,
    }), [mapping, selectedTag]);

    return (
        <div className={_cs(className, styles.assistedTagging)}>
            <Header
                className={styles.header}
                heading="Assisted Tagging"
                headingSize="small"
                description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
                actions={(
                    <Checkbox
                        name="isAssistedTaggingEnabled"
                        value={assistedTaggingEnabled}
                        onChange={onAssistedTaggingStatusChange}
                        disabled={pending}
                        label="Active"
                    />
                )}
            />
            <Card className={styles.content}>
                <Container
                    className={styles.nlpFramework}
                    heading="NLP Framework"
                >
                    <ListView
                        data={mockAssistedTags}
                        renderer={CheckButton}
                        rendererParams={nlpRendererParams}
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
                <ContainerCard
                    className={styles.currentFramework}
                    heading="Selected Framework"
                >
                    <ListView
                        data={widgets}
                        renderer={WidgetTagList}
                        rendererParams={widgetRendererParams}
                        keySelector={widgetKeySelector}
                        filtered={false}
                        pending={false}
                        errored={false}
                    />
                </ContainerCard>
            </Card>
        </div>
    );
}

export default AssistedTagging;
