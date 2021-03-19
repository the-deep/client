import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    FaramGroup,
    FaramActionElement,
} from '@togglecorp/faram';

import QuickActionButton from '#dui/QuickActionButton';
import TextInput from '#rsci/TextInput';
import Icon from '#rscg/Icon';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import {
    UserMini,
    MatrixTocElement,
} from '#typings';

import _ts from '#ts';

import styles from './styles.scss';

const FaramButton = FaramActionElement(QuickActionButton);

interface PillarAnalysisRowProps {
    className?: string;
    index: number;
    usersList: UserMini[];
    matrixPillars?: MatrixTocElement[];
}

const idSelector = (d: MatrixTocElement) => d.uniqueId;
const labelSelector = (d: MatrixTocElement) => d.altTitle ?? d.title;

const userKeySelector = (u: UserMini) => u.id;
const userLabelSelector = (u: UserMini) => u.displayName;

const deleteClick = (rows, index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    return newRows;
};

function PillarAnalysisRow(props: PillarAnalysisRowProps) {
    const {
        index,
        className,
        usersList,
        matrixPillars,
    } = props;

    return (
        <div className={_cs(className, styles.pillarAnalysisRow)}>
            <FaramGroup
                faramElementName={String(index)}
            >
                <TextInput
                    faramElementName="title"
                    className={styles.input}
                    label={_ts('analysis.editModal', 'pillarAnalysisTitleLabel')}
                    placeholder={_ts('analysis.editModal', 'pillarAnalysisTitlePlaceholder')}
                />
                <SelectInput
                    className={styles.input}
                    faramElementName="assignee"
                    label={_ts('analysis.editModal', 'pillarAnalysisAssigneeLabel')}
                    placeholder={_ts('analysis.editModal', 'pillarAnalysisAssigneePlaceholder')}
                    options={usersList}
                    keySelector={userKeySelector}
                    labelSelector={userLabelSelector}
                />
                <MultiSelectInput
                    className={styles.input}
                    faramElementName="filters"
                    options={matrixPillars}
                    label={_ts('analysis.editModal', 'pillarAnalysisPillarTitle')}
                    placeholder={_ts('analysis.editModal', 'matrixPillarsPlaceholder')}
                    keySelector={idSelector}
                    labelSelector={labelSelector}
                />
            </FaramGroup>
            <FaramButton
                faramAction={deleteClick}
                faramElementName={String(index)}
                icons={(<Icon name="delete" />)}
                title={_ts('widgets.editor.matrix1d', 'removeCellButtonTitle')}
            />
        </div>
    );
}

export default PillarAnalysisRow;
