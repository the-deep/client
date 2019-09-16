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
    keyword: PropTypes.string,
    riskFactor: PropTypes.string,
    count: PropTypes.number,
};

const defaultProps = {
    className: '',
    riskFactor: undefined,
    keyword: undefined,
    count: 1,
};

export default class EmmTrigger extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            keyword,
            riskFactor,
            count,
            className,
        } = this.props;

        const title = isTruthyString(riskFactor)
            ? `${riskFactor}: ${keyword} | ${count}`
            : `${keyword} | ${count}`;

        return (
            <Badge
                className={_cs(className, styles.badge)}
                title={title}
            />
        );
    }
}
