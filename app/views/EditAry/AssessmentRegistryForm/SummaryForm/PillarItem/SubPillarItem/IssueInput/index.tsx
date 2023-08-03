import React, { useCallback, useMemo } from 'react';
import { listToMap } from '@togglecorp/fujs';

import {
    AssessmentRegistrySummarySubSectorTypeEnum,
} from '#generated/types';

import SelectIssueInput from './SelectIssueInput';

import { IssuesInputType } from '../../..';
import styles from './styles.css';

interface Option {
    id: string;
    label: string;
}

interface Props {
    name?: AssessmentRegistrySummarySubSectorTypeEnum;
    pending?: boolean;
    options?: Option[] | null;
    value: IssuesInputType[];
    onValueChange: (id: string, name: string) => void;
}

const keySelector = (d: Option) => d.id;
const labelSelector = (d: Option) => d.label;

function IssueInput(props: Props) {
    const {
        name,
        options,
        pending,
        value,
        onValueChange,
    } = props;

    const handleDrop = useCallback(
        (v?: string) => {
            console.log('drop container', v);
        }, [],
    );

    const mapData = useMemo(
        () => listToMap(
            value,
            (d) => d.name,
            (d) => d.issueId,
        ), [value],
    );
    return (
        <div className={styles.input}>
            <SelectIssueInput
                name={`${name}-1`}
                placeholder="1. Field Name"
                onChangeIssue={onValueChange}
                onDropChange={handleDrop}
                options={options}
                value={mapData[`${name}-1`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={pending}
            />
            <SelectIssueInput
                name={`${name}-2`}
                placeholder="2. Field Name"
                onChangeIssue={onValueChange}
                onDropChange={handleDrop}
                options={options}
                value={mapData[`${name}-2`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={pending}
            />
            <SelectIssueInput
                name={`${name}-3`}
                placeholder="3. Field Name"
                onChangeIssue={onValueChange}
                onDropChange={handleDrop}
                options={options}
                value={mapData[`${name}-3`]}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled={pending}
            />
        </div>
    );
}
export default IssueInput;
