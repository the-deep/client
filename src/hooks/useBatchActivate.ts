import { useState, useCallback } from 'react';

function useBatchActivate(batchSize = 1) {
    const [count, setCount] = useState(0);

    const incrementCount = useCallback(() => {
        setCount((v: number) => (v + 1));
    }, []);
    const clearCount = useCallback(() => {
        setCount(0);
    }, []);

    const isActive = useCallback(value => (
        value >= count && value < count + batchSize
    ), [batchSize, count]);

    return { incrementCount, clearCount, isActive };
}

export default useBatchActivate;
