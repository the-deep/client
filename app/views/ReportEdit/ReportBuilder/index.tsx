import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';
import {
    type EntriesAsList,
} from '@togglecorp/toggle-form';

import {
    type PartialFormType,
    type ReportContainerType,
} from '../schema';

import ReportContainer from './ReportContainer';

import styles from './styles.css';

const reportContainerKeySelector = (item: ReportContainerType) => item.clientId;

interface Props {
    className?: string;
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    readOnly?: boolean;
    disabled?: boolean;
}

function ReportBuilder(props: Props) {
    const {
        className,
        value,
        setFieldValue,
        readOnly,
        disabled,
    } = props;

    const reportContainerRendererParams = useCallback(
        (
            containerKey: string,
            item: ReportContainerType,
        ) => ({
            row: item.row,
            containerKey,
            column: item.column,
            width: item.width,
            allItems: value?.containers,
            configuration: item.contentConfiguration,
            contentType: item.contentType,
            setFieldValue,
            readOnly,
            disabled,
        }),
        [
            value?.containers,
            setFieldValue,
            readOnly,
            disabled,
        ],
    );

    return (
        <div className={_cs(className, styles.reportBuilder)}>
            <ListView
                className={styles.containers}
                data={value?.containers}
                keySelector={reportContainerKeySelector}
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
