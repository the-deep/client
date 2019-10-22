import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';

import { getProps, BaseWidget } from '../../widgetUtils';
import StakeholderModal from '../StakeholderModal';
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
};
const defaultProps = {
    fields: [],
};

export default class Column extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // FIXME: should identify using identifier
    isStakeholderColumn = () => {
        const { title } = this.props;
        return title.toLowerCase() === 'stakeholders';
    }

    fieldKeySelector = data => data.id;

    fieldRendererParams = (key, data) => {
        const {
            sources,
        } = this.props;
        const { fieldType } = data;

        const isStakeholder = this.isStakeholderColumn();
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
        } = this.props;

        const isStakeholder = this.isStakeholderColumn();

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
