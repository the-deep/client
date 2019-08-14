import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

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
    fields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
const defaultProps = {
    fields: {},
};

export default class Column extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getFieldList = memoize(fields => Object.values(fields))

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

        return {
            ...widgetProps,
            fieldType,
            readOnly: isStakeholder,
        };
    }

    render() {
        const {
            title,
            fields,
            sources,
        } = this.props;

        const fieldList = this.getFieldList(fields);
        const isStakeholder = this.isStakeholderColumn();

        return (
            <div className={styles.widgetGroup}>
                <h4 className={styles.heading}>
                    {title}
                    {isStakeholder &&
                        <ModalButton
                            className={styles.showMoreButton}
                            modal={
                                <StakeholderModal
                                    fields={fieldList}
                                    sources={sources}
                                />
                            }
                        />
                    }
                </h4>
                <ListView
                    className={styles.content}
                    data={fieldList}
                    rendererParams={this.fieldRendererParams}
                    renderer={BaseWidget}
                    keySelector={Column.fieldKeySelector}
                />
            </div>
        );
    }
}
