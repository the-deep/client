import React, { useCallback, useState } from 'react';
import { DropContainer, SelectInput } from '@the-deep/deep-ui';

import {
    AssessmentRegistrySummarySubSectorTypeEnum,
    SummarySubSectorIssueInputType,
} from '#generated/types';

import styles from './styles.css';

interface Option {
    id: string;
    label: string;
}

interface Props {
    name?: AssessmentRegistrySummarySubSectorTypeEnum;
    pending?: boolean;
    options?: Option[] | null;
    value: SummarySubSectorIssueInputType;
    onValueChange: React.Dispatch<React.SetStateAction<SummarySubSectorIssueInputType>>;
    onAdd: (summaryId: string) => void;
}

interface InputType {
    id: string;
    name:string;
    text: string;
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
        onAdd,
    } = props;

    const [description, setDescription] = useState<string>();
    const [issueValues, setIssuesValues] = useState<InputType>();

    const handleIssueSelect = useCallback(
        (val, n) => {
            console.log('issue selected', val, n);
        }, [],
    );

    const handleDrop = useCallback(
        (v) => {
            console.log('drop container', v);
        }, [],
    );

    return (
        <div className={styles.input}>
            <SelectInput
                name="1"
                placeholder="1. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                optionsPending={pending}
                onChange={handleIssueSelect}
                value={undefined}
            />
            <DropContainer
                name="1"
                onDrop={handleDrop}
            >
                {description}
            </DropContainer>

            <SelectInput
                name="2"
                placeholder="1. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                optionsPending={pending}
                onChange={handleIssueSelect}
                value={undefined}
            />
            <SelectInput
                name="3"
                placeholder="1. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                onChange={onAdd}
                value={undefined}
                optionsPending={pending}
            />
            <SelectInput
                name="4"
                placeholder="1. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                onChange={onAdd}
                value={undefined}
                optionsPending={pending}
            />
            <SelectInput
                name="5"
                placeholder="1. Field Name"
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                onChange={onAdd}
                value={undefined}
                optionsPending={pending}
            />
        </div>
    );
}

export default IssueInput;
