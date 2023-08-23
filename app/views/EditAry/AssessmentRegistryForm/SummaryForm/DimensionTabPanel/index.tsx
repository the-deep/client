import React, { useCallback } from 'react';
import { List, TabPanel } from '@the-deep/deep-ui';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';

import { PartialFormType, SummaryIssueType } from '../../formSchema';
import DimmensionItem from '../DimmensionItem';
import { DimmensionType } from '..';
import { AssessmentRegistrySectorTypeEnum } from '#generated/types';

interface Props {
    className?: string;
    name: AssessmentRegistrySectorTypeEnum;
    data: DimmensionType[];
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    error: Error<PartialFormType>;
    disabled?: boolean;
}

const keySelectorDimmension = (d: DimmensionType) => d.dimmension;
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

    const dimmensionRendererParams = useCallback(
        (_: string, dimmensionData) => ({
            data: dimmensionData,
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
            // className={styles.tabPanel}
        >
            <List
                data={data}
                keySelector={keySelectorDimmension}
                renderer={DimmensionItem}
                rendererParams={dimmensionRendererParams}
            />
        </TabPanel>
    );
}
export default DimensionTabPanel;
