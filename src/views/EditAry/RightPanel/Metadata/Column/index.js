import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';
import StakeholderModal from '#components/input/StakeholderModal';

import { getProps } from '#entities/editAry';
import BaseWidget from '#entities/editAry/BaseWidget';
import { organizationTitleSelector } from '#entities/organization';
import styles from './styles.scss';

const StakeholderButton = props => (
    <AccentButton
        iconName="people"
        transparent
        {...props}
    />
);
const ModalButton = modalize(StakeholderButton);

const propTypes = {
    title: PropTypes.string.isRequired,
    sources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    fields: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    isStakeholder: PropTypes.bool,
};
const defaultProps = {
    fields: [],
    isStakeholder: false,
};

export default class Column extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    fieldKeySelector = data => data.id;

    fieldRendererParams = (key, data) => {
        const {
            sources,
            isStakeholder,
        } = this.props;
        const { fieldType } = data;

        const widgetProps = getProps(data, sources);

        const newFieldType = isStakeholder && fieldType === 'multiselect'
            ? 'listInput'
            : fieldType;

        const otherProps = {};
        if (isStakeholder) {
            otherProps.labelSelector = organizationTitleSelector;
        }

        return {
            ...widgetProps,
            ...otherProps,
            fieldType: newFieldType,
            readOnly: isStakeholder,
        };
    }

    render() {
        const {
            title,
            fields,
            sources,
            isStakeholder,
        } = this.props;

        return (
            <div className={styles.widgetGroup}>
                <h3 className={styles.heading}>
                    {title}
                    {isStakeholder &&
                        <ModalButton
                            className={styles.showMoreButton}
                            modal={
                                <StakeholderModal
                                    fields={fields}
                                    sources={sources}
                                />
                            }
                        />
                    }
                </h3>
                <ListView
                    className={styles.content}
                    data={fields}
                    rendererParams={this.fieldRendererParams}
                    renderer={BaseWidget}
                    keySelector={Column.fieldKeySelector}
                />
            </div>
        );
    }
}
