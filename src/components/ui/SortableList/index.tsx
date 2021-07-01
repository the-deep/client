import React, { useMemo, useCallback } from 'react';
import {
    ListView,
    ListViewProps,
} from '@the-deep/deep-ui';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
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

type Props<
    N extends string,
    D,
    P,
    K extends OptionKey,
    GP extends GroupCommonProps,
    GK extends OptionKey
> = Omit<ListViewProps<D, P, K, GP, GK>, 'keySelector'> & {
    name: N,
    keySelector: (val: D) => K,
    onChange: (newList: D[], name: N) => void,
    direction: 'vertical' | 'horizontal',
    onDragEnd?: (key: K) => void;
    onDragStart?: (key: K) => void;
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
        onDragEnd,
        onDragStart,
        ...otherProps
    } = props;
    // const [activeId, setActiveId] = useState<string | undefined>();

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
        /*
        setActiveId(active.id);
        */
        const selectedData = data?.find(d => keySelector(d) === active.id);

        if (onDragStart && selectedData) {
            onDragStart(keySelector(selectedData));
        }
    }, [onDragStart, data, keySelector]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id && over?.id && active.id !== over?.id && items) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            const selectedData = data?.find(d => keySelector(d) === active.id);

            if (onDragEnd && selectedData) {
                onDragEnd(keySelector(selectedData));
            }

            const newItems = arrayMove(items, oldIndex, newIndex);
            const dataMap = listToMap(
                data,
                d => String(keySelector(d)),
                d => d,
            );
            const newData = newItems.map(item => dataMap[item]);
            onChange(newData, name);
        }
        // setActiveId(undefined);
    }, [onDragEnd, keySelector, items, data, onChange, name]);

    /*
    const DragItem = useMemo(() => {
        if (!activeId || !data) {
            return null;
        }
        const activeIndex = data.findIndex(
            (d, index) => String(keySelector(d, index)) === activeId,
        );
        if (!activeIndex) {
            return null;
        }
        const params = rendererParams(
            keySelector(data[activeIndex], activeIndex),
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
    */

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
        </DndContext>
    );
}

export default SortableList;
