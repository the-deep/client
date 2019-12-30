import React from 'react';
import PropTypes from 'prop-types';
import { FaramOutputElement, _cs } from '@togglecorp/faram';

import styles from './styles.scss';

const NormalText = ({ value, className }) => (
    <div className={className}>
        {value}
    </div>
);
NormalText.propTypes = {
    value: PropTypes.string,
    className: PropTypes.string,
};
NormalText.defaultProps = {
    value: '',
    className: undefined,
};

const Text = FaramOutputElement(NormalText);


const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
};

export default class TextListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.textOutput,
        );

        return (
            <div className={className} >
                <p className={styles.text}>
                    <Text
                        faramElementName="value"
                    />
                </p>
            </div>
        );
    }
}
