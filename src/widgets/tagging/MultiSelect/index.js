import React from 'react';
import PropTypes from 'prop-types';

import MultiSelectInput from '#rsci/MultiSelectInput';
import SimpleListInput from '#rsci/SimpleListInput';
import styles from './styles.scss';
// import _ts from '#ts';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
    widget: undefined,
};

const emptyArray = [];
const getOptions = (widget) => {
    const { properties: { data: { options = emptyArray } = {} } = {} } = widget;
    return options;
};

// eslint-disable-next-line react/prefer-stateless-function
export default class MultiSelectWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static labelSelector = o => o.label;
    static keySelector = o => o.key;

    render() {
        const { widget } = this.props;
        const options = getOptions(widget);

        return (
            <div className={styles.input}>
                <MultiSelectInput
                    className={styles.multiSelect}
                    faramElementName="value"
                    options={options}
                    labelSelector={MultiSelectWidget.labelSelector}
                    keySelector={MultiSelectWidget.keySelector}
                    showLabel={false}
                    // emptyComponent={null}
                />
                <SimpleListInput
                    className={styles.checklist}
                    listClassName={styles.list}
                    faramElementName="value"
                    options={options}
                    labelSelector={MultiSelectWidget.labelSelector}
                    keySelector={MultiSelectWidget.keySelector}
                    showLabel={false}
                    emptyComponent={null}
                />
            </div>
        );
    }
}
