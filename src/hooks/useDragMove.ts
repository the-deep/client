import { useState, useEffect, useCallback } from 'react';

interface Props {
    onPointerDown?: (e: PointerEvent) => void;
    onPointerMove?: (e: PointerEvent) => void;
    onPointerUp?: (e: PointerEvent) => void;
    onDragMove: (e: PointerEvent) => void;
}
function useDragMove(props: Props) {
    const { onPointerDown, onPointerUp, onPointerMove, onDragMove } = props;
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handlePointerDown = useCallback((e) => {
        setIsDragging(true);
        if (onPointerDown) {
            onPointerDown(e);
        }
    }, [onPointerDown]);

    const handlePointerUp = useCallback((e) => {
        setIsDragging(false);
        if (onPointerUp) {
            onPointerUp(e);
        }
    }, [onPointerUp]);

    const handlePointerMove = useCallback((e) => {
        if (isDragging) {
            onDragMove(e);
        }
        if (onPointerMove) {
            onPointerMove(e);
        }
    }, [onDragMove, onPointerMove, isDragging]);

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [handlePointerMove, handlePointerUp]);

    return { isDragging, handlePointerDown };
}

export default useDragMove;
