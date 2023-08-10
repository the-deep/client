import React, { useCallback, useMemo } from 'react';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import { isTruthyString, noOp } from '@togglecorp/fujs';
import { ExpandableContainer, List, NumberInput } from '@the-deep/deep-ui';

import SubPillarItem from './SubPillarItem';
import { PartialFormType, SubPillarIssueInputType } from '../../formSchema';
import { PillarType } from '..';

import styles from './styles.css';

interface Props {
    data: PillarType;
    issueList: SubPillarIssueInputType[];
    setIssueList: React.Dispatch<React.SetStateAction<SubPillarIssueInputType[]>>;
    disabled?: boolean;
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

const keySelector = (d: NonNullable<PillarType['subPillarInformation']>[number]) => d.subPillar;

function PillarItem(props: Props) {
    // TODO: need to change in server for meta data
    const {
        data,
        issueList,
        setIssueList,
        disabled,
        value,
        setFieldValue,
        error,
    } = props;

    const handleIssueAdd = useCallback(
        (issues: SubPillarIssueInputType[]) => {
            setFieldValue(() => {
                const val = issues?.map((issueItem) => ({
                    summaryIssue: issueItem.issueId,
                    order: Number(issueItem.order),
                    text: issueItem?.text ?? '',
                })).filter((item) => isTruthyString(item.summaryIssue));
                return [val].flat();
            }, 'summarySubPillarIssue');
        }, [setFieldValue],
    );

    const issuesParams = useCallback(
        (name: string) => ({
            name,
            issueList,
            setIssueList,
            disabled,
            onSuccessIssueAdd: handleIssueAdd,
        }),
        [issueList, setIssueList, disabled, handleIssueAdd],
    );

    const headerActions = useMemo(
        () => (
            <div>
                {(data.pillar === 'CONTEXT') && (
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        placeholder="Total people assessed"
                        name="totalDead"
                        onChange={noOp}
                        value={undefined}
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
