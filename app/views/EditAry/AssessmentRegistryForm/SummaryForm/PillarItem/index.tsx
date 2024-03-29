import React, { useCallback, useMemo } from 'react';
import {
    Error,
    EntriesAsList,
    getErrorObject,
    analyzeErrors,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    ExpandableContainer,
    ListView,
    NumberInput,
} from '@the-deep/deep-ui';
import { _cs, isDefined } from '@togglecorp/fujs';

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
    const {
        data,
        value,
        setFieldValue,
        error: riskyError,
        disabled,
        issuesOptions,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
        setIssuesOptions,
    } = props;
    const error = getErrorObject(riskyError);
    const summaryPillarMetaError = getErrorObject(error?.summaryPillarMeta);

    const subPillarParams = useCallback(
        (
            name: string,
            subPillarData: NonNullable<PillarType['subPillarInformation']>[number],
        ): SubPillarItemProps => ({
            data: subPillarData,
            name,
            issuesOptions,
            value: value?.summarySubPillarIssue,
            setIssuesOptions,
            disabled,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            onChange: setFieldValue,
            error: error?.summarySubPillarIssue,
        }),
        [
            value,
            setFieldValue,
            issuesOptions,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            setIssuesOptions,
            disabled,
            error,
        ],
    );

    const onPillarMetaChange = useFormObject<
        'summaryPillarMeta',
        PartialFormType['summaryPillarMeta']
    >(
        'summaryPillarMeta',
        setFieldValue,
        {},
    );

    const headerActions = useMemo(
        () => (
            <div>
                {(data.pillar === 'CONTEXT') && (
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        label="Total people assessed"
                        placeholder="write your number here"
                        name="totalPeopleAssessed"
                        onChange={onPillarMetaChange}
                        value={value?.summaryPillarMeta?.totalPeopleAssessed}
                        error={summaryPillarMetaError?.totalPeopleAssessed}
                        disabled={disabled}
                    />
                )}
                {(data.pillar === 'EVENT_SHOCK') && (
                    <div className={styles.headerActions}>
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalDead"
                            label="Total deaths"
                            placeholder="write your number here"
                            value={value?.summaryPillarMeta?.totalDead}
                            onChange={onPillarMetaChange}
                            error={summaryPillarMetaError?.totalDead}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalInjured"
                            label="Total injured"
                            placeholder="write your number here"
                            value={value?.summaryPillarMeta?.totalInjured}
                            onChange={onPillarMetaChange}
                            error={summaryPillarMetaError?.totalInjured}
                            disabled={disabled}
                        />
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalMissing"
                            label="Total missing"
                            placeholder="write your number here"
                            value={value?.summaryPillarMeta?.totalMissing}
                            onChange={onPillarMetaChange}
                            error={summaryPillarMetaError?.totalMissing}
                            disabled={disabled}
                        />
                    </div>
                )}
                {(data.pillar === 'HUMANITARIAN_ACCESS') && (
                    <div className={styles.headerActions}>
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="totalPeopleFacingHumAccessCons"
                            label="People facing humanitarian access constraints"
                            placeholder="write your number here"
                            value={value?.summaryPillarMeta?.totalPeopleFacingHumAccessCons}
                            onChange={onPillarMetaChange}
                            error={summaryPillarMetaError?.totalPeopleFacingHumAccessCons}
                            disabled={disabled}
                        />
                        {/*
                        NOTE: This can be uncommented after we write
                        logic to calculate this on totalPeopleFacingHumAccessCons change
                        <NumberInput
                            className={styles.inputMetadata}
                            inputSectionClassName={styles.inputSection}
                            name="percentageOfPeopleFacingHumAccessCons"
                            label="% of people facing humanitarian access constraints"
                            placeholder="write your number here"
                            value={value?.summaryPillarMeta?.percentageOfPeopleFacingHumAccessCons}
                            onChange={onPillarMetaChange}
                            error={summaryPillarMetaError?.percentageOfPeopleFacingHumAccessCons}
                            disabled={disabled}
                        />
                          */}
                    </div>
                )}
            </div>
        ), [
            data,
            disabled,
            value,
            summaryPillarMetaError,
            onPillarMetaChange,
        ],
    );

    const isFaulty = useMemo(() => {
        if (
            isDefined(error)
            && isDefined(error.summarySubPillarIssue)
            && isDefined(issueItemToClientIdMap)
        ) {
            const errorSubPillar = Object.keys(issueItemToClientIdMap).reduce((acc, key) => {
                const clientId = issueItemToClientIdMap[key];
                const subPillarKey = key.split('-')?.[0];
                const isFaultyInSubPillar = analyzeErrors(
                    getErrorObject(error?.summarySubPillarIssue)?.[clientId],
                );
                acc[subPillarKey] = isFaultyInSubPillar;
                return acc;
            }, {} as Record<string, boolean>);

            return data.subPillarInformation.some(
                (subPillarObj) => errorSubPillar[subPillarObj.subPillar],
            );
        }
        return false;
    }, [
        data,
        error,
        issueItemToClientIdMap,
    ]);

    return (
        <ExpandableContainer
            className={styles.pillarItem}
            headerClassName={styles.header}
            headingContainerClassName={styles.headingContainer}
            headingClassName={_cs(isFaulty && styles.heading)}
            heading={data.pillarDisplay}
            headingSize="extraSmall"
            headerActions={headerActions}
            expansionTriggerArea="arrow"
            withoutBorder
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
    );
}

export default PillarItem;
