import React, { useCallback, useMemo } from 'react';
import { FaramInputElement } from '@togglecorp/faram';

import Icon from '#rscg/Icon';
import RotatingInput from '#rsci/RotatingInput';
import GeoInput from '#components/input/GeoInput/';

import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

interface Props {
    label: string;
    geoOptions: unknown;
    regions: unknown[];
    className?: string;
    value: {
        includeSubRegions: boolean;
        areas: unknown[];
    };
    onChange: (v: unknown) => void;
}

const rendererSelector = d => d?.renderer;
const keySelector = d => d.key;

const options = [
    {
        renderer: (
            <div
                className={styles.subRegionSelected}
                title={_ts('entries', 'includeSubRegionsTitle')}
            >
                <Icon name="suborgIcon" />
            </div>
        ),
        key: true,
    },
    {
        renderer: (
            <div
                className={styles.subRegionNotSelected}
                title={_ts('entries', 'includeSubRegionsTitle')}
            >
                <Icon name="suborgIcon" />
            </div>
        ),
        key: false,
    },
];

interface GeoInputIconProps {
    value: {
        includeSubRegions: boolean;
        areas: unknown[];
    };
    handleRotatingInputChange: (v: boolean) => void;
}

function GeoInputIcon(props: GeoInputIconProps) {
    const {
        value,
        handleRotatingInputChange,
    } = props;

    return (
        <RotatingInput
            className={_cs(styles.rotatingInput)}
            value={value?.includeSubRegions}
            options={options}
            onChange={handleRotatingInputChange}
            rendererSelector={rendererSelector}
            keySelector={keySelector}
            showHintAndError={false}
            showLabel={false}
        />
    );
}

function GeoFilter(props: Props) {
    const {
        label,
        geoOptions,
        regions,
        value,
        onChange,
        className,
    } = props;

    const handleGeoChange = useCallback((areas) => {
        onChange({
            ...value,
            areas,
        });
    }, [onChange, value]);

    const handleRotatingInputChange = useCallback((includeSubRegions) => {
        onChange({
            ...value,
            includeSubRegions,
        });
    }, [onChange, value]);

    const icons = useMemo(() => (
        <GeoInputIcon
            value={value}
            handleRotatingInputChange={handleRotatingInputChange}
        />
    ), [value, handleRotatingInputChange]);

    return (
        <GeoInput
            className={_cs(styles.geoFilter, className)}
            value={value?.areas}
            geoOptionsByRegion={geoOptions}
            onChange={handleGeoChange}
            regions={regions}
            placeholder={_ts('entries', 'geoPlaceholder')}
            showHeader={false}
            label={label}
            hideList
            showHintAndError={false}
            icons={icons}
        />
    );
}

export default FaramInputElement(GeoFilter);
