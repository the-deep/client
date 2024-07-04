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

import _ts from '#ts';

import { MatrixPillar } from '../utils';
import { AnalysisPillarForm, UserMembersType } from '..';

import styles from './styles.css';

const idSelector = (d: MatrixPillar) => d.uniqueId;
const labelSelector = (d: MatrixPillar) => d.altTitle ?? d.title;

const userKeySelector = (user: UserMembersType) => user.member.id;
const userLabelSelector = (user: UserMembersType) => user.member?.displayName ?? '';

type Value = PartialForm<AnalysisPillarForm>
const defaultValue: Value = {
    filters: [],
};

export interface Props {
    className?: string;
    error: Error<AnalysisPillarForm> | undefined;
    index: number;
    matrixPillars?: MatrixPillar[];
    onChange: (value: SetValueArg<Value>, index: number) => void;
    onRemove: (index: number) => void;
    usersList: UserMembersType[];
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
                className={styles.input}
                error={error?.title}
                label={_ts('analysis.editModal', 'pillarAnalysisTitleLabel')}
                name="title"
                onChange={onFieldChange}
                placeholder={_ts('analysis.editModal', 'pillarAnalysisTitlePlaceholder')}
                value={value.title}
                disabled={pending}
            />
            <SelectInput
                className={styles.input}
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
                className={styles.input}
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
                // FIXME: Need to fix
                value={value.filters}
                disabled={pending}
                optionsPopupClassName={styles.optionsPopup}
                optionsPopupContentClassName={styles.optionsPopup}
            />
            <QuickActionButton
                className={styles.button}
                name={index}
                onClick={onRemove}
                title="Remove"
                disabled={pending}
            >
                <IoClose />
            </QuickActionButton>
        </div>
    );
}

export default PillarAnalysisRow;
