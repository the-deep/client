import React, { useCallback } from 'react';

import {
    ExpandableContainer,
    TextInput,
    NumberInput,
    ListView,
} from '@the-deep/deep-ui';
import { randomString } from '@togglecorp/fujs';
import {
    SetValueArg,
    useFormObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import VariableItem from './VariableItem';
import { type SheetType, type VariableType } from '..';
import styles from './styles.css';

const variableKeySelector = (column: VariableType) => column.clientId;

interface Props {
    item: SheetType;
    setSheetValue: (
        val: SetValueArg<SheetType>,
        index: number
    ) => void;
    index: number;
}

const defaultSheetItem = (): SheetType => ({
    clientId: randomString(),
});

function SheetItem(props: Props) {
    const {
        item,
        setSheetValue,
        index,
    } = props;

    const setFieldValue = useFormObject(
        index,
        setSheetValue,
        defaultSheetItem,
    );

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
        }), [
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
                    />
                    <NumberInput
                        name="headerRow"
                        label="Header Row"
                        value={item.headerRow}
                        onChange={setFieldValue}
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
            />
        </ExpandableContainer>
    );
}

export default SheetItem;
