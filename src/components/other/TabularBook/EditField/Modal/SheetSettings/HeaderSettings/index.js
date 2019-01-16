import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rscg/FaramGroup';
import TextInput from '#rsci/TextInput';
import NumberInput from '#rsci/NumberInput';
import SegmentInput from '#rsci/SegmentInput';

import _ts from '#ts';
import styles from './styles.scss';

const propTypes = {
    headerIndex: PropTypes.number.isRequired,
    headerDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class HeaderSettings extends React.PureComponent {
    static propTypes = propTypes;

    static hiddenOptionsKeySelector = d => d.key;

    static fieldTypes = [
        { key: 'string', label: 'String' },
        { key: 'number', label: 'Number' },
        { key: 'datetime', label: 'Date' },
        { key: 'geo', label: 'Geo' },
    ];

    static separatorOptions = [
        { key: 'space', label: 'Space' },
        { key: 'comma', label: 'Comma' },
        { key: 'none', label: 'None' },
    ];

    static geoTypeOptions = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
    ];

    static hiddenOptions = [
        {
            key: true,
            label: 'True',
        },
        {
            key: false,
            label: 'False',
        },
    ];

    renderSettingsForType = (type) => {
        if (type === 'number') {
            return (
                <SegmentInput
                    faramElementName="separator"
                    label={_ts('tabular.editField', 'separatorLabel')}
                    options={HeaderSettings.separatorOptions}
                    showLabel
                    showHintAndError
                />
            );
        }

        if (type === 'geo') {
            return (
                <React.Fragment>
                    <SegmentInput
                        faramElementName="geoType"
                        label={_ts('tabular.editField', 'geoTypeLabel')}
                        options={HeaderSettings.geoTypeOptions}
                        showLabel
                        showHintAndError
                    />
                    <NumberInput
                        faramElementName="adminLevel"
                        label={_ts('tabular.editField', 'adminLevelLabel')}
                        placeholder={_ts('tabular.editField', 'adminLevelPlaceholder')}
                        showLabel
                        showHintAndError
                    />
                </React.Fragment>
            );
        }

        return <div />;
    }

    render() {
        const {
            headerDetails,
            headerIndex,
        } = this.props;

        const headerHideLabel = _ts('tabular.editModal', 'headerHideLabel');

        return (
            <FaramGroup faramElementName={headerIndex} >
                <div className={styles.headerSettings}>
                    <TextInput
                        faramElementName="title"
                        label={_ts('tabular.editField', 'titleLabel')}
                        showLabel
                        showHintAndError
                    />
                    <SegmentInput
                        faramElementName="hidden"
                        options={HeaderSettings.hiddenOptions}
                        label={headerHideLabel}
                        keySelector={HeaderSettings.hiddenOptionsKeySelector}
                    />
                    <SegmentInput
                        faramElementName="type"
                        label={_ts('tabular.editField', 'typeLabel')}
                        options={HeaderSettings.fieldTypes}
                        showLabel
                        showHintAndError
                    />
                    <FaramGroup faramElementName="options">
                        {this.renderSettingsForType(headerDetails.type)}
                    </FaramGroup>
                </div>
            </FaramGroup>
        );
    }
}
