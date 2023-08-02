import React,
{
    useMemo,
    useState,
} from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import { CheckListInput, ContainerCard } from '@the-deep/deep-ui';

import {
    GetAnalyticalOptionsQuery,
    GetAnalyticalOptionsQueryVariables,
} from '#generated/types';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';

import styles from './styles.css';

interface Props {
    heading: string;
}
const GET_ANALYTICAL_OPTIONS = gql`
    query GetAnalyticalOptions {
        figureProvidedOptions: __type(name: "AssessmentRegistryAnalysisFigureTypeEnum") {
            enumValues {
                name
                description
            }
        }
        analysisLevelCoveredOptions: __type(name: "AssessmentRegistryAnalysisLevelTypeEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

function AnalyticalDensityForm(props: Props) {
    const {
        heading,
    } = props;
    const [checkList, setCheckList] = useState();
    const [checkListTwo, setCheckListTwo] = useState();

    const {
        data: options,
    } = useQuery<GetAnalyticalOptionsQuery, GetAnalyticalOptionsQueryVariables>(
        GET_ANALYTICAL_OPTIONS,
    );

    const [
        analysisLevelCoveredOptions,
        figureProvidedOptions,
    ] = useMemo(() => ([
        options?.analysisLevelCoveredOptions,
        options?.figureProvidedOptions,
    ]), [options]);

    return (
        <ContainerCard
            contentClassName={styles.analyticalDensityForm}
            heading={heading}
            headingSize="extraSmall"
        >
            <ContainerCard
                heading="Analysis Levels Covered by the Assessment :"
                headingSize="extraSmall"
                className={styles.analyticalContent}
                borderBelowHeader
            >
                <CheckListInput
                    value={checkList}
                    onChange={setCheckList}
                    name="analysisLevelCovered"
                    direction="vertical"
                    options={analysisLevelCoveredOptions?.enumValues}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                />
            </ContainerCard>
            <ContainerCard
                heading="Figures Provided by the Assessment :"
                headingSize="extraSmall"
                className={styles.analyticalContent}
                borderBelowHeader
            >
                <CheckListInput
                    value={checkListTwo}
                    onChange={setCheckListTwo}
                    name="figureProvided"
                    direction="vertical"
                    options={figureProvidedOptions?.enumValues}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                />
            </ContainerCard>
        </ContainerCard>
    );
}

export default AnalyticalDensityForm;
