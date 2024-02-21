import React from 'react';

import {
    ExpandableContainer,
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
}

function VariableItem(props: Props) {
    const {
        column,
        setVariableValue,
        index,
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
        <ExpandableContainer
            key={column.clientId}
            heading={column.name}
            headingClassName={styles.columnHeading}
            className={styles.expandableContainer}
            headerClassName={styles.columnHeader}
            spacing="compact"
            headingSize="extraSmall"
            contentClassName={styles.columnContent}
        >
            <TextOutput
                label="Completeness"
                value="90%"
            />
            <SelectInput
                name="type"
                options={columnDataTypeOptions ?? undefined}
                label="Column data type"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={column.type}
                onChange={setFieldValue}
            />
        </ExpandableContainer>
    );
}

export default VariableItem;
