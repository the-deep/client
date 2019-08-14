import React from 'react';
import PropTypes from 'prop-types';

import DangerButton from '#rsca/Button/DangerButton';
import List from '#rscv/List';

import Column from './Column';
import styles from './styles.scss';


const propTypes = {
    sources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    index: PropTypes.number.isRequired,
    secondaryDataReviewSelected: PropTypes.bool.isRequired,
    attributesTemplate: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attributesTemplate: [],
};

export default class Row extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static removeAttribute = (attributes, index) => {
        const newAttributes = [...attributes];
        newAttributes.splice(index, 1);
        return newAttributes;
    }

    attributeKeySelector = methodologyGroup => methodologyGroup.id;

    attributeRendererParams = (key, methodologyGroup) => ({
        secondaryDataReviewSelected: this.props.secondaryDataReviewSelected,
        sources: this.props.sources,
        index: this.props.index,
        fields: methodologyGroup.fields,
    })

    render() {
        const {
            attributesTemplate,
            index,
        } = this.props;

        return (
            <div className={styles.row}>
                <List
                    data={attributesTemplate}
                    renderer={Column}
                    rendererParams={this.attributeRendererParams}
                    keySelector={this.attributeKeySelector}
                    modifier={this.renderAttribute}
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        iconName="delete"
                        faramElementName={index}
                        faramAction={Row.removeAttribute}
                    />
                </div>
            </div>
        );
    }
}
