import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import ListView from '#rscv/List/ListView';
import FaramGroup from '#rsci/Faram/FaramGroup';
import SelectInput from '#rsci/SelectInput';

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

// eslint-disable-next-line react/prefer-stateless-function
export default class InputRow extends React.PureComponent {
    static propTypes = propTypes;

    static conditionTypeKeySelector = c => c.key;
    static conditionTypeLabelSelector = c => c.title;

    static getCondtionTypes = conditions => (
        conditions.map(condition => ({
            key: condition.key,
            title: condition.title,
        }))
    )

    static getAttributesForConditionType = (conditionType, conditions) => {
        if (!conditionType) {
            return [];
        }
        const { attributes } = conditions.find(c => c.key === conditionType);
        return attributes;
    }

    constructor(props) {
        super(props);
        const {
            item: { conditionType },
            conditions,
        } = this.props;

        this.attributes = InputRow.getAttributesForConditionType(conditionType, conditions);
        this.conditionTypes = InputRow.getCondtionTypes(conditions);
    }

    componentWillReceiveProps(nextProps) {
        const {
            item: { conditionType: newConditionType } = {},
            conditions,
        } = nextProps;
        const { item: { conditionType: oldConditionType } = {} } = this.props;

        if (newConditionType !== oldConditionType) {
            this.attributes = InputRow.getAttributesForConditionType(newConditionType, conditions);
        }
    }

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
        } = this.props;

        return (
            <div className={styles.inputContainer}>
                <FaramGroup
                    faramElementName={String(index)}
                >
                    <div className={styles.title}>
                        {widgetData.title}
                    </div>
                    <SelectInput
                        hideClearButton
                        keySelector={InputRow.conditionTypeKeySelector}
                        labelSelector={InputRow.conditionTypeLabelSelector}
                        options={this.conditionTypes}
                        label={_ts('widgets.editor.conditional', 'conditionTypeLabel')}
                        placeholder={_ts('widgets.editor.conditional', 'conditionTypePlaceholder')}
                        faramElementName="conditionType"
                    />
                    <FaramGroup faramElementName="attributes" >
                        <ListView
                            className={styles.conditionAttributes}
                            data={this.attributes}
                            renderer={Attribute}
                            rendererParams={this.attributeRendererParams}
                        />
                    </FaramGroup>
                </FaramGroup>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    faramAction="remove"
                    title={_ts('widgets.editor.conditional', 'removeOptionButtonTitle')}
                    faramElementIndex={index}
                    transparent
                />
            </div>
        );
    }
}
