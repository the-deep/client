import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerButton from '#rsca/Button/DangerButton';
import ListView from '#rscv/List/ListView';
import FaramGroup from '#rscg/FaramGroup';
import SelectInput from '#rsci/SelectInput';
import Checkbox from '#rsci/Checkbox';

import { iconNames } from '#constants';
import _ts from '#ts';

import Attribute from './Attributes';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    conditions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const deleteClick = (rows, index) => (
    rows.filter((row, ind) => ind !== index)
);

const emptyArray = [];

export default class ConditionsInputRow extends React.PureComponent {
    static propTypes = propTypes;

    static conditionTypeKeySelector = c => c.key;
    static conditionTypeLabelSelector = c => c.title;

    static attributeKeySelector = c => c.key;

    getCondtionTypes = memoize(conditions => (
        conditions.map(condition => ({
            key: condition.key,
            title: condition.title,
        }))
    ))

    getAttributesForConditionType = memoize((conditionType, conditions) => {
        if (!conditionType) {
            return emptyArray;
        }
        const { attributes } = conditions.find(c => c.key === conditionType);
        return attributes;
    })

    attributeRendererParams = (key, attribute) => {
        const {
            widgetData: {
                properties: {
                    data: widgetData,
                } = {},
            } = {},
        } = this.props;

        return ({
            widgetData,
            attribute,
        });
    }

    render() {
        const {
            index,
            widgetData,
            item: { conditionType },
            conditions,
        } = this.props;

        this.attributes = this.getAttributesForConditionType(
            conditionType,
            conditions,
        );

        this.conditionTypes = this.getCondtionTypes(conditions);

        return (
            <div className={styles.inputContainer}>
                <div className={styles.header} >
                    <div className={styles.title}>
                        {widgetData.title}
                    </div>
                    <div className={styles.rightContainer}>
                        <FaramGroup faramElementName={String(index)} >
                            <NonFieldErrors faramElement />
                            <Checkbox
                                className={styles.invertCheckbox}
                                faramElementName="invertLogic"
                                label={_ts('widgets.editor.conditional', 'invertLogicLabel')}
                            />
                        </FaramGroup>
                        <DangerButton
                            className={styles.deleteButton}
                            iconName={iconNames.delete}
                            title={_ts('widgets.editor.conditional', 'removeOptionButtonTitle')}
                            faramAction={deleteClick}
                            faramElementName={index}
                            transparent
                        />
                    </div>
                </div>
                <FaramGroup faramElementName={String(index)} >
                    <div className={styles.selectInputs}>
                        <SelectInput
                            hideClearButton
                            keySelector={ConditionsInputRow.conditionTypeKeySelector}
                            className={styles.conditionTypeSelect}
                            labelSelector={ConditionsInputRow.conditionTypeLabelSelector}
                            options={this.conditionTypes}
                            label={_ts('widgets.editor.conditional', 'conditionTypeLabel')}
                            placeholder={_ts('widgets.editor.conditional', 'conditionTypePlaceholder')}
                            faramElementName="conditionType"
                            showHintAndError={false}
                        />
                        <FaramGroup faramElementName="attributes" >
                            <ListView
                                className={styles.conditionAttributes}
                                data={this.attributes}
                                keySelector={ConditionsInputRow.attributeKeySelector}
                                renderer={Attribute}
                                rendererParams={this.attributeRendererParams}
                            />
                        </FaramGroup>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
