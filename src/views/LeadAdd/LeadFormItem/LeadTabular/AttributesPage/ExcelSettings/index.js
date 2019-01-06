import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rscg/FaramGroup';
import Checkbox from '#rsci/Checkbox';
import NumberInput from '#rsci/NumberInput';
import ListView from '#rscv/List/ListView';
import Message from '#rscv/Message';

import _ts from '#ts';

import styles from './styles.scss';

export default class ExcelSettings extends React.PureComponent {
    static sheetKeySelector = d => d.key;

    static propTypes = {
        meta: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    }

    static defaultProps = {
        meta: {},
    }

    static renderSheetParams = (key, sheet) => ({
        sheetId: sheet.key,
        title: sheet.title,
    })

    static renderSheetSettings = ({ sheetId, title }) => (
        <FaramGroup faramElementName={sheetId}>
            <div className={styles.sheetSetting}>
                <header className={styles.header}>
                    <h4 className={styles.sheetTitle}>
                        {title}
                    </h4>
                    <Checkbox
                        className={styles.checkInput}
                        faramElementName="skip"
                        label={_ts('addLeads.tabular', 'skipLabel')}
                    />
                </header>
                <NumberInput
                    className={styles.sheetHeaderRowInput}
                    faramElementName="headerRow"
                    label={_ts('addLeads.tabular', 'headerRowLabel')}
                    showLabel
                    showHintAndError
                />
            </div>
        </FaramGroup>
    );

    render() {
        const { meta: { sheets } = {} } = this.props;

        if (!sheets) {
            return (
                <Message>
                    {_ts('addLeads.tabular', 'invalid')}
                </Message>
            );
        }

        return (
            <FaramGroup faramElementName="sheets">
                <ListView
                    className={styles.sheetList}
                    keySelector={ExcelSettings.sheetKeySelector}
                    rendererParams={ExcelSettings.renderSheetParams}
                    renderer={ExcelSettings.renderSheetSettings}
                    data={sheets}
                />
            </FaramGroup>
        );
    }
}
