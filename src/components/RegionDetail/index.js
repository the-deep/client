import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '#rsci/TextInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FaramGroup from '#rscg/FaramGroup';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    dataLoading: PropTypes.bool,
};

const defaultProps = {
    className: '',
    dataLoading: false,
};

export default class RegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            dataLoading,
        } = this.props;

        const classNames = `${className} ${styles.regionDetailForm}`;

        return (
            <div className={classNames} >
                { dataLoading && <LoadingAnimation /> }
                <header className={styles.header}>
                    <h4 className={styles.heading} >
                        {_ts('components.regionDetail', 'regionGeneralInfoLabel')}
                    </h4>
                </header>
                <NonFieldErrors faramElement />
                <div className={styles.inputContainer}>
                    <TextInput
                        faramElementName="code"
                        label={_ts('components.regionDetail', 'countryCodeLabel')}
                        placeholder={_ts('components.regionDetail', 'countryCodePlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        faramElementName="title"
                        label={_ts('components.regionDetail', 'countryNameLabel')}
                        placeholder={_ts('components.regionDetail', 'countryNamePlaceholder')}
                        className={styles.textInput}
                    />
                    <FaramGroup faramElementName="regionalGroups" >
                        <TextInput
                            faramElementName="wbRegion"
                            label={_ts('components.regionDetail', 'wbRegionLabel')}
                            placeholder={_ts('components.regionDetail', 'wbRegionPlaceholer')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="wbIncomeRegion"
                            label={_ts('components.regionDetail', 'wbIncomeRegionLabel')}
                            placeholder={_ts('components.regionDetail', 'wbIncomeRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="ochaRegion"
                            label={_ts('components.regionDetail', 'ochaRegionLabel')}
                            placeholder={_ts('components.regionDetail', 'ochaRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="echoRegion"
                            label={_ts('components.regionDetail', 'echoRegionLabel')}
                            placeholder={_ts('components.regionDetail', 'echoRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="unGeoRegion"
                            label={_ts('components.regionDetail', 'unGeoRegionLabel')}
                            placeholder={_ts('components.regionDetail', 'unGeoRegionPlaceholer')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="unGeoSubregion"
                            label={_ts('components.regionDetail', 'unGeoSubregionLabel')}
                            placeholder={_ts('components.regionDetail', 'unGeoSubregionPlaceholer')}
                            className={styles.textInput}
                        />
                    </FaramGroup>
                </div>
            </div>
        );
    }
}
