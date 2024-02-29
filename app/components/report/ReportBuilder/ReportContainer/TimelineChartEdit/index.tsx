import React from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    ExpandableContainer,
    SelectInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';

import DatasetsConfigureButton from '../../DatasetsConfigureButton';
import {
    type TimelineChartConfigType,
} from '../../../schema';

import styles from './styles.css';

export interface Metadata {
    clientId: string;
    completeness?: number;
    name: string;
    type: 'TEXT' | 'DATE' | 'NUMBER' | 'BOOLEAN' | undefined;
}

const metadata: Metadata[] = [
    {
        clientId: 'hmgmeqzbs8m0tz3i',
        completeness: 100,
        name: 'Transaction ID',
        type: 'TEXT',
    },
    {
        clientId: 'j28h53euavvxy7zg',
        completeness: 100,
        name: 'Transaction Type',
        type: 'TEXT',
    },
    {
        clientId: '7bzwe1uh4dutgzgq',
        completeness: 100,
        name: 'Transaction State',
        type: 'TEXT',
    },
    {
        clientId: 'o9bqs855t5nehkfd',
        completeness: 100,
        name: 'Transaction Date',
        type: 'DATE',
    },
    {
        clientId: '95lvo974ku7grles',
        completeness: 100,
        name: 'Transaction Time',
        type: 'TEXT',
    },
    {
        clientId: '2mtvloppia78qbnc',
        completeness: 9,
        name: 'Service',
        type: 'TEXT',
    },
    {
        clientId: '7e3ac3despy870gn',
        completeness: 100,
        name: 'Description',
        type: 'TEXT',
    },
    {
        clientId: 'qglvj5gw9awto7o2',
        completeness: 100,
        name: 'From',
        type: 'TEXT',
    },
    {
        clientId: 'duhumvlxiern5av2',
        completeness: 100,
        name: 'To',
        type: 'TEXT',
    },
    {
        clientId: 'obpqsdq7ko1akfr1',
        completeness: 100,
        name: 'Purpose',
        type: 'TEXT',
    },
    {
        clientId: 'j7rphv9voiemo330',
        completeness: 100,
        name: 'Remarks',
        type: 'TEXT',
    },
    {
        clientId: 'oruecwkfwj8py49s',
        completeness: 0,
        name: 'Reference',
        type: 'DATE',
    },
    {
        clientId: 'cyqo6se5akjny8cz',
        completeness: 100,
        name: 'Amount(-)',
        type: 'NUMBER',
    },
    {
        clientId: 'eoukx319f5w9emoy',
        completeness: 13,
        name: 'Amount(+)',
        type: 'NUMBER',
    },
    {
        clientId: 'ukkfcomr1khxrbgg',
        completeness: 100,
        name: 'Balance',
        type: 'NUMBER',
    },
];

interface Props<NAME extends string> {
    name: NAME;
    className?: string;
    value: TimelineChartConfigType | undefined;
    onChange: (value: SetValueArg<TimelineChartConfigType | undefined>, name: NAME) => void;
    error?: Error<TimelineChartConfigType>;
}

function TimelineChartEdit<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        value,
        onChange,
        name,
        error: riskyError,
    } = props;

    const onFieldChange = useFormObject<
        NAME, TimelineChartConfigType
    >(name, onChange, {});

    const error = getErrorObject(riskyError);

    const textColumns = metadata?.filter(
        (datum) => datum.type === 'TEXT',
    );

    const dateColumns = metadata?.filter(
        (datum) => datum.type === 'DATE',
    );

    const columnLabelSelector = (col: Metadata) => col.name;
    const columnKeySelector = (col: Metadata) => col.clientId;

    return (
        <div className={_cs(className, styles.timelineChartEdit)}>
            <NonFieldError error={error} />
            <ExpandableContainer
                heading="Configure"
                headingSize="small"
                spacing="compact"
                contentClassName={styles.expandedBody}
                withoutBorder
            >
                <DatasetsConfigureButton />
                <SelectInput
                    name="date"
                    label="Date selector"
                    options={dateColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.date}
                    onChange={onFieldChange}
                    error={error?.date}
                />
                <SelectInput
                    name="title"
                    label="Title selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.title}
                    onChange={onFieldChange}
                    error={error?.title}
                />
                <SelectInput
                    name="detail"
                    label="Description selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.detail}
                    onChange={onFieldChange}
                    error={error?.detail}
                />
                <SelectInput
                    name="category"
                    label="Category selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.category}
                    onChange={onFieldChange}
                    error={error?.category}
                />
                <SelectInput
                    name="source"
                    label="Source selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.source}
                    onChange={onFieldChange}
                    error={error?.source}
                />
                <SelectInput
                    name="sourceUrl"
                    label="Source URL selector"
                    options={textColumns}
                    keySelector={columnKeySelector}
                    labelSelector={columnLabelSelector}
                    value={value?.sourceUrl}
                    onChange={onFieldChange}
                    error={error?.sourceUrl}
                />
            </ExpandableContainer>
        </div>
    );
}

export default TimelineChartEdit;
