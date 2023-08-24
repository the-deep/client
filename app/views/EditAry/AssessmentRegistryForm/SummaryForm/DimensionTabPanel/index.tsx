import React, { useCallback } from 'react';
import { List, TabPanel } from '@the-deep/deep-ui';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import { AssessmentRegistrySectorTypeEnum } from '#generated/types';

import { PartialFormType, SummaryIssueType } from '../../formSchema';
import DimensionItem from '../DimensionItem';
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
    error: Error<PartialFormType>;
    disabled?: boolean;
}

const keySelectorDimension = (d: DimensionType) => d.dimension;
function DimensionTabPanel(props: Props) {
    const {
        className,
        name,
        data,
        value,
        setFieldValue,
        issuesOptions,
        setIssuesOptions,
        error,
        disabled,
    } = props;

    const dimensionRendererParams = useCallback(
        (_: string, dimensionData) => ({
            data: dimensionData,
            value,
            setFieldValue,
            issuesOptions,
            setIssuesOptions,
            disabled,
            error,
            focus: name,
        }), [
            value,
            setFieldValue,
            issuesOptions,
            setIssuesOptions,
            disabled,
            error,
            name,
        ],
    );

    return (
        <TabPanel
            key={name}
            name={name}
            className={_cs(className, styles.dimensionTabPanel)}
        >
            <List
                data={data}
                keySelector={keySelectorDimension}
                renderer={DimensionItem}
                rendererParams={dimensionRendererParams}
            />
        </TabPanel>
    );
}
export default DimensionTabPanel;
