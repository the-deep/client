import React,
{
    useMemo,
}
    from 'react';
import {
    CheckListInput,
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import { AssessmentRegistrySectorTypeEnum, GetAnalyticalOptionsQuery } from '#generated/types';
import { ScoreAnalyticalDensityType } from '../../../formSchema';

import styles from './styles.css';

interface Props {
    name: number | undefined;
    sector: string | undefined;
    description: string | null | undefined;
    options: GetAnalyticalOptionsQuery | undefined
    value: ScoreAnalyticalDensityType | undefined;
    onChange: (
        value: SetValueArg<ScoreAnalyticalDensityType>, name: number | undefined
    ) => void;
    error: Error<ScoreAnalyticalDensityType>;
}

function AnalyticalDensityInput(props: Props) {
    const {
        name,
        value,
        sector,
        description,
        options,
        onChange,
        error: riskyError,
    } = props;

    const onScoreAnalyticalDensityChange = useFormObject(name, onChange, {
        clientId: randomString(),
        sector: sector as AssessmentRegistrySectorTypeEnum,
    });

    const error = getErrorObject(riskyError);

    const [
        analysisLevelCoveredOptions,
        figureProvidedOptions,
    ] = useMemo(() => ([
        options?.analysisLevelCoveredOptions,
        options?.figureProvidedOptions,
    ]), [options]);

    return (
        <ContainerCard
            contentClassName={styles.analyticalDensityInput}
            heading={description}
            headingSize="extraSmall"
        >
            <ContainerCard
                heading="Analysis Levels Covered by the Assessment :"
                headingSize="extraSmall"
                className={styles.analyticalContent}
                borderBelowHeader
            >
                <CheckListInput
                    value={value?.analysisLevelCovered}
                    onChange={onScoreAnalyticalDensityChange}
                    name="analysisLevelCovered"
                    direction="vertical"
                    options={analysisLevelCoveredOptions?.enumValues ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    error={getErrorString(error?.analysisLevelCovered)}
                />
            </ContainerCard>
            <ContainerCard
                heading="Figures Provided by the Assessment :"
                headingSize="extraSmall"
                className={styles.analyticalContent}
                borderBelowHeader
            >
                <CheckListInput
                    value={value?.figureProvided}
                    onChange={onScoreAnalyticalDensityChange}
                    name="figureProvided"
                    direction="vertical"
                    options={figureProvidedOptions?.enumValues ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    error={getErrorString(error?.figureProvided)}
                />
            </ContainerCard>
        </ContainerCard>
    );
}

export default AnalyticalDensityInput;
