import React, { useCallback, useMemo } from 'react';
import { Error } from '@togglecorp/toggle-form';
import { noOp } from '@togglecorp/fujs';
import { ExpandableContainer, List, NumberInput } from '@the-deep/deep-ui';

import { AssessmentRegistrySummarySubPillarTypeEnum } from '#generated/types';

import SubPillarItem from './SubPillarItem';
import { IssuesMapType, PartialFormType } from '../../formSchema';
import { PillarType } from '..';

import styles from './styles.css';

type IssueOptionsType = {
    id: string;
    label: string;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum | null;
}

interface Props {
    data: PillarType;
    issueOptions?: IssueOptionsType[] | null;
    issueList?: IssuesMapType;
    disabled?: boolean;
    error: Error<PartialFormType>;
    handleIssueAdd: (name: string, value: string) => void;
}

const keySelector = (d: NonNullable<PillarType['subPillarInformation']>[number]) => d.subPillar;

function PillarItem(props: Props) {
    // TODO: need to change in server for meta data
    const {
        data,
        issueList,
        disabled,
        error,
        issueOptions,
        handleIssueAdd,
    } = props;

    const subPillarParams = useCallback(
        (name: string, subPillarData) => ({
            data: subPillarData,
            name,
            issueList,
            issueOptions,
            disabled,
            onSuccessIssueAdd: handleIssueAdd,
        }),
        [
            issueList,
            issueOptions,
            disabled,
            handleIssueAdd,
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
                    rendererParams={subPillarParams}
                />
            </ExpandableContainer>

        </div>
    );
}

export default PillarItem;
