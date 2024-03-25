import React, { useCallback, useMemo } from 'react';
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

    const handleFigureProvidedChange = useCallback((
        newVal: AssessmentRegistryAnalysisFigureTypeEnum[] | undefined,
    ) => {
        onScoreAnalyticalDensityChange(newVal, 'figureProvided');
        const newScore = ((newVal?.length ?? 0) * analysisLevelValue) / 10;
        onScoreAnalyticalDensityChange(newScore, 'score');
    }, [
        analysisLevelValue,
        onScoreAnalyticalDensityChange,
    ]);
    const handleAnalysisLevelCoveredChange = useCallback((
        newVal: AssessmentRegistryAnalysisLevelTypeEnum[] | undefined,
    ) => {
        onScoreAnalyticalDensityChange(newVal, 'analysisLevelCovered');
        const newScore = ((newVal?.length ?? 0) * figureProvidedValue) / 10;
        onScoreAnalyticalDensityChange(newScore, 'score');
    }, [
        figureProvidedValue,
        onScoreAnalyticalDensityChange,
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
                        {value?.score}
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
                    onChange={handleAnalysisLevelCoveredChange}
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
                    onChange={handleFigureProvidedChange}
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
