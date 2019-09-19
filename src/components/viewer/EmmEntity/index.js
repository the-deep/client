import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Badge from '#components/viewer/Badge';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
    count: PropTypes.number,
};

const defaultProps = {
    className: '',
    name: undefined,
    count: undefined,
};

export default class EmmEntity extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            name,
            count,
            className,
        } = this.props;

        const title = isDefined(count) ? `${name} (${count})` : name;

        return (
            <Badge
                className={_cs(className, styles.badge)}
                title={title}
            />
        );
    }
}
