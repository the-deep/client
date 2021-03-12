import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
    onPointerDown?: (e: PointerEvent) => void;
    onPointerMove?: (e: PointerEvent) => void;
    onPointerUp?: (e: PointerEvent) => void;
    onDragMove: (e: PointerEvent) => void;
}
function useDragMove(props: Props) {
    const { onPointerDown, onPointerUp, onPointerMove, onDragMove } = props;
    const isDraggingRef = useRef<boolean>(false);

    const handlePointerDown = useCallback((e) => {
        isDraggingRef.current = true;

        if (onPointerDown) {
            onPointerDown(e);
        }
    }, [onPointerDown]);

    const handlePointerUp = useCallback((e) => {
        isDraggingRef.current = false;

        if (onPointerUp) {
            onPointerUp(e);
        }
    }, [onPointerUp]);

    const handlePointerMove = useCallback((e) => {
        if (isDraggingRef.current) {
            onDragMove(e);
        }
        if (onPointerMove) {
            onPointerMove(e);
        }
    }, [onDragMove, onPointerMove]);

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [handlePointerMove, handlePointerUp]);

    return { handlePointerDown };
}

export default useDragMove;
