import React, { useContext } from 'react';
import {
    encodeDate,
    isDefined,
} from '@togglecorp/fujs';

import {
    FrameworkFilterType,
    KeyLabel,
} from '#types/newAnalyticalFramework';
import {
    keySelector as geoAreaKeySelector,
    labelSelector as geoAreaLabelSelector,
} from '#components/GeoMultiSelectInput';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import { PartialEntriesFilterDataType } from '#components/leadFilters/SourcesFilter/schema';

import DismissableListOutput from '../../DismissableListOutput';
import DismissableTextOutput from '../../DismissableTextOutput';
import DismissableTag from '../../DismissableTag';

const filterKeySelector = (d: KeyLabel) => d.key;
const filterLabelSelector = (d: KeyLabel) => d.label;

type PartialFrameworkFilterValue = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

interface FrameworkFilterOutputProps {
    label?: string;
    value: PartialFrameworkFilterValue;
    index: number;
    onDismiss: (index: number) => void;
    frameworkFilter?: FrameworkFilterType;
}

export function FrameworkFilterOutput(
    props: FrameworkFilterOutputProps,
) {
    const {
        label,
        value,
        onDismiss,
        index,
        frameworkFilter,
    } = props;

    const {
        geoAreaOptions,
    } = useContext(SourcesFilterContext);

    const handleDismiss = React.useCallback(() => {
        onDismiss(index);
    }, [onDismiss, index]);

    switch (frameworkFilter?.widgetType) {
        case 'DATE': {
            if (value.valueGte && value.valueLte) {
                const startDate = encodeDate(new Date(value.valueGte));
                const endDate = encodeDate(new Date(value.valueLte));
                const content = `${startDate} - ${endDate}`;
                return (
                    <DismissableTag
                        label={label}
                        name={index}
                        onDismiss={handleDismiss}
                    >
                        {content}
                    </DismissableTag>
                );
            }
            return null;
        }
        case 'DATE_RANGE': {
            if (value.valueGte && value.valueLte) {
                const startDate = encodeDate(new Date(value.valueGte));
                const endDate = encodeDate(new Date(value.valueLte));
                const content = `${startDate} - ${endDate}`;
                return (
                    <DismissableTag
                        label={label}
                        name={index}
                        onDismiss={handleDismiss}
                    >
                        {content}
                    </DismissableTag>
                );
            }
            return null;
        }
        case 'TIME': {
            if (value.valueGte && value.valueLte) {
                const content = `${value.valueGte} - ${value.valueLte}`;
                return (
                    <DismissableTag
                        label={label}
                        name={index}
                        onDismiss={handleDismiss}
                    >
                        {content}
                    </DismissableTag>
                );
            }
            return null;
        }
        case 'TIME_RANGE': {
            if (value.valueGte && value.valueLte) {
                const content = `${value.valueGte} - ${value.valueLte}`;
                return (
                    <DismissableTag
                        label={label}
                        name={index}
                        onDismiss={handleDismiss}
                    >
                        {content}
                    </DismissableTag>
                );
            }
            return null;
        }
        case 'NUMBER': {
            return (
                <>
                    {isDefined(value.valueGte) && (
                        <DismissableTag
                            label={`${label} (Greater than or equal)`}
                            name={index}
                            onDismiss={handleDismiss}
                        >
                            {value.valueGte}
                        </DismissableTag>
                    )}
                    {isDefined(value.valueLte) && (
                        <DismissableTag
                            label={`${label} (Less than or equal)`}
                            name={index}
                            onDismiss={handleDismiss}
                        >
                            {value.valueLte}
                        </DismissableTag>
                    )}
                </>
            );
        }
        case 'SCALE': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }
        case 'GEO': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={geoAreaOptions}
                    keySelector={geoAreaKeySelector}
                    labelSelector={geoAreaLabelSelector}
                    value={value.valueList}
                />
            );
        }
        case 'SELECT': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }
        case 'MULTISELECT': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }
        case 'ORGANIGRAM': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }
        case 'MATRIX1D': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }
        case 'MATRIX2D': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }
        case 'TEXT': {
            return (
                <DismissableTextOutput
                    label={label}
                    name={index}
                    value={value.value}
                    onDismiss={handleDismiss}
                />
            );
        }
        default:
            return null;
    }
}

export default FrameworkFilterOutput;
