import React, { useCallback, useMemo } from 'react';
import { EntriesAsList, Error, SetBaseValueArg } from '@togglecorp/toggle-form';
import { noOp } from '@togglecorp/fujs';
import { ExpandableContainer, List, ListView, NumberInput } from '@the-deep/deep-ui';

import { AssessmentRegistrySummarySubPillarTypeEnum } from '#generated/types';

import SubPillarItem from './SubPillarItem';
import { SubPillarIssuesMapType, PartialFormType } from '../../formSchema';
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
    pillarIssuesList?: SubPillarIssuesMapType;
    formValue: PartialFormType['summaryPillarMeta'];
    setValue: (value: SetBaseValueArg<PartialFormType['summaryPillarMeta']>) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
    handleIssueAdd: (name: string, value: string) => void;
    refetchIssuesOptions: () => void;
}

const keySelector = (d: NonNullable<PillarType['subPillarInformation']>[number]) => d.subPillar;

function PillarItem(props: Props) {
    // TODO: need to change in server for meta data
    const {
        data,
        pillarIssuesList,
        formValue,
        setValue,
        error,
        disabled,
        issueOptions,
        handleIssueAdd,
        refetchIssuesOptions,
    } = props;

    const subPillarParams = useCallback(
        (name: string, subPillarData) => ({
            data: subPillarData,
            name,
            pillarIssuesList,
            issueOptions,
            disabled,
            onSuccessIssueAdd: handleIssueAdd,
            refetchIssuesOptions,
        }),
        [
            pillarIssuesList,
            issueOptions,
            disabled,
            handleIssueAdd,
            refetchIssuesOptions,
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
                        onChange={setValue}
                        value={formValue?.totalPeopleAssessed}
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
                            value={formValue?.totalDead}
                            onChange={setValue}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalInjured"
                            placeholder="Total injured:"
                            value={formValue?.totalInjured}
                            onChange={setValue}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalMissing"
                            placeholder="Total missing:"
                            value={formValue?.totalMissing}
                            onChange={setValue}
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
