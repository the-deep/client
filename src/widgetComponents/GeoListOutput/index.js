import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaramOutputElement } from '@togglecorp/faram';
import {
    _cs,
    listToMap,
    mapToList,
    isDefined,
    isObject,
    unique,
} from '@togglecorp/fujs';

import GeoInputList from '#components/input/GeoInput/GeoModal/GeoInputList';
import styles from './styles.scss';

function GeoListOutput(props) {
    const {
        className,
        geoOptionsByRegion,
        value,
    } = props;

    const allGeoOptions = useMemo(() => {
        const geoOptionsList = mapToList(
            geoOptionsByRegion,
            geoOption => geoOption,
        )
            .filter(isDefined)
            .flat();
        return geoOptionsList;
    }, [geoOptionsByRegion]);

    const allGeoOptionsMap = useMemo(() => {
        const geoOptionsMapping = listToMap(
            allGeoOptions,
            geoOption => geoOption.key,
            geoOption => geoOption,
        );
        return geoOptionsMapping;
    }, [allGeoOptions]);

    const allAdminLevelTitles = useMemo(() => {
        const adminLevelTitles = unique(
            allGeoOptions,
            geoOption => `${geoOption.region}-${geoOption.adminLevel}`,
        ).map(geoOption => ({
            key: geoOption.adminLevel,
            title: geoOption.adminLevelTitle,

            regionKey: geoOption.region,
            regionTitle: geoOption.regionTitle,
        }));
        return adminLevelTitles;
    }, [allGeoOptions]);

    const polygons = useMemo(() => (
        value.filter(isObject)
    ), [value]);

    const selections = useMemo(() => (
        value.filter(v => !isObject(v))
    ), [value]);

    return (
        <GeoInputList
            className={_cs(className, styles.list)}
            selections={selections}
            geoOptionsById={allGeoOptionsMap}
            polygons={polygons}
            adminLevelTitles={allAdminLevelTitles}
            polygonHidden
            polygonDisabled
            readOnly
        />
    );
}

GeoListOutput.propTypes = {
    className: PropTypes.string,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

GeoListOutput.defaultProps = {
    className: '',
    geoOptionsByRegion: {},
    value: [],
};

export default FaramOutputElement(GeoListOutput);
