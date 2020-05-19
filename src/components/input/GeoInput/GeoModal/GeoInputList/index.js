import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { _cs, isNotDefined, listToMap, isDefined } from '@togglecorp/fujs';

import DismissableListItem from '#rsca/DismissableListItem';
import ListView from '#rscv/List/ListView';

import styles from './styles.scss';

function groupList(
    list,
    keySelector,
    modifier,
) {
    if (isNotDefined(list)) {
        return [];
    }
    const mapping = list.reduce(
        (acc, elem, i) => {
            const key = keySelector(elem);
            const value = modifier
                ? modifier(elem, key, i, acc)
                : elem;
            if (acc[key]) {
                acc[key].values.push(value);
            } else {
                acc[key] = {
                    key,
                    values: [value],
                };
            }
            return acc;
        },
        {},
    );
    return Object.values(mapping);
}

const propTypes = {
    header: PropTypes.string,
    className: PropTypes.string,
    selections: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    polygons: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    geoOptionsById: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    adminLevelTitles: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    polygonDisabled: PropTypes.bool,
    onSelectionsChange: PropTypes.func.isRequired,
    onPolygonsChange: PropTypes.func.isRequired,
    onPolygonEditClick: PropTypes.func.isRequired,
};
const defaultProps = {
    header: undefined,
    className: undefined,
    selections: [],
    polygons: [],
    geoOptionsById: {},
    adminLevelTitles: [],
    polygonDisabled: false,
};

const GeoInputList = (props) => {
    const {
        header,
        className,

        selections,
        polygons,

        adminLevelTitles,
        geoOptionsById,

        polygonDisabled,

        onSelectionsChange,
        onPolygonsChange,

        onPolygonEditClick,
    } = props;

    const handlePolygonEdit = useCallback(
        (id) => {
            const polygon = polygons.find(p => p.geoJson.id === id);
            if (!polygon) {
                console.error('Could not find index for polygon id', id);
                return;
            }
            onPolygonEditClick(polygon);
        },
        [polygons, onPolygonEditClick],
    );

    const handlePolygonRemove = useCallback(
        (id) => {
            const newPolygons = polygons.filter(p => p.geoJson.id !== id);
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
        p => p.geoJson.id,
        [],
    );
    const polygonGroupKeySelector = useCallback(
        p => p.type,
        [],
    );

    // Selector for geo options
    const geoOptionKeySelector = useCallback(
        selection => selection.id,
        [],
    );
    const groupKeySelector = useCallback(
        selection => geoOptionsById[selection.id].adminLevel,
        [geoOptionsById],
    );

    const listRendererParams = useCallback(
        (key, value) => ({
            className: styles.item,
            itemKey: key,
            onDismiss: handleSelectionRemove,
            value: value.polygons && (value.polygons.length > 0)
                ? `${geoOptionsById[key].title} (${value.polygons.length})`
                : geoOptionsById[key].title,
            disabled: !!value.polygons,
        }),
        [handleSelectionRemove, geoOptionsById],
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
            color: polygon.geoJson.properties.color,
        }),
        [handlePolygonEdit, handlePolygonRemove, polygonDisabled],
    );


    const selectionsMapping = new Set(selections);
    const autoSelectionsForSelectedRegion = polygons
        .filter(polygon => isDefined(polygon.geoJson.properties.geoareas))
        .map(
            polygon => polygon.geoJson.properties.geoareas.map(
                geoarea => ({
                    id: String(geoarea),
                    geoJson: polygon.geoJson,
                }),
            ),
        )
        .flat()
        .filter(item => !selectionsMapping.has(item.id));

    const autoSelectionsGrouped = groupList(
        autoSelectionsForSelectedRegion,
        e => e.id,
        e => e.geoJson,
    ).map(item => ({
        id: item.key,
        polygons: item.values,
    }));

    const selectionsWrapped = selections.map(
        item => ({ id: item }),
    );

    const newSelections = [
        ...selectionsWrapped,
        ...autoSelectionsGrouped,
    ];

    console.warn(newSelections);

    return (
        <div className={_cs(className, styles.geoInputList)}>
            {header && (
                <h3 className={styles.heading}>
                    {header}
                </h3>
            )}
            <ListView
                data={newSelections}
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
GeoInputList.propTypes = propTypes;
GeoInputList.defaultProps = defaultProps;

export default GeoInputList;
