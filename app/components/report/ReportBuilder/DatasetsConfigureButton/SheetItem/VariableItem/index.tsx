import React from 'react';

import {
    Heading,
    TextOutput,
    SelectInput,
} from '@the-deep/deep-ui';
import { randomString } from '@togglecorp/fujs';
import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    gql,
    useQuery,
} from '@apollo/client';

import {
    ReportVariableTypeEnumQuery,
    ReportVariableTypeEnumQueryVariables,
} from '#generated/types';

import { type VariableType } from '../..';
import styles from './styles.css';

const REPORT_VARIABLE_TYPE_ENUM = gql`
    query ReportVariableTypeEnum {
        enums {
            AnalysisReportVariableSerializerType {
                description
                enum
                label
            }
        }
    }
`;

const defaultVariableItem = (): VariableType => ({
    clientId: randomString(),
});

type EnumEntity<E> = {
    enum: E;
    label: string;
    description?: string | undefined | null;
};

function enumKeySelector<E>(d: EnumEntity<E>) {
    return d.enum;
}
function enumLabelSelector<E>(d: EnumEntity<E>) {
    return d.label;
}

interface Props {
    column: VariableType;
    setVariableValue: (
        value: SetValueArg<VariableType>,
        index: number,
    ) => void | undefined;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function VariableItem(props: Props) {
    const {
        column,
        setVariableValue,
        index,
        disabled,
        readOnly,
    } = props;

    const setFieldValue = useFormObject(
        index,
        setVariableValue,
        defaultVariableItem,
    );
    const {
        data: columnDataTypeResponse,
    } = useQuery<ReportVariableTypeEnumQuery, ReportVariableTypeEnumQueryVariables>(
        REPORT_VARIABLE_TYPE_ENUM,
    );

    const columnDataTypeOptions = columnDataTypeResponse
        ?.enums?.AnalysisReportVariableSerializerType;

    return (
        <div className={styles.variableItem}>
            <Heading
                className={styles.heading}
                size="extraSmall"
            >
                {column.name}
            </Heading>
            <TextOutput
                className={styles.heading}
                label="Completeness"
                value="90%"
            />
            <SelectInput
                className={styles.heading}
                name="type"
                options={columnDataTypeOptions ?? undefined}
                label="Column data type"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={column.type}
                onChange={setFieldValue}
                disabled={disabled}
                readOnly={readOnly}
                nonClearable
            />
        </div>
    );
}

export default VariableItem;
