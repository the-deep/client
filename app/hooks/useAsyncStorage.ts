import { useCallback, useEffect, useState, useRef } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import localforageInstance from '#base/configs/localforage';

// TODO: schema/data migration
// TODO: throttle instead of debouncing
// TODO: make throttle/debouncing time cutomizable
// TODO: do we need to read writeTimeout/schema before each write?
// TODO: store last written value so that diffing is possible on write
// TODO: use setItems and getItems from localforage

const SCHEMA_VERSION_SUFFIX = ':schema';
const WRITE_TIMESTAMP_SUFFIX = ':write-timestamp';
const VALUE_SUFFIX = ':value';

const prefix = '[useAsyncStorage]';

function useAsyncStorage<T extends object>(
    writeLocked: boolean,
    key: string | undefined,
    schemaVersion: number,
    onLoad?: (value: T | undefined) => void,
    debug = false,
) {
    const [readPending, setReadPending] = useState(true);
    const [initialState, setInitialState] = useState<T | undefined>(undefined);

    const [debugMode] = useState(debug);

    // Remember last written timestamp
    const writeTimestampRef = useRef<number | undefined>();
    // Identify if hook is mounted
    const mountedRef = useRef<boolean>(true);

    const writeTimeoutRef = useRef<number | undefined>();

    useEffect(
        () => {
            if (!key) {
                setReadPending(false);
                return undefined;
            }
            mountedRef.current = true;
            (async () => {
                if (debugMode) {
                    // eslint-disable-next-line no-console
                    console.info(`${prefix} Reading '${key}'`);
                }
                const startTime = new Date().getTime();

                const storedSchemaVersion: number | null = await localforageInstance.getItem(
                    key + SCHEMA_VERSION_SUFFIX,
                );
                const storedWriteTimestamp: number | null = await localforageInstance.getItem(
                    key + WRITE_TIMESTAMP_SUFFIX,
                );
                const storedValue: T | null = await localforageInstance.getItem(
                    key + VALUE_SUFFIX,
                );

                const endTime = new Date().getTime();
                if (debugMode) {
                    // eslint-disable-next-line no-console
                    console.info(`${prefix} Read '${key}' in ${endTime - startTime}ms`);
                }

                // FIXME: the types for above variables ignores null/undefined
                // could be a bug in typescript

                // NOTE: don't load anything if
                // - version is not defined or version does not match
                // - writeTimestamp is not defined
                if (
                    isNotDefined(storedWriteTimestamp)
                    || isNotDefined(storedSchemaVersion)
                    || storedSchemaVersion !== schemaVersion
                ) {
                    if (mountedRef.current) {
                        setReadPending(false);
                        if (onLoad) {
                            onLoad(undefined);
                        }
                    }
                    return;
                }

                if (debugMode) {
                    // eslint-disable-next-line no-console
                    console.info(`${prefix} Read '${key}' commited at ${new Date(storedWriteTimestamp)}`);
                }

                if (mountedRef.current) {
                    setInitialState(storedValue ?? undefined);
                    setReadPending(false);
                    if (onLoad) {
                        onLoad(storedValue ?? undefined);
                    }
                }
            })();

            return () => {
                mountedRef.current = false;
            };
        },
        [key, schemaVersion, onLoad, debugMode],
    );

    const handleSave = useCallback(
        (
            value: T | undefined,
            options?: ({
                immediateWrite: false | undefined,
            } | {
                immediateWrite: true,
                onWrite?: () => void,
            }),
        ) => {
            if (writeTimeoutRef.current) {
                window.clearTimeout(writeTimeoutRef.current);
            }

            if (!key) {
                // eslint-disable-next-line no-console
                console.error(`${prefix} Trying to save value when key is not defined`);
                return;
            }

            if (writeLocked) {
                // eslint-disable-next-line no-console
                console.error(`${prefix} Trying to save value when write is locked`);
                return;
            }
            if (readPending) {
                // eslint-disable-next-line no-console
                console.error(`${prefix} Trying to save value before initial read`);
                return;
            }

            /*
            if (initialState === value) {
                // eslint-disable-next-line no-console
                console.warn('Trying to save last value');
                return;
            }
            */

            const dataQueueTime = new Date().getTime();

            const saveHandler = async () => {
                writeTimeoutRef.current = undefined;

                const storedSchemaVersion: number | null = await localforageInstance.getItem(
                    key + SCHEMA_VERSION_SUFFIX,
                );
                const storedWriteTimestamp: number | null = await localforageInstance.getItem(
                    key + WRITE_TIMESTAMP_SUFFIX,
                );

                if (isDefined(storedSchemaVersion) && storedSchemaVersion > schemaVersion) {
                    // eslint-disable-next-line no-console
                    console.error([
                        `${prefix} Cannot set data with older schema`,
                        `Stored version: ${storedSchemaVersion}`,
                        `Supported version: ${schemaVersion}`,
                    ].join('\n'));
                    return;
                }

                if (isDefined(storedWriteTimestamp) && storedWriteTimestamp > dataQueueTime) {
                    // eslint-disable-next-line no-console
                    console.error([
                        `${prefix} Cannot set data older than stored timestamp`,
                        `Stored timestamp: ${storedWriteTimestamp}`,
                        `Current timestamp: ${dataQueueTime}`,
                    ].join('\n'));
                    return;
                }

                // NOTE: eventually storedWriteTimestamp should be equal to
                // writeTimestamp.
                // As we are debouncing our writes and the writes are also
                // async, storedWriteTimestamp and writeTimestamp may
                // differ
                if (writeTimestampRef.current && writeTimestampRef.current > dataQueueTime) {
                    // eslint-disable-next-line no-console
                    console.warn([
                        `${prefix} Cannot set data older than last write timestamp`,
                        `Last write timestamp: ${storedWriteTimestamp}`,
                        `Current timestamp: ${dataQueueTime}`,
                    ].join('\n'));
                    return;
                }

                // NOTE: setting writeTimestampRef before actually writing
                // (acts like a lock)
                // - assuming that these setItems will always succeed
                writeTimestampRef.current = dataQueueTime;

                if (debugMode) {
                    // eslint-disable-next-line no-console
                    console.info(`${prefix} Writing '${key}' commited at ${new Date(dataQueueTime)}`);
                }
                const startTime = new Date().getTime();

                await localforageInstance.setItem(key + SCHEMA_VERSION_SUFFIX, schemaVersion);
                await localforageInstance.setItem(key + WRITE_TIMESTAMP_SUFFIX, dataQueueTime);
                await localforageInstance.setItem(key + VALUE_SUFFIX, value);

                const endTime = new Date().getTime();
                if (debugMode) {
                    // eslint-disable-next-line no-console
                    console.info(`${prefix} Written '${key}' in ${endTime - startTime}ms`);
                }

                if (mountedRef.current && options && options.immediateWrite && options.onWrite) {
                    options.onWrite();
                }
            };

            if (options && options.immediateWrite) {
                saveHandler();
            } else {
                writeTimeoutRef.current = window.setTimeout(
                    saveHandler,
                    200,
                );
            }
        },
        [key, schemaVersion, readPending, writeLocked, debugMode],
    );

    return [
        readPending,
        initialState,
        handleSave,
    ] as const;
}

export default useAsyncStorage;
