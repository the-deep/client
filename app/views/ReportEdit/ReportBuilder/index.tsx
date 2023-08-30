import React, { useMemo, useCallback } from 'react';
import {
    type EntriesAsList,
} from '@togglecorp/toggle-form';
import {
    _cs,
    compareNumber,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import {
    type PartialFormType,
    type ReportContainerType,
} from '../schema';

import ReportContainer from './ReportContainer';

import styles from './styles.css';

interface Props {
    className?: string;
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
}

function ReportBuilder(props: Props) {
    const {
        className,
        value,
        setFieldValue,
    } = props;

    const reportContainerRendererParams = useCallback(
        (
            containerKey: string,
            item: ReportContainerType,
            _: number,
            allItems: ReportContainerType[] | undefined,
        ) => ({
            row: item.row,
            column: item.column,
            setFieldValue,
            width: item.width,
            allItems,
            containerKey,
        }),
        [setFieldValue],
    );

    const orderedContainers = useMemo(() => {
        const sortedContainers = [...(value?.containers) ?? []];
        sortedContainers.sort((a, b) => (
            compareNumber(a.row, b.row) || compareNumber(a.column, b.column)
        ));
        return sortedContainers;
    }, [value?.containers]);

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
