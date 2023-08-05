import React, { useCallback, useMemo } from 'react';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import { noOp } from '@togglecorp/fujs';
import { ExpandableContainer, List, NumberInput } from '@the-deep/deep-ui';

import {
    AssessmentRegistrySummarySubPillarTypeEnum,
    SummaryOptionType,
} from '#generated/types';

import SubPillarItem from './SubPillarItem';
import { PartialFormType, SubSectorIssueInputType } from '../../formSchema';
import { DimensionType } from '..';

import styles from './styles.css';

interface Props {
    data: DimensionType;
    value: SubSectorIssueInputType[];
    onValueChange: (data: SubSectorIssueInputType) => void;
    disabled?: boolean;
    formValue: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    pillarName: string;
}

const keySelector = (d: NonNullable<DimensionType['subPillarInformation']>[number]) => d.subPillar;

function PillarItem(props: Props) {
    const {
        data,
        value,
        onValueChange,
        disabled,
        formValue,
        setFieldValue,
        error,
        pillarName,
    } = props;

    console.log('pillar name', data);

    const issuesParams = useCallback(
        (name: string, subPillarData) => ({
            subPillarData,
            subPillarName: name,
            value,
            onValueChange,
            disabled,
        }),
        [value, onValueChange, disabled],
    );

    const headerActions = useMemo(
        () => (
            <div>
                {(pillarName === 'CONTEXT') && (
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        name="totalDeath"
                        placeholder="Total people assessed"
                        value={undefined}
                        onChange={noOp}
                        disabled={disabled}
                    />
                )}
                {(pillarName === 'EVENT_SHOCK') && (
                    <div className={styles.headerActions}>
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalDeath"
                            placeholder="Total death:"
                            value={undefined}
                            onChange={noOp}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalDeath"
                            placeholder="Total injured:"
                            value={undefined}
                            onChange={noOp}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalDeath"
                            placeholder="Total missing:"
                            value={undefined}
                            onChange={noOp}
                            disabled={disabled}
                        />
                    </div>
                )}
            </div>
        ), [data, disabled],
    );

    return (
        <div className={styles.pillar}>
            <ExpandableContainer
                className={styles.expandableContainer}
                contentClassName={styles.expandableContent}
                heading={data.pillarDisplay}
                withoutBorder
                headerActions={headerActions}
            >
                <List
                    data={data.subPillarInformation}
                    keySelector={keySelector}
                    renderer={SubPillarItem}
                    rendererParams={issuesParams}
                />
            </ExpandableContainer>

        </div>
    );
}

export default PillarItem;
