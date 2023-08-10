import React,
{
    useCallback,
    useMemo,
} from 'react';

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
import {
    ListView,
} from '@the-deep/deep-ui';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import {
    AssessmentRegistrySectorTypeEnum,
    GetAnalyticalOptionsQuery,
    GetAnalyticalOptionsQueryVariables,
} from '#generated/types';

import {
    PartialFormType,
    ScoreAnalyticalDensityType,
} from '../../formSchema';
import AnalyticalDensityInput,
{
    Props as AnalyticalDensityInputProps,
} from './AnalyticalDensityInput';

import styles from './styles.css';

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
type SectorType = NonNullable<PartialFormType['sectors']>[number];

const keySelector = (d: SectorType) => d;

interface Props {
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>
}

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

    const sectorsValue = value.sectors;
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

    const analyticalInputParams = useCallback(
        (_, data: SectorType): AnalyticalDensityInputProps => {
            const analyticalIndex = analyticalDensityValueIndex?.[
                data as AssessmentRegistrySectorTypeEnum
            ];
            const analyticalValue = isDefined(analyticalIndex)
                ? analyticalDensityValue?.[analyticalIndex]
                : undefined;
            const selectedClientId = isDefined(analyticalIndex)
                ? analyticalDensityValue?.[analyticalIndex].clientId : undefined;
            const analyticalError = isDefined(selectedClientId)
                ? analyticalDensityError?.[selectedClientId]
                : undefined;

            return {
                name: analyticalIndex,
                description: sectorNameMapping?.[data] ?? data,
                options,
                onChange: setAnalyticalScore,
                sector: data,
                value: analyticalValue,
                error: analyticalError,
            };
        },
        [
            sectorNameMapping,
            analyticalDensityValueIndex,
            analyticalDensityValue,
            analyticalDensityError,
            options,
            setAnalyticalScore,
        ],
    );

    return (
        <ListView
            className={styles.analyticalDensityForm}
            data={sectorsValue}
            keySelector={keySelector}
            renderer={AnalyticalDensityInput}
            rendererParams={analyticalInputParams}
            emptyMessage="Please select sector from Focus tab"
            messageShown
            messageIconShown
            pending={false}
            filtered={false}
            errored={false}
        />
    );
}

export default AnalyticalDensityForm;
