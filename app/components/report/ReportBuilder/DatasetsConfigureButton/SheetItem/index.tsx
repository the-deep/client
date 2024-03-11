import React, { useCallback } from 'react';
import {
    ExpandableContainer,
    TextInput,
    NumberInput,
    ListView,
} from '@the-deep/deep-ui';
import {
    randomString,
} from '@togglecorp/fujs';
import {
    SetValueArg,
    useFormObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import { type WorkSheet } from 'xlsx';

import { type SheetType, type VariableType } from '..';
import {
    categorizeData,
    getColumnType,
    getCompleteness,
    getColumnsFromWorkSheet,
    getRawDataForWorkSheet,
} from '../../../utils';
import VariableItem from '../../VariableItem';

import styles from './styles.css';

const variableKeySelector = (column: VariableType) => column.clientId;

interface Props {
    item: SheetType;
    setSheetValue: (
        val: SetValueArg<SheetType>,
        index: number
    ) => void;
    index: number;
    workSheet: WorkSheet | undefined;
    disabled?: boolean;
    readOnly?: boolean;
}

const defaultSheetItem = (): SheetType => ({
    clientId: randomString(),
});

function SheetItem(props: Props) {
    const {
        item,
        setSheetValue,
        workSheet,
        index,
        disabled,
        readOnly,
    } = props;

    const setFieldValue = useFormObject(
        index,
        setSheetValue,
        defaultSheetItem,
    );

    const handleHeaderRowChange = useCallback((newHeaderRow: number | undefined) => {
        setFieldValue(newHeaderRow, 'headerRow');
        if (!workSheet || !newHeaderRow) {
            return;
        }
        const rawColumns = getColumnsFromWorkSheet(workSheet, newHeaderRow);
        const dataInObject = getRawDataForWorkSheet(
            workSheet,
            rawColumns,
            newHeaderRow,
        );

        const columns = rawColumns.map((rawItem) => {
            const categorizedData = categorizeData(dataInObject, rawItem);
            const dataType = getColumnType(categorizedData);
            return ({
                clientId: randomString(),
                name: rawItem,
                type: dataType,
                completeness: getCompleteness(categorizedData, dataType),
            });
        });
        setFieldValue(columns, 'variables');
    }, [
        setFieldValue,
        workSheet,
    ]);

    const {
        setValue: setVariableValue,
    } = useFormArray('variables', setFieldValue);

    const variableRendererParams = useCallback(
        (
            _: string,
            datum: VariableType,
            variableIndex: number,
        ) => ({
            column: datum,
            setVariableValue,
            index: variableIndex,
            disabled,
            readOnly,
        }), [
            disabled,
            readOnly,
            setVariableValue,
        ],
    );

    return (
        <ExpandableContainer
            key={item.clientId}
            heading={item.name}
            headingSize="small"
            expansionTriggerArea="arrow"
            withoutBorder
            headerDescriptionClassName={styles.headerDescription}
            headerDescription={(
                <>
                    <TextInput
                        name="name"
                        label="Name"
                        value={item?.name}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly
                    />
                    <NumberInput
                        name="headerRow"
                        label="Header Row"
                        value={item.headerRow}
                        onChange={handleHeaderRowChange}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </>
            )}
        >
            <ListView
                className={styles.variables}
                data={item.variables}
                keySelector={variableKeySelector}
                renderer={VariableItem}
                rendererParams={variableRendererParams}
                filtered={false}
                errored={false}
                pending={false}
                borderBetweenItem
            />
        </ExpandableContainer>
    );
}

export default SheetItem;
