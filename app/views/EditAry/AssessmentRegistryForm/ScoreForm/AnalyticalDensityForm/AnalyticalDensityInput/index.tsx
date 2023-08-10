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

    const figureProvidedValue = value?.figureProvided?.length ?? 0;
    const analysisLevelValue = value?.analysisLevelCovered?.length ?? 0;
    const sectorWiseDensityValue = (figureProvidedValue * analysisLevelValue) / 10;

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
            headingClassName={styles.analyticalHeading}
            heading={(
                <>
                    <div>
                        {description}
                    </div>
                    <div>
                        {sectorWiseDensityValue}
                    </div>
                </>
            )}
            headingSize="extraSmall"
        >
            <ContainerCard
                heading={(
                    <>
                        <div>
                            Analysis Levels Covered by the Assessment:
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
                            Figures Provided by the Assessment:
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
