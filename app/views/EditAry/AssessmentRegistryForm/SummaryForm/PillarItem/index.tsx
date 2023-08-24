import React, { useCallback, useMemo } from 'react';
import {
    Error,
    EntriesAsList,
} from '@togglecorp/toggle-form';
import { noOp } from '@togglecorp/fujs';
import { ExpandableContainer, ListView, NumberInput } from '@the-deep/deep-ui';

import SubPillarItem, { Props as SubPillarItemProps } from './SubPillarItem';
import {
    PartialFormType,
    SummaryIssueType,
} from '../../formSchema';
import { PillarType } from '..';

import styles from './styles.css';

export interface Props {
    data: PillarType;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
    issueItemToClientIdMap: Record<string, string>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const keySelector = (d: NonNullable<PillarType['subPillarInformation']>[number]) => d.subPillar;

function PillarItem(props: Props) {
    // TODO: need to change in server for meta data
    const {
        data,
        value,
        setFieldValue,
        error,
        disabled,
        issuesOptions,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
        setIssuesOptions,
    } = props;

    const subPillarParams = useCallback(
        (name: string, subPillarData): SubPillarItemProps => ({
            data: subPillarData,
            name,
            issuesOptions,
            value: value?.summarySubPillarIssue,
            setIssuesOptions,
            disabled,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            onChange: setFieldValue,
        }),
        [
            value,
            setFieldValue,
            issuesOptions,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            setIssuesOptions,
            disabled,
        ],
    );

    const headerActions = useMemo(
        () => (
            <div>
                {(data.pillar === 'CONTEXT') && (
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        placeholder="Total people assessed"
                        name="totalAssessed"
                        onChange={noOp}
                        value={value?.summaryPillarMeta?.totalPeopleAssessed}
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
                            value={value?.summaryPillarMeta?.totalDead}
                            onChange={noOp}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalInjured"
                            placeholder="Total injured:"
                            value={value?.summaryPillarMeta?.totalInjured}
                            onChange={noOp}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalMissing"
                            placeholder="Total missing:"
                            value={value?.summaryPillarMeta?.totalMissing}
                            onChange={noOp}
                            disabled={disabled}
                        />
                    </div>
                )}
            </div>
        ), [data, disabled, value],
    );

    return (
        <div className={styles.pillar}>
            <ExpandableContainer
                className={styles.expandableContainer}
                heading={data.pillarDisplay}
                headingSize="extraSmall"
                withoutBorder
                headerActions={headerActions}
                expansionTriggerArea="arrow"
            >
                <ListView
                    className={styles.subPillarItem}
                    data={data.subPillarInformation}
                    keySelector={keySelector}
                    renderer={SubPillarItem}
                    rendererParams={subPillarParams}
                    errored={false}
                    filtered={false}
                    pending={false}
                    messageShown
                    messageIconShown
                />
            </ExpandableContainer>

        </div>
    );
}

export default PillarItem;
