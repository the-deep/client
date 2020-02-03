import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    label: undefined,
};

export default class LabelHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            label,
        } = this.props;

        return (
            <th
                className={_cs(className, styles.labelHeader)}
            >
                {label}
            </th>
        );
    }
}
