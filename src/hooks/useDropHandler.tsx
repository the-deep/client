import React, { useCallback } from 'react';

interface DragHandler<T> {
    (e: React.DragEvent<T>): void;
}

function useDropHandler(
    dropHandler: DragHandler<HTMLDivElement>,
    dragStartHandler?: DragHandler<HTMLDivElement>,
) {
    const [dropping, setDropping] = React.useState(false);
    const dragEnterCount = React.useRef(0);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        if (dragEnterCount.current === 0) {
            setDropping(true);

            if (dragStartHandler) {
                dragStartHandler(e);
            }
        }
        dragEnterCount.current += 1;
    }, [dragStartHandler]);

    const onDragLeave = useCallback(() => {
        dragEnterCount.current -= 1;
        if (dragEnterCount.current === 0) {
            setDropping(false);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        dragEnterCount.current = 0;
        setDropping(false);

        dropHandler(e);

        e.preventDefault();
    }, [dropHandler]);

    return {
        dropping,

        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
    };
}

export default useDropHandler;
