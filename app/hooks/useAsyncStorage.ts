import { useCallback, useEffect, useState, useRef } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import localforage from 'localforage';

// TODO: setup localstorage
// TODO: clear whole localstorage

const SCHEMA_VERSION_SUFFIX = ':schema';
const WRITE_TIMESTAMP_SUFFIX = ':write-timestamp';
const VALUE_SUFFIX = ':value';

function useAsyncStorage<T>(
    key: string,
    schemaVersion: number,
) {
    const [readPending, setReadPending] = useState(true);
    const [initialState, setInitialState] = useState<T | undefined>(undefined);

    const writeTimestampRef = useRef<number | undefined>();
    const writeTimeoutRef = useRef<number | undefined>();

    useEffect(
        () => {
            let mounted = true;
            (async () => {
                const storedSchemaVersion: number | null = await localforage.getItem(
                    key + SCHEMA_VERSION_SUFFIX,
                );
                const storedWriteTimestamp: number | null = await localforage.getItem(
                    key + WRITE_TIMESTAMP_SUFFIX,
                );
                const storedValue: T | null = await localforage.getItem(key + VALUE_SUFFIX);
                // FIXME: the types for above variables do not include null
                // could be a bug in typescript

                // NOTE: clear everything if version doesn't match
                if (
                    isNotDefined(storedSchemaVersion)
                    || storedSchemaVersion !== schemaVersion
                    || isNotDefined(storedWriteTimestamp)
                ) {
                    // TODO: apply migration logic when schemaVersion !== version
                    await localforage.removeItem(key + SCHEMA_VERSION_SUFFIX);
                    await localforage.removeItem(key + WRITE_TIMESTAMP_SUFFIX);
                    await localforage.removeItem(key + VALUE_SUFFIX);

                    // locationVersionRef is undefined
                    // state is undefined
                    if (mounted) {
                        setReadPending(false);
                    }
                    return;
                }

                if (mounted) {
                // NOTE: set localversion
                    writeTimestampRef.current = storedWriteTimestamp;
                    setInitialState(storedValue ?? undefined);
                    setReadPending(false);
                }
            })();

            return () => {
                mounted = false;
            };
        },
        [key, schemaVersion],
    );

    const handleSave = useCallback(
        (value: T | undefined) => {
            if (writeTimeoutRef.current) {
                window.clearTimeout(writeTimeoutRef.current);
            }
            window.setTimeout(
                // TODO: throttle instead of debouncing
                async () => {
                    writeTimeoutRef.current = undefined;

                    const storedSchemaVersion: number | null = await localforage.getItem(
                        key + SCHEMA_VERSION_SUFFIX,
                    );
                    const storedWriteTimestamp: number | null = await localforage.getItem(
                        key + WRITE_TIMESTAMP_SUFFIX,
                    );

                    if (isDefined(storedSchemaVersion) && storedSchemaVersion > schemaVersion) {
                        console.error('Cannot set data with older schema');
                        return;
                    }
                    if (
                        isDefined(storedWriteTimestamp)
                        && (
                            !writeTimestampRef.current
                            || storedWriteTimestamp !== writeTimestampRef.current
                        )
                    ) {
                        // TODO: show error
                        console.error('Cannot set data with older/newer version');
                        return;
                    }

                    if (isNotDefined(value)) {
                        await localforage.removeItem(key + SCHEMA_VERSION_SUFFIX);
                        await localforage.removeItem(key + WRITE_TIMESTAMP_SUFFIX);
                        await localforage.removeItem(key + VALUE_SUFFIX);
                        writeTimestampRef.current = undefined;
                    } else {
                        // FIXME: we can also use (oldVersion + 1)
                        const newWriteTimestamp = new Date().getTime();
                        await localforage.setItem(key + SCHEMA_VERSION_SUFFIX, schemaVersion);
                        await localforage.setItem(key + WRITE_TIMESTAMP_SUFFIX, newWriteTimestamp);
                        await localforage.setItem(key + VALUE_SUFFIX, value);
                        writeTimestampRef.current = newWriteTimestamp;
                    }
                },
                // FIXME: make time cutomizable
                200,
            );
        },
        [key, schemaVersion],
    );

    return [
        readPending,
        initialState,
        handleSave,
    ] as const;
}

export default useAsyncStorage;
