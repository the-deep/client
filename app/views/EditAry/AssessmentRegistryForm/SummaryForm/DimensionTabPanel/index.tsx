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
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    issueItemToClientIdMap: Record<string, string>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
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
        setFieldValue,
        issuesOptions,
        setIssuesOptions,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
        error,
        disabled,
    } = props;

    const dimensionRendererParams = useCallback(
        (_: string, dimensionData): DimensionItemProps => ({
            data: dimensionData,
            value,
            setFieldValue,
            issuesOptions,
            setIssuesOptions,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            disabled,
            error,
            sector,
        }), [
            value,
            setFieldValue,
            issuesOptions,
            setIssuesOptions,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
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
