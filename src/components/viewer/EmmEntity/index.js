import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';
import Badge from '#components/viewer/Badge';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
};

const defaultProps = {
    className: '',
    name: undefined,
};

export default class EmmEntity extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            name,
            className,
        } = this.props;

        return (
            <Badge
                className={_cs(className, styles.badge)}
                title={name}
            />
        );
    }
}
