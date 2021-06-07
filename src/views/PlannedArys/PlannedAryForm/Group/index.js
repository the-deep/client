import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';
import StakeholderModal from '#components/input/StakeholderModal';

import { getProps } from '#entities/editAry';
import BaseWidget from '#entities/editAry/BaseWidget';

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
    // eslint-disable-next-line react/forbid-prop-types
    sources: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    fields: PropTypes.array,
    isStakeholder: PropTypes.bool,
};

const defaultProps = {
    sources: undefined,
    fields: [],
    isStakeholder: false,
};

const fieldKeySelector = data => data.id;

export default class PlannedMetadataGroups extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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

        return {
            ...widgetProps,
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
                <h3>
                    {isStakeholder &&
                        <React.Fragment>
                            {title}
                            <ModalButton
                                modal={
                                    <StakeholderModal
                                        fields={fields}
                                        sources={sources}
                                    />
                                }
                            />
                        </React.Fragment>
                    }
                </h3>
                <ListView
                    className={_cs(
                        isStakeholder && styles.stakeholder,
                    )}
                    data={fields}
                    rendererParams={this.fieldRendererParams}
                    renderer={BaseWidget}
                    keySelector={fieldKeySelector}
                />
            </div>
        );
    }
}
