import React, { useCallback, useMemo } from 'react';
import { Error } from '@togglecorp/toggle-form';
import { noOp } from '@togglecorp/fujs';
import { ExpandableContainer, ListView, NumberInput } from '@the-deep/deep-ui';

import SubPillarItem from './SubPillarItem';
import { SubPillarIssuesMapType, PartialFormType, SummaryIssueType } from '../../formSchema';
import { PillarType } from '..';

import styles from './styles.css';

interface Props {
    data: PillarType;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    pillarIssuesList?: SubPillarIssuesMapType;
    formValue: PartialFormType['summaryPillarMeta'];
    // setValue: (value: SetBaseValueArg<PartialFormType['summaryPillarMeta']>) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
    handleIssueAdd: (name: string, value: string) => void;
}

const keySelector = (d: NonNullable<PillarType['subPillarInformation']>[number]) => d.subPillar;

function PillarItem(props: Props) {
    // TODO: need to change in server for meta data
    const {
        data,
        pillarIssuesList,
        formValue,
        // setValue,
        error,
        disabled,
        issuesOptions,
        setIssuesOptions,
        handleIssueAdd,
    } = props;

    const subPillarParams = useCallback(
        (name: string, subPillarData) => ({
            data: subPillarData,
            name,
            pillarIssuesList,
            issuesOptions,
            setIssuesOptions,
            disabled,
            onSuccessIssueAdd: handleIssueAdd,
        }),
        [
            pillarIssuesList,
            issuesOptions,
            setIssuesOptions,
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
                        name="totalAssessed"
                        onChange={noOp}
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
                            onChange={noOp}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalInjured"
                            placeholder="Total injured:"
                            value={formValue?.totalInjured}
                            onChange={noOp}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalMissing"
                            placeholder="Total missing:"
                            value={formValue?.totalMissing}
                            onChange={noOp}
                            disabled={disabled}
                        />
                    </div>
                )}
            </div>
        ), [data, disabled, formValue],
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
