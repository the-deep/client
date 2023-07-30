import React, { useCallback } from 'react';
import { Heading, List } from '@the-deep/deep-ui';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';

import {
    GetSummaryOptionsQuery,
    GetSummaryOptionsQueryVariables,
} from '#generated/types';
import { enumKeySelector } from '#utils/common';

import { PartialFormType } from '../formSchema';
import PillarItem from './PillarItem';
import styles from './styles.css';

const GET_SUMMARY_OPTIONS = gql`
    query getSummaryOptions {
        issueOptions: __type(name: "AssessmentRegistryFocusTypeEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

interface EnumValue {
    name: string;
    description?: string | null;
}

interface Props {
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
    readOnly?: boolean;
}

function SummaryForm(props: Props) {
    const {
        value,
        setFieldValue,
        error,
        disabled,
        readOnly,
    } = props;

    const {
        loading,
        data,
    } = useQuery<GetSummaryOptionsQuery, GetSummaryOptionsQueryVariables>(GET_SUMMARY_OPTIONS);

    const pillarRenderParams = useCallback(
        (_: string, pillarData: EnumValue) => pillarData, [],
    );

    return (
        <div className={styles.summary}>
            <Heading>Operational Heading</Heading>
            <List
                data={data?.issueOptions?.enumValues}
                keySelector={enumKeySelector}
                renderer={PillarItem}
                rendererParams={pillarRenderParams}
            />
        </div>
    );
}

export default SummaryForm;
