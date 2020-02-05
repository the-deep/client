import React from 'react';
import PropTypes from 'prop-types';

import FormattedTextArea from '#rsci/FormattedTextArea';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    showFormatButton: PropTypes.bool,
};

const defaultProps = {
    showFormatButton: true,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class TextWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { showFormatButton } = this.props;

        return (
            <div className={styles.text}>
                <FormattedTextArea
                    className={styles.text}
                    faramElementName="value"
                    placeholder={_ts('widgets.tagging.text', 'textPlaceholder')}
                    showLabel={false}
                    showFormatButton={showFormatButton}
                />
            </div>
        );
    }
}
