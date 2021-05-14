import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';
import {
    QuickActionButton,
    TextInput,
    SelectInput,
    MultiSelectInput,
} from '@the-deep/deep-ui';

import {
    useFormObject,
    PartialForm,
    Error,
    StateArg,
} from '@togglecorp/toggle-form';

import {
    UserMini,
    MatrixTocElement,
} from '#typings';

import _ts from '#ts';

import styles from './styles.scss';

export interface PillarAnalysisFields {
    title: string;
    assignee: UserMini['id'];
    filters: MatrixTocElement['uniqueId'][];
}

const idSelector = (d: MatrixTocElement) => d.uniqueId;
const labelSelector = (d: MatrixTocElement) => d.altTitle ?? d.title;

const userKeySelector = (u: UserMini) => u.id;
const userLabelSelector = (u: UserMini) => u.displayName;

type Value = PartialForm<PillarAnalysisFields>
const defaultValue: Value = {
    filters: ['1'],
};

export interface Props {
    className?: string;
    error: Error<PillarAnalysisFields> | undefined;
    index: number;
    matrixPillars?: MatrixTocElement[];
    onChange: (value: StateArg<Value>, index: number) => void;
    onRemove: (index: number) => void;
    usersList: UserMini[];
    value: Value;
}

function PillarAnalysisRow(props: Props) {
    const {
        className,
        error,
        index,
        matrixPillars,
        onChange,
        onRemove,
        usersList,
        value,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultValue);

    return (
        <div className={_cs(className, styles.pillarAnalysisRow)}>
            <TextInput
                className={styles.input}
                error={error?.fields?.title}
                label={_ts('analysis.editModal', 'pillarAnalysisTitleLabel')}
                name="title"
                onChange={onFieldChange}
                placeholder={_ts('analysis.editModal', 'pillarAnalysisTitlePlaceholder')}
                value={value.title}
            />
            <SelectInput
                className={styles.input}
                error={error?.fields?.assignee}
                keySelector={userKeySelector}
                label={_ts('analysis.editModal', 'pillarAnalysisAssigneeLabel')}
                labelSelector={userLabelSelector}
                name="assignee"
                onChange={onFieldChange}
                options={usersList}
                placeholder={_ts('analysis.editModal', 'pillarAnalysisAssigneePlaceholder')}
                value={value.assignee}
            />
            <MultiSelectInput
                className={styles.input}
                error={error?.fields?.filters?.$internal}
                keySelector={idSelector}
                label={_ts('analysis.editModal', 'pillarAnalysisPillarTitle')}
                labelSelector={labelSelector}
                // FIXME: we can remove optionLabelSelector after typing fixed in toggle-ui
                optionLabelSelector={labelSelector}
                name="filters"
                onChange={onFieldChange}
                options={matrixPillars}
                placeholder={_ts('analysis.editModal', 'matrixPillarsPlaceholder')}
                value={value.filters}
            />
            <QuickActionButton
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
            >
                <IoClose />
            </QuickActionButton>
        </div>
    );
}

export default PillarAnalysisRow;
