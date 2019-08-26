import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { FaramInputElement } from '@togglecorp/faram';

import Confirm from '#rscv/Modal/Confirm';
import {
    getDuplicates,
    mapToList,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import { afViewGeoOptionsSelector } from '#redux';
import _ts from '#ts';
import _cs from '#cs';

import GeoInput from '#components/input/GeoInput';
import styles from './styles.scss';

const propTypes = {
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    dataModifier: PropTypes.func.isRequired,
    titleSelector: PropTypes.func.isRequired,
    lastItemTitle: PropTypes.string,
    onChange: PropTypes.func.isRequired, // eslint-disable-line
};

const defaultProps = {
    geoOptions: {},
    lastItemTitle: 'lastItem',
};

const getRegions = memoize(geoOptions => (
    Object.keys(geoOptions).reduce((acc, r) => {
        if (geoOptions[r] && geoOptions[r][0]) {
            return (
                [
                    {
                        id: geoOptions[r][0].region,
                        title: geoOptions[r][0].regionTitle,
                    },
                    ...acc,
                ]
            );
        }
        return (acc);
    }, [])
));

const mapStateToProps = state => ({
    geoOptions: afViewGeoOptionsSelector(state),
});

@FaramInputElement
@connect(mapStateToProps)
export default class GeoLink extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showDuplicateConfirm: false,
            duplicateItems: [],
            nonDuplicateItems: [],
        };
    }

    getAllGeoOptions = memoize((geoOptionsByRegion) => {
        const geoOptionsList = mapToList(
            geoOptionsByRegion,
            geoOption => geoOption,
        )
            .filter(isDefined)
            .flat();
        return listToMap(geoOptionsList, d => d.key, d => d);
    })

    handleDuplicatesConfirmClose = () => {
        const { newValue } = this.state;
        const { lastItemTitle } = this.state;

        this.setState({
            showDuplicateConfirm: false,
        }, () => {
            this.props.onChange(newValue, { [lastItemTitle]: newValue[newValue.length - 1] });
        });
    }

    handleGeoChange = (values) => {
        const { geoOptions } = this.props;

        const allGeoOptions = this.getAllGeoOptions(geoOptions);
        const objectValues = values.map(v => allGeoOptions[v]);

        const locations = objectValues.map(item => ({
            ...item,
            label: item.title,
            originalKey: item.key,
            originalWidget: 'geo',
        }));
        if (locations.length < 1) {
            return;
        }
        const {
            dataModifier,
            lastItemTitle,
            titleSelector,
            value,
        } = this.props;

        const itemsMap = dataModifier(locations);
        let finalRows = [...value, ...itemsMap];

        const duplicates = getDuplicates(finalRows, titleSelector);
        if (duplicates.length > 0) {
            const duplicatesMap = listToMap(
                duplicates,
                d => d,
            );
            const newRowsWithoutDuplicates = itemsMap
                .filter(row => !duplicatesMap[titleSelector(row)]);

            finalRows = [...value, ...newRowsWithoutDuplicates];
            this.setState({
                showDuplicateConfirm: true,
                duplicateItems: duplicates,
                nonDuplicateItems: newRowsWithoutDuplicates.map(u => titleSelector(u)),
                newValue: finalRows,
            });
        } else {
            this.props.onChange(finalRows, { [lastItemTitle]: finalRows[finalRows.length - 1] });
        }
    }

    render() {
        const { geoOptions } = this.props;
        const {
            duplicateItems,
            nonDuplicateItems,
            showDuplicateConfirm,
        } = this.state;

        const regions = getRegions(geoOptions);

        const label = _ts('widgets.editor.link', 'addFromGeoLabel');

        const modalClassName = _cs(
            showDuplicateConfirm && styles.disableModal,
        );

        return (
            <React.Fragment>
                <GeoInput
                    className={modalClassName}
                    geoOptionsByRegion={geoOptions}
                    label={label}
                    onChange={this.handleGeoChange}
                    regions={regions}
                    showLabel={false}
                    hideList
                    hideInput
                />
                <Confirm
                    show={showDuplicateConfirm}
                    hideCancel
                    closeOnEscape={false}
                    closeOnOutsideClick={false}
                    title={_ts('widgets.editor.link', 'duplicatesConfirmTitle')}
                    onClose={this.handleDuplicatesConfirmClose}
                >
                    {nonDuplicateItems.length > 0 ? (
                        <React.Fragment>
                            {_ts(
                                'widgets.editor.link',
                                'duplicatesConfirmText',
                                {
                                    duplicates: (
                                        <span className={styles.duplicateItems}>
                                            {duplicateItems.join(', ')}
                                        </span>
                                    ),
                                },
                            )}
                            <div className={styles.nonDuplicates} >
                                {_ts(
                                    'widgets.editor.link',
                                    'nonDuplicatesConfirmText',
                                    {
                                        nonDuplicates: (
                                            <span className={styles.duplicateItems}>
                                                {nonDuplicateItems.join(', ')}
                                            </span>
                                        ),
                                    },
                                )}
                            </div>
                        </React.Fragment>
                    ) : (
                        _ts(
                            'widgets.editor.link',
                            'duplicatesConfirmText',
                            {
                                duplicates: (
                                    <span className={styles.duplicateItems}>
                                        {duplicateItems.join(', ')}
                                    </span>
                                ),
                            },
                        )
                    )}
                </Confirm>
            </React.Fragment>
        );
    }
}
