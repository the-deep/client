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
    SetValueArg,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import {
    UserMini,
} from '#types';

import _ts from '#ts';

import { MatrixPillar } from '../../utils';

import styles from './styles.css';

export interface PillarAnalysisFields {
    title: string;
    assignee: UserMini['id'];
    filters: MatrixPillar['uniqueId'][];
}

const idSelector = (d: MatrixPillar) => d.uniqueId;
const labelSelector = (d: MatrixPillar) => d.altTitle ?? d.title;

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
    matrixPillars?: MatrixPillar[];
    onChange: (value: SetValueArg<Value>, index: number) => void;
    onRemove: (index: number) => void;
    usersList: UserMini[];
    value: Value;
    pending: boolean;
}

function PillarAnalysisRow(props: Props) {
    const {
        className,
        error: riskyError,
        index,
        matrixPillars,
        onChange,
        onRemove,
        usersList,
        value,
        pending,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject(index, onChange, defaultValue);

    return (
        <div className={_cs(className, styles.pillarAnalysisRow)}>
            <TextInput
                error={error?.title}
                label={_ts('analysis.editModal', 'pillarAnalysisTitleLabel')}
                name="title"
                onChange={onFieldChange}
                placeholder={_ts('analysis.editModal', 'pillarAnalysisTitlePlaceholder')}
                value={value.title}
                disabled={pending}
            />
            <SelectInput
                error={error?.assignee}
                keySelector={userKeySelector}
                label={_ts('analysis.editModal', 'pillarAnalysisAssigneeLabel')}
                labelSelector={userLabelSelector}
                name="assignee"
                onChange={onFieldChange}
                options={usersList}
                placeholder={_ts('analysis.editModal', 'pillarAnalysisAssigneePlaceholder')}
                value={value.assignee}
                disabled={pending}
            />
            <MultiSelectInput
                error={getErrorString(error?.filters)}
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
                disabled={pending}
                optionsPopupClassName={styles.optionsPopup}
                optionsPopupContentClassName={styles.optionsPopup}
            />
            <QuickActionButton
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                disabled={pending}
            >
                <IoClose />
            </QuickActionButton>
        </div>
    );
}

export default PillarAnalysisRow;
