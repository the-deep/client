import React from 'react';

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
    GetAnalyticalOptionsQuery,
    GetAnalyticalOptionsQueryVariables,
} from '#generated/types';

import { PartialFormType } from '../../formSchema';
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
    } = useFormArray('scoreAnalyticalDensity', setFieldValue);

    const error = getErrorObject(
        riskyError,
    );

    const analyticalDensityValue = value.scoreAnalyticalDensity;
    const analyticalDensityError = getErrorObject(error?.scoreAnalyticalDensity);

    const getDescriptions = (name: string) => {
        if (isNotDefined(sectorsOptions?.enumValues)) {
            return undefined;
        }
        return sectorsOptions?.enumValues.find(
            (item) => item.name === name,
        );
    };

    const sectorList = value.sectors && value.sectors.map((sector) => (
        getDescriptions(sector)));

    const analyticalDensityValueIndex = listToMap(
        analyticalDensityValue,
        (k) => k.sector ?? '',
        (_, __, index) => index,
    );

    if (isNotDefined(sectorList)) {
        return (
            <div>
                Please select Sector from focus form
            </div>
        );
    }

    return (
        <div
            className={styles.analyticalDensityForm}
        >
            {sectorList?.map((list) => {
                const analyticalIndex = analyticalDensityValueIndex?.[list?.name];
                const analyticalValue = isDefined(analyticalIndex)
                    ? analyticalDensityValue?.[analyticalIndex]
                    : undefined;
                const analyticalError = isDefined(analyticalIndex)
                    ? analyticalDensityError?.[analyticalIndex]
                    : undefined;
                return (
                    <AnalyticalDensityInput
                        name={analyticalIndex}
                        description={list?.description}
                        options={options}
                        onChange={setAnalyticalScore}
                        sector={list?.name}
                        value={analyticalValue}
                        error={analyticalError}
                    />
                );
            })}
        </div>
    );
}

export default AnalyticalDensityForm;
