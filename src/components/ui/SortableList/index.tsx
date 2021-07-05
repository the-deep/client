import React, { useState, useMemo, useCallback } from 'react';
import {
    Portal,
    ListView,
    ListViewProps,
} from '@the-deep/deep-ui';
import {
    DragOverlay,
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DraggableSyntheticListeners,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
    restrictToHorizontalAxis,
    restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
    useSortable,
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { listToMap } from '@togglecorp/fujs';

import { genericMemo } from '#utils/safeCommon';

type OptionKey = string | number;
interface GroupCommonProps {
    className?: string;
    children: React.ReactNode;
}

export type Listeners = DraggableSyntheticListeners;
export type NodeRef = (node: HTMLElement | null) => void;

export interface Attributes {
    role: string;
    tabIndex: number;
    'aria-pressed': boolean | undefined;
    'aria-roledescription': string;
    'aria-describedby': string;
}

interface SortableItemProps<D, P, K extends OptionKey> {
    keySelector: (data: D) => K;
    datum: D;
    renderer: (props: P & {
        listeners?: Listeners;
        attributes?: Attributes;
        setNodeRef?: NodeRef;
        style?: React.CSSProperties;
    }) => JSX.Element;
    rendererParams: P;
}

function SortableItem<D, P, K extends OptionKey>(props: SortableItemProps<D, P, K>) {
    const {
        keySelector,
        renderer: Renderer,
        datum,
        rendererParams,
    } = props;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: String(keySelector(datum)) });

    const style: React.CSSProperties = useMemo(() => ({
        transform: CSS.Transform.toString({
            x: transform?.x ?? 0,
            y: transform?.y ?? 0,
            scaleX: 1,
            scaleY: 1,
        }),
        transition: transition ?? undefined,
    }), [transition, transform]);

    return (
        <Renderer
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setNodeRef}
            style={style}
            {...rendererParams}
        />
    );
}

const MemoizedSortableItem = genericMemo(SortableItem);

type Props<
    N extends string,
    D,
    P,
    K extends OptionKey,
    GP extends GroupCommonProps,
    GK extends OptionKey
> = Omit<ListViewProps<D, P, K, GP, GK>, 'keySelector' | 'renderer'> & {
    name: N;
    keySelector: (val: D) => K;
    renderer: (props: P & {
        listeners?: Listeners;
        attributes?: Attributes;
        setNodeRef?: NodeRef;
        style?: React.CSSProperties;
    }) => JSX.Element;
    onChange: (newList: D[], name: N) => void;
    direction: 'vertical' | 'horizontal' | 'rect';
    showDragOverlay?: boolean;
}

function SortableList<
    N extends string,
    D,
    P,
    K extends OptionKey,
    GP extends GroupCommonProps,
    GK extends OptionKey
>(
    props: Props<N, D, P, K, GP, GK>,
) {
    const {
        className,
        name,
        onChange,
        data,
        keySelector,
        rendererParams,
        renderer: Renderer,
        direction,
        showDragOverlay,
        ...otherProps
    } = props;
    const [activeId, setActiveId] = useState<string | undefined>();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // NOTE: Sortable context requires list of items
    const items = useMemo(() => (
        data?.map(d => String(keySelector(d))) ?? []
    ), [data, keySelector]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id);
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(undefined);

        if (active.id && over?.id && active.id !== over?.id && items) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            const dataMap = listToMap(
                data,
                d => String(keySelector(d)),
                d => d,
            );
            const newData = newItems.map(item => dataMap[item]);
            onChange(newData, name);
        }
    }, [keySelector, items, data, onChange, name]);

    const DragItem = useMemo(() => {
        if (!activeId || !data || !showDragOverlay) {
            return null;
        }
        const activeIndex = data.findIndex(
            d => String(keySelector(d)) === activeId,
        );
        if (!activeIndex) {
            return null;
        }
        const params = rendererParams(
            keySelector(data[activeIndex]),
            data[activeIndex],
            activeIndex,
            data,
        );
        return (
            <Renderer
                {...params}
            />
        );
    }, [
        activeId,
        Renderer,
        keySelector,
        rendererParams,
        data,
        showDragOverlay,
    ]);

    const modifiedRendererParams = useCallback((
        _: K,
        datum: D,
        index: number,
        dataFromArgs: D[],
    ) => {
        const params = rendererParams(
            keySelector(datum),
            datum,
            index,
            dataFromArgs,
        );

        return ({
            rendererParams: params,
            datum,
            keySelector,
            renderer: Renderer,
        });
    }, [keySelector, rendererParams, Renderer]);

    const sortingStrategy = useMemo(() => {
        if (direction === 'rect') {
            return rectSortingStrategy;
        }
        if (direction === 'vertical') {
            return verticalListSortingStrategy;
        }
        return horizontalListSortingStrategy;
    }, [direction]);

    const modifiers = useMemo(() => {
        if (direction === 'rect') {
            return undefined;
        }
        return [
            direction === 'horizontal' ? restrictToHorizontalAxis : restrictToVerticalAxis,
        ];
    }, [direction]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={modifiers}
        >
            <SortableContext
                items={items}
                strategy={sortingStrategy}
            >
                <ListView
                    className={className}
                    data={data}
                    keySelector={keySelector}
                    renderer={MemoizedSortableItem}
                    rendererParams={modifiedRendererParams}
                    {...otherProps}
                    grouped={false}
                />
            </SortableContext>
            {showDragOverlay && (
                <Portal>
                    <DragOverlay>
                        {DragItem}
                    </DragOverlay>
                </Portal>
            )}
        </DndContext>
    );
}

export default genericMemo(SortableList);
