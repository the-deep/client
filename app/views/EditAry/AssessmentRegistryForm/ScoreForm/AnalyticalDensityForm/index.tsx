import React, { useMemo } from 'react';

import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    EntriesAsList,
    Error,
    useFormArray,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { isDefined, isNotDefined, listToMap } from '@togglecorp/fujs';

import {
    AssessmentRegistrySectorTypeEnum,
    GetAnalyticalOptionsQuery,
    GetAnalyticalOptionsQueryVariables,
} from '#generated/types';

import {
    PartialFormType,
    ScoreAnalyticalDensityType,
} from '../../formSchema';
import AnalyticalDensityInput from './AnalyticalDensityInput';

import styles from './styles.css';

interface Props {
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>
}
const GET_ANALYTICAL_OPTIONS = gql`
    query GetAnalyticalOptions {
        sectorsOptions: __type(name: "AssessmentRegistrySectorTypeEnum") {
            enumValues {
                name
                description
            }
        }
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
        value,
        setFieldValue,
        error: riskyError,
    } = props;

    const {
        data: options,
    } = useQuery<GetAnalyticalOptionsQuery, GetAnalyticalOptionsQueryVariables>(
        GET_ANALYTICAL_OPTIONS,
    );

    const sectorsOptions = options?.sectorsOptions;

    const {
        setValue: setAnalyticalScore,
    } = useFormArray<
        'scoreAnalyticalDensity',
        ScoreAnalyticalDensityType
    >('scoreAnalyticalDensity', setFieldValue);

    const error = getErrorObject(
        riskyError,
    );

    const analyticalDensityValue = value.scoreAnalyticalDensity;
    const analyticalDensityError = getErrorObject(error?.scoreAnalyticalDensity);

    const sectorNameMapping = useMemo(() => listToMap(
        sectorsOptions?.enumValues,
        (k) => k.name,
        (item) => item.description ?? item.name,
    ), [sectorsOptions?.enumValues]);

    const analyticalDensityValueIndex = useMemo(() => listToMap(
        analyticalDensityValue,
        (k) => k.sector ?? '',
        (_, __, index) => index,
    ), [analyticalDensityValue]);

    if (isNotDefined(value.sectors) || value.sectors.length <= 0) {
        return (
            <div>
                Please select Sector from Focus tab
            </div>
        );
    }

    return (
        <div
            className={styles.analyticalDensityForm}
        >
            {value.sectors?.map((sector) => {
                const analyticalIndex = analyticalDensityValueIndex?.[
                    sector as AssessmentRegistrySectorTypeEnum
                ];
                const analyticalValue = isDefined(analyticalIndex)
                    ? analyticalDensityValue?.[analyticalIndex]
                    : undefined;
                const selectedClientId = isDefined(analyticalIndex)
                    ? analyticalDensityValue?.[analyticalIndex].clientId : undefined;
                const analyticalError = isDefined(selectedClientId)
                    ? analyticalDensityError?.[selectedClientId]
                    : undefined;
                return (
                    <AnalyticalDensityInput
                        key={sector}
                        name={analyticalIndex}
                        description={sectorNameMapping?.[sector] ?? sector}
                        options={options}
                        onChange={setAnalyticalScore}
                        sector={sector}
                        value={analyticalValue}
                        error={analyticalError}
                    />
                );
            })}
        </div>
    );
}

export default AnalyticalDensityForm;
