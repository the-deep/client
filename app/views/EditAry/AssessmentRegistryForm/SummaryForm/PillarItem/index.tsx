import React, { useCallback, useMemo } from 'react';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import { noOp } from '@togglecorp/fujs';
import { ExpandableContainer, List, NumberInput } from '@the-deep/deep-ui';

import SubPillarItem from './SubPillarItem';
import { PartialFormType, SubPillarIssueInputType } from '../../formSchema';
import { PillarType } from '..';

import styles from './styles.css';

interface Props {
    data: PillarType;
    value: SubPillarIssueInputType[];
    onValueChange: (data: SubPillarIssueInputType) => void;
    disabled?: boolean;
    formValue: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

const keySelector = (d: NonNullable<PillarType['subPillarInformation']>[number]) => d.subPillar;

function PillarItem(props: Props) {
    // TODO: need to change in server for meta data
    const {
        data,
        value,
        onValueChange,
        disabled,
        formValue,
        setFieldValue,
        error,
    } = props;

    const issuesParams = useCallback(
        (name: string) => ({
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
                {(data.pillar === 'CONTEXT') && (
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
                {(data.pillar === 'EVENT_SHOCK') && (
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
                expansionTriggerArea="arrow"
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
