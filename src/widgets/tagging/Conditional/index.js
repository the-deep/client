import React from 'react';
// import PropTypes from 'prop-types';

import NumberInput from '#rsci/NumberInput';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class ConditionalWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const separatorText = ' ';

        return (
            <div className={styles.numberWidget}>
                <NumberInput
                    faramElementName="value"
                    placeholder={_ts('widgets.tagging.number', 'numberPlaceholder')}
                    separator={separatorText}
                    showLabel={false}
                    showHintAndError={false}
                    // NOTE: example ussage of faramInfo
                    // faramInfo={{
                    //     action: 'changeExcerpt',
                    //     type: 'excerpt',
                    //     value: 'This excerpt was changed as a side effect.',
                    // }}
                />
            </div>
        );
    }
}
