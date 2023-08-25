import React, { useCallback } from 'react';
import { List, TabPanel } from '@the-deep/deep-ui';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

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
    dimensionIssueToClienIdMap: Record<string, string>;
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
        dimensionIssueToClienIdMap,
        setDimensionIssueToClientIdMap,
        error,
        disabled,
    } = props;

    const dimensionRendererParams = useCallback(
        (_: string, dimensionData): DimensionItemProps => ({
            data: dimensionData,
            value,
            setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClienIdMap,
            setDimensionIssueToClientIdMap,
            disabled,
            error,
            sector,
        }), [
            value,
            setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClienIdMap,
            setDimensionIssueToClientIdMap,
            disabled,
            error,
            sector,
        ],
    );

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
        </TabPanel>
    );
}
export default DimensionTabPanel;
