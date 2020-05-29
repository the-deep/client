import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import { FaramOutputElement } from '@togglecorp/faram';

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

function TextListWidget({ className }) {
    return (
        <div className={_cs(className, styles.textOutput)} >
            <div className={styles.text}>
                <Text faramElementName="value" />
            </div>
        </div>
    );
}

TextListWidget.propTypes = {
    className: PropTypes.string,
};

TextListWidget.defaultProps = {
    className: undefined,
};


export default TextListWidget;
