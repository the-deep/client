import React, { useState, useMemo, useCallback } from 'react';
import {
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
import {
    restrictToHorizontalAxis,
    restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    listToMap,
} from '@togglecorp/fujs';

type OptionKey = string | number;
interface GroupCommonProps {
    className?: string;
    children: React.ReactNode;
}

export type Listeners = DraggableSyntheticListeners;

export interface Attributes {
    role: string;
    tabIndex: number;
    'aria-pressed': boolean | undefined;
    'aria-roledescription': string;
    'aria-describedby': string;
}

type Props<
    N extends string,
    D,
    P extends {
        listeners: Listeners,
        attributes: Attributes,
    },
    K extends OptionKey,
    GP extends GroupCommonProps,
    GK extends OptionKey
> = Omit<ListViewProps<D, P, K, GP, GK>, 'keySelector'> & {
    name: N,
    keySelector: (val: D) => K,
    onChange: (newList: D[], name: N) => void,
    direction: 'vertical' | 'horizontal',
}

function SortableList<
    N extends string,
    D,
    P extends {
        listeners: Listeners,
        attributes: Attributes,
    },
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
        data?.map(d => String(keySelector(d)))
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
        if (!activeId || !data) {
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
    }, [activeId, Renderer, keySelector, rendererParams, data]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[
                direction === 'horizontal' ? restrictToHorizontalAxis : restrictToVerticalAxis,
            ]}
        >
            <SortableContext
                items={items ?? []}
                strategy={direction === 'horizontal' ? horizontalListSortingStrategy : verticalListSortingStrategy}
            >
                <ListView
                    className={className}
                    data={data}
                    keySelector={keySelector}
                    renderer={Renderer}
                    rendererParams={rendererParams}
                    {...otherProps}
                    grouped={false}
                />
            </SortableContext>
            <DragOverlay>
                {DragItem}
            </DragOverlay>
        </DndContext>
    );
}

export default SortableList;
