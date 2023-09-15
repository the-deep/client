import React, { useMemo, useCallback } from 'react';
import {
    List,
    ExpandableContainer,
    TabPanel,
    TextOutput,
} from '@the-deep/deep-ui';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import {
    _cs,
} from '@togglecorp/fujs';

import { AssessmentRegistrySectorTypeEnum } from '#generated/types';

import { PartialFormType, SummaryIssueType } from '../../formSchema';
import DimensionItem, { Props as DimensionItemProps } from '../DimensionItem';
import { DimensionType } from '..';

import styles from './styles.css';

interface Props {
    className?: string;
    name: AssessmentRegistrySectorTypeEnum;
    data: DimensionType[];
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    dimensionIssueToClientIdMap: Record<string, string>;
    setDimensionIssueToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;

    dimensionIssuesOptions?: SummaryIssueType[] | null;
    setDimensionIssuesOptions: React.Dispatch<React.SetStateAction<
    SummaryIssueType[]
    | undefined
    | null
    >>;
    error: Error<PartialFormType>;
    disabled?: boolean;
}

const keySelector = (d: DimensionType) => d.dimension;
function DimensionTabPanel(props: Props) {
    const {
        className,
        name: sector,
        data,
        value,
        setFieldValue, dimensionIssuesOptions,
        setDimensionIssuesOptions,
        dimensionIssueToClientIdMap,
        setDimensionIssueToClientIdMap,
        error,
        disabled,
    } = props;

    const dimensionRendererParams = useCallback(
        (_: string, dimensionData: DimensionType): DimensionItemProps => ({
            data: dimensionData,
            value,
            setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClientIdMap,
            setDimensionIssueToClientIdMap,
            disabled,
            error,
            sector,
        }), [
            value,
            setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClientIdMap,
            setDimensionIssueToClientIdMap,
            disabled,
            error,
            sector,
        ],
    );

    const dimensionStats = useMemo(() => (
        value?.summaryDimensionMeta?.find((item) => item.sector === sector)
    ), [value?.summaryDimensionMeta, sector]);

    const pillarStats = value?.summaryPillarMeta;
    const totalAssessed = pillarStats?.totalPeopleAssessed ?? 0;
    const totalNotInNeed = totalAssessed - (dimensionStats?.totalPeopleAffected ?? 0);
    const totalInNeed = dimensionStats?.totalInNeed ?? 0;
    const totalModeratelyInNeed = dimensionStats?.totalModerate ?? 0;
    const totalSeverelyInNeed = dimensionStats?.totalSevere ?? 0;
    const totalCriticallyInNeed = dimensionStats?.totalCritical ?? 0;
    const totalAffectedInNeed = totalAssessed - (totalInNeed + totalNotInNeed);

    return (
        <TabPanel
            key={sector}
            name={sector}
            className={_cs(className, styles.dimensionTabPanel)}
        >
            <List
                data={data}
                keySelector={keySelector}
                renderer={DimensionItem}
                rendererParams={dimensionRendererParams}
            />
            <ExpandableContainer
                heading="Summary"
                headingSize="extraSmall"
                withoutBorder
                contentClassName={styles.summaryContent}
                expansionTriggerArea="arrow"
            >
                <div className={styles.left}>
                    <TextOutput
                        label="Total Population Assessed"
                        valueType="number"
                        value={totalAssessed}
                    />
                    <TextOutput
                        label="Total Not Affected / Not in Need"
                        valueType="number"
                        value={totalNotInNeed}
                    />
                    <TextOutput
                        label="Total Affected / Not in Need"
                        valueType="number"
                        value={totalAffectedInNeed}
                    />
                    <TextOutput
                        label="Total People in Need"
                        valueType="number"
                        value={totalInNeed}
                    />
                    <TextOutput
                        label="Total People Moderately in Need"
                        valueType="number"
                        value={totalModeratelyInNeed}
                    />
                    <TextOutput
                        label="Total People Severely in Need"
                        valueType="number"
                        value={totalSeverelyInNeed}
                    />
                    <TextOutput
                        label="Total People Critically in Need"
                        valueType="number"
                        value={totalCriticallyInNeed}
                    />
                </div>
            </ExpandableContainer>
        </TabPanel>
    );
}
export default DimensionTabPanel;
