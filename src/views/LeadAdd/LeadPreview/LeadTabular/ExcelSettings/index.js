import PropTypes from 'prop-types';
import React from 'react';
import { FaramGroup } from '@togglecorp/faram';

import Checkbox from '#rsci/Checkbox';
import NumberInput from '#rsci/NumberInput';
import ListView from '#rscv/List/ListView';
import Message from '#rscv/Message';

import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

export default class ExcelSettings extends React.PureComponent {
    static sheetKeySelector = d => d.key;

    static propTypes = {
        meta: PropTypes.object, // eslint-disable-line react/forbid-prop-types
        sheets: PropTypes.object, // eslint-disable-line react/forbid-prop-types
        disabled: PropTypes.bool,
    }

    static defaultProps = {
        meta: {},
        sheets: {},
        disabled: false,
    }

    static renderSheetParams = (key, sheet) => ({
        sheetId: sheet.key,
        title: sheet.title,
    })

    renderSheetSettings = ({ sheetId, title }) => {
        const {
            sheets,
            disabled,
        } = this.props;
        const sheet = sheets[sheetId];
        return (
            <FaramGroup faramElementName={sheetId}>
                <div className={styles.sheetSetting}>
                    <header className={styles.header}>
                        <h4 className={styles.sheetTitle}>
                            {title}
                        </h4>
                    </header>
                    <div className={styles.content} >
                        <NumberInput
                            className={_cs(styles.input, styles.leftContent)}
                            faramElementName="headerRow"
                            label={_ts('addLeads.tabular', 'headerRowLabel')}
                            placeholder={_ts('addLeads.tabular', 'headerRowPlaceholder')}
                            disabled={sheet.noHeaders || sheet.skip || disabled}
                            separator=" "
                        />
                        <div>
                            <Checkbox
                                className={styles.input}
                                faramElementName="noHeaders"
                                label={_ts('addLeads.tabular', 'noHeaderLabel')}
                                disabled={sheet.skip || disabled}
                            />
                            <Checkbox
                                className={styles.input}
                                faramElementName="skip"
                                label={_ts('addLeads.tabular', 'skipLabel')}
                            />
                        </div>
                    </div>
                </div>
            </FaramGroup>
        );
    }

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
                    renderer={this.renderSheetSettings}
                    data={sheets}
                />
            </FaramGroup>
        );
    }
}
