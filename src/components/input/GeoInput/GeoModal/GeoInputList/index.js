import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { _cs } from '@togglecorp/fujs';

import DismissableListItem from '#rsca/DismissableListItem';
import ListView from '#rscv/List/ListView';


import styles from './styles.scss';

// TODO: should handle multiple regions later
const GeoInputList = (props) => {
    const {
        header,
        className,

        selections,
        mappedSelections,
        polygons,
        adminLevelTitles,

        polygonDisabled,

        onSelectionsChange,
        onPolygonsChange,

        onPolygonEditClick,
    } = props;

    const handlePolygonEdit = useCallback(
        (localId) => {
            const polygon = polygons.find(p => p.localId === localId);
            if (!polygon) {
                console.error('Could not find index for polygon localId', localId);
                return;
            }
            console.warn('Do something for', polygon);
            onPolygonEditClick(polygon);
        },
        [polygons, onPolygonEditClick],
    );

    const handlePolygonRemove = useCallback(
        (localId) => {
            const newPolygons = polygons.filter(p => p.localId !== localId);
            onPolygonsChange(newPolygons);
        },
        [onPolygonsChange, polygons],
    );

    const handleSelectionRemove = useCallback(
        (itemKey) => {
            const newSelections = selections.filter(v => v !== itemKey);
            onSelectionsChange(newSelections);
        },
        [onSelectionsChange, selections],
    );

    // Selector for polygon
    const polygonKeySelector = useCallback(
        p => p.localId,
        [],
    );
    const polygonGroupKeySelector = useCallback(
        p => p.type,
        [],
    );

    // Selector for geo options
    const geoOptionKeySelector = useCallback(
        option => option.key,
        [],
    );
    const groupKeySelector = useCallback(
        option => option.adminLevel,
        [],
    );

    const listRendererParams = useCallback(
        (key, geoOption) => ({
            className: styles.item,
            itemKey: key,
            onDismiss: handleSelectionRemove,
            value: geoOption.title,
        }),
        [handleSelectionRemove],
    );

    const groupRendererParams = useCallback(
        (groupKey) => {
            const adminLevel = adminLevelTitles.find(
                a => String(a.key) === String(groupKey),
            );

            return {
                children: adminLevel ? adminLevel.title : '',
            };
        },
        [adminLevelTitles],
    );

    const polygonGroupRendererParams = useCallback(
        groupKey => ({
            children: groupKey,
        }),
        [],
    );

    const polygonListRendererParams = useCallback(
        (key, polygon) => ({
            className: styles.item,
            itemKey: key,
            onDismiss: handlePolygonRemove,
            disabled: polygonDisabled,
            onEdit: handlePolygonEdit,
            value: polygon.geoJson.properties.title,
            marker: null,
        }),
        [handlePolygonEdit, handlePolygonRemove, polygonDisabled],
    );

    return (
        <div className={_cs(className, styles.geoInputList)}>
            {header && (
                <h3 className={styles.heading}>
                    {header}
                </h3>
            )}
            <ListView
                data={mappedSelections}
                emptyComponent={null}
                keySelector={geoOptionKeySelector}
                renderer={DismissableListItem}
                rendererParams={listRendererParams}
                groupKeySelector={groupKeySelector}
                groupRendererParams={groupRendererParams}
            />
            <ListView
                data={polygons}
                emptyComponent={null}
                keySelector={polygonKeySelector}
                renderer={DismissableListItem}
                rendererParams={polygonListRendererParams}
                groupKeySelector={polygonGroupKeySelector}
                groupRendererParams={polygonGroupRendererParams}
            />
        </div>
    );
};
GeoInputList.propTypes = {
    header: PropTypes.string,
    className: PropTypes.string,
    selections: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    mappedSelections: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    polygons: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    adminLevelTitles: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    polygonDisabled: PropTypes.bool,
    onSelectionsChange: PropTypes.func.isRequired,
    onPolygonsChange: PropTypes.func.isRequired,
    onPolygonEditClick: PropTypes.func.isRequired,
};
GeoInputList.defaultProps = {
    header: undefined,
    className: undefined,
    selections: [],
    mappedSelections: [],
    polygons: [],
    adminLevelTitles: [],
    polygonDisabled: false,
};

export default GeoInputList;
