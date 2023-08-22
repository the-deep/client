import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
    sum,
    randomString,
    compareNumber,
} from '@togglecorp/fujs';
import {
    ListView,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { IoAdd } from 'react-icons/io5';

import { reorder } from '#utils/common';

import styles from './styles.css';

interface Container {
    clientId: string;
    row: number;
    column: number;
    width: number;
}

const initialContainers: Container[] = [
    {
        clientId: '1',
        row: 1,
        column: 1,
        width: 3,
    },
    {
        clientId: '2',
        row: 1,
        column: 2,
        width: 6,
    },
    {
        clientId: '3',
        row: 2,
        column: 1,
        width: 3,
    },
];

interface ReportContainerProps {
    className?: string;
    containerKey?: string;
    row: number;
    column: number;
    width: number;
    allItems: Container[];
    onContainersChange: React.Dispatch<React.SetStateAction<Container[]>>;
}

function ReportContainer(props: ReportContainerProps) {
    const {
        className,
        containerKey,
        row,
        column,
        width,
        allItems,
        onContainersChange,
    } = props;

    const rowItems = useMemo(() => {
        const items = allItems.filter((item) => item.row === row);
        const newItems = [...items];
        newItems.sort((a, b) => compareNumber(a.column, b.column));
        return newItems;
    }, [
        allItems,
        row,
    ]);

    const indexInCurrentRow = rowItems.findIndex((item) => item.column === column);

    const totalColSpan = sum(rowItems.map((item) => item.width));

    const disableAddButtons = totalColSpan >= 12;

    const handleAddBeforeClick = useCallback(() => {
        const newRowItems = [...rowItems];
        const newItem = {
            row,
            column,
            clientId: randomString(),
            width: 12 - totalColSpan,
        };
        newRowItems.splice(indexInCurrentRow, 0, newItem);
        const orderedItems = reorder(newRowItems, 'column');

        onContainersChange((oldVal) => {
            const newVal = oldVal.filter((item) => item.row !== row);
            return [
                ...newVal,
                ...orderedItems,
            ];
        });
    }, [
        onContainersChange,
        indexInCurrentRow,
        row,
        totalColSpan,
        rowItems,
        column,
    ]);

    const handleAddAfterClick = useCallback(() => {
        const newRowItems = [...rowItems];
        const newItem = {
            row,
            column: column + 1,
            clientId: randomString(),
            width: 12 - totalColSpan,
        };
        newRowItems.splice(indexInCurrentRow + 1, 0, newItem);
        const orderedItems = reorder(newRowItems, 'column');

        onContainersChange((oldVal) => {
            const newVal = oldVal.filter((item) => item.row !== row);
            return [
                ...newVal,
                ...orderedItems,
            ];
        });
    }, [
        onContainersChange,
        indexInCurrentRow,
        row,
        totalColSpan,
        rowItems,
        column,
    ]);

    const handleAddAboveClick = useCallback(() => {
        onContainersChange((oldVal) => {
            const newItems = [...oldVal];
            const newItem = {
                row,
                column: 1,
                clientId: randomString(),
                width: 6,
            };
            const indexOfCurrentRow = oldVal.findIndex((item) => item.row === row);
            newItems.splice(indexOfCurrentRow, 0, newItem);
            return newItems.map((item) => ({
                ...item,
                row: (item.row >= newItem.row && item.clientId !== newItem.clientId)
                    ? (item.row + 1)
                    : item.row,
            }));
        });
    }, [
        onContainersChange,
        row,
    ]);

    const handleAddBelowClick = useCallback(() => {
        onContainersChange((oldVal) => {
            const newItems = [...oldVal];
            const newItem = {
                row: row + 1,
                column: 1,
                clientId: randomString(),
                width: 6,
            };
            const indexOfRowAfter = oldVal.findIndex((item) => item.row === row + 1);
            newItems.splice(indexOfRowAfter, 0, newItem);
            return newItems.map((item) => ({
                ...item,
                row: (item.row >= newItem.row && item.clientId !== newItem.clientId)
                    ? (item.row + 1)
                    : item.row,
            }));
        });
    }, [
        onContainersChange,
        row,
    ]);

    return (
        <div
            className={_cs(className, styles.item)}
            style={{
                gridRow: row,
                gridColumn: `span ${width}`,
            }}
        >
            <QuickActionButton
                className={_cs(styles.beforeButton, styles.addButton)}
                name={undefined}
                onClick={handleAddBeforeClick}
                disabled={disableAddButtons}
                variant="secondary"
                spacing="compact"
            >
                <IoAdd />
            </QuickActionButton>
            <QuickActionButton
                className={_cs(styles.afterButton, styles.addButton)}
                name={undefined}
                onClick={handleAddAfterClick}
                disabled={disableAddButtons}
                variant="secondary"
                spacing="compact"
            >
                <IoAdd />
            </QuickActionButton>
            <QuickActionButton
                className={_cs(styles.aboveButton, styles.addButton)}
                name={undefined}
                onClick={handleAddAboveClick}
                variant="secondary"
                spacing="compact"
            >
                <IoAdd />
            </QuickActionButton>
            <QuickActionButton
                className={_cs(styles.belowButton, styles.addButton)}
                name={undefined}
                onClick={handleAddBelowClick}
                variant="secondary"
                spacing="compact"
            >
                <IoAdd />
            </QuickActionButton>
            {containerKey}
        </div>
    );
}

interface Props {
    className?: string;
}

function ReportBuilder(props: Props) {
    const {
        className,
    } = props;

    const [containers, setContainers] = useState<Container[]>(initialContainers);

    const reportContainerRendererParams = useCallback(
        (
            containerKey: string,
            item: Container,
            _: number,
            allItems: Container[],
        ) => ({
            row: item.row,
            column: item.column,
            onContainersChange: setContainers,
            width: item.width,
            allItems,
            containerKey,
        }),
        [],
    );

    const orderedContainers = useMemo(() => {
        const sortedContainers = [...containers];
        sortedContainers.sort((a, b) => compareNumber(a.row + a.column, b.row + b.column));
        return sortedContainers;
    }, [containers]);

    return (
        <div className={_cs(className, styles.reportBuilder)}>
            <ListView
                className={styles.containers}
                data={orderedContainers}
                keySelector={(d) => d.clientId}
                renderer={ReportContainer}
                rendererParams={reportContainerRendererParams}
                errored={false}
                filtered={false}
                pending={false}
            />
        </div>
    );
}

export default ReportBuilder;
