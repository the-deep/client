import React, { useMemo } from 'react';
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
import { EnumOptions } from '#types/common';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    AssessmentRegistrySectorTypeEnum,
    GetAnalyticalOptionsQuery,
    AssessmentRegistryAnalysisFigureTypeEnum,
    AssessmentRegistryAnalysisLevelTypeEnum,
} from '#generated/types';
import { ScoreAnalyticalDensityType } from '../../../formSchema';

import styles from './styles.css';

export interface Props {
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

    const figureProvidedValue = useMemo(
        () => value?.figureProvided?.length ?? 0,
        [value?.figureProvided],
    );
    const analysisLevelValue = useMemo(
        () => value?.analysisLevelCovered?.length ?? 0,
        [value?.analysisLevelCovered],
    );

    const finalScore = useMemo(() => {
        if (figureProvidedValue > 0 || analysisLevelValue > 0) {
            return (figureProvidedValue * analysisLevelValue) / 10;
        }
        return value?.score;
    }, [
        value?.score,
        figureProvidedValue,
        analysisLevelValue,
    ]);

    const error = getErrorObject(riskyError);

    const [
        analysisLevelCoveredOptions,
        figureProvidedOptions,
    ] = [
        options?.analysisLevelCoveredOptions,
        options?.figureProvidedOptions,
    ];

    return (
        <ContainerCard
            contentClassName={styles.analyticalDensityInput}
            headingClassName={styles.analyticalHeading}
            heading={(
                <>
                    <div>
                        {description}
                    </div>
                    <div>
                        {finalScore}
                    </div>
                </>
            )}
            headingSize="extraSmall"
        >
            <ContainerCard
                heading={(
                    <>
                        <div>
                            Analysis levels covered by the assessment:
                        </div>
                        <div>
                            {analysisLevelValue}
                        </div>
                    </>
                )}
                headingClassName={styles.analyticalHeading}
                headingSize="extraSmall"
                className={styles.analyticalContent}
                borderBelowHeader
            >
                <CheckListInput
                    value={value?.analysisLevelCovered}
                    onChange={onScoreAnalyticalDensityChange}
                    name="analysisLevelCovered"
                    direction="vertical"
                    options={(analysisLevelCoveredOptions?.enumValues as EnumOptions<
                        AssessmentRegistryAnalysisLevelTypeEnum
                    >) ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    error={getErrorString(error?.analysisLevelCovered)}
                />
            </ContainerCard>
            <div className={styles.seperator} />
            <ContainerCard
                heading={(
                    <>
                        <div>
                            Figures provided by the assessment:
                        </div>
                        <div>
                            {figureProvidedValue}
                        </div>
                    </>
                )}
                headingClassName={styles.analyticalHeading}
                headingSize="extraSmall"
                className={styles.analyticalContent}
                borderBelowHeader
            >
                <CheckListInput
                    value={value?.figureProvided}
                    onChange={onScoreAnalyticalDensityChange}
                    name="figureProvided"
                    direction="vertical"
                    options={(figureProvidedOptions?.enumValues as EnumOptions<
                        AssessmentRegistryAnalysisFigureTypeEnum
                    >) ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    error={getErrorString(error?.figureProvided)}
                />
            </ContainerCard>
        </ContainerCard>
    );
}

export default AnalyticalDensityInput;
