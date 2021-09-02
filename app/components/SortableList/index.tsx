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

import { genericMemo } from '#utils/common';

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

interface SortableItemProps<
    D,
    P,
    K extends OptionKey,
    ItemContainerParams,
> {
    keySelector: (data: D) => K;
    datum: D;
    renderer: (props: P & {
        listeners?: Listeners;
        attributes?: Attributes;
    }) => JSX.Element;
    rendererParams: P;
    itemContainerParams?: ItemContainerParams;
}

function SortableItem<
    D,
    P,
    K extends OptionKey,
    ItemContainerParams,
>(props: SortableItemProps<D, P, K, ItemContainerParams>) {
    const {
        keySelector,
        renderer: Renderer,
        datum,
        rendererParams,
        itemContainerParams,
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
        <div
            ref={setNodeRef}
            style={style}
            {...itemContainerParams ?? {}}
        >
            <Renderer
                attributes={attributes}
                listeners={listeners}
                {...rendererParams}
            />
        </div>
    );
}

const MemoizedSortableItem = genericMemo(SortableItem);

export type Props<
    N extends string,
    D,
    P,
    K extends OptionKey,
    GP extends GroupCommonProps,
    GK extends OptionKey,
    ItemContainerParams,
> = Omit<ListViewProps<D, P, K, GP, GK>, 'keySelector' | 'renderer'> & {
    name: N;
    keySelector: (val: D) => K;
    renderer: (props: P & {
        listeners?: Listeners;
        attributes?: Attributes;
        setNodeRef?: NodeRef;
        style?: React.CSSProperties;
    }) => JSX.Element;
    onChange?: (newList: D[], name: N) => void;
    direction: 'vertical' | 'horizontal' | 'rect';
    showDragOverlay?: boolean;
    itemContainerParams?: (key: K, datum: D, index: number, data: D[]) => ItemContainerParams;
}

function SortableList<
    N extends string,
    D,
    P,
    K extends OptionKey,
    GP extends GroupCommonProps,
    GK extends OptionKey,
    ItemContainerParams,
>(
    props: Props<N, D, P, K, GP, GK, ItemContainerParams>,
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
        itemContainerParams,
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
        data?.map((d) => String(keySelector(d))) ?? []
    ), [data, keySelector]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id);
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(undefined);

        if (active.id && over?.id && active.id !== over?.id && items && onChange) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            const dataMap = listToMap(
                data ?? [],
                (d) => String(keySelector(d)),
                (d) => d,
            );
            const newData = newItems.map((item) => dataMap[item]);
            onChange(newData, name);
        }
    }, [keySelector, items, data, onChange, name]);

    const DragItem = useMemo(() => {
        if (!activeId || !data || !showDragOverlay) {
            return null;
        }
        const activeIndex = data.findIndex(
            (d) => String(keySelector(d)) === activeId,
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

        const containerParams = itemContainerParams && itemContainerParams(
            keySelector(datum),
            datum,
            index,
            dataFromArgs,
        );

        return ({
            rendererParams: params,
            itemContainerParams: containerParams,
            datum,
            keySelector,
            renderer: Renderer,
        });
    }, [keySelector, rendererParams, Renderer, itemContainerParams]);

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
                    emptyIcon={null}
                    emptyMessage={null}
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
