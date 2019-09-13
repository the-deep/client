import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    tooltip: PropTypes.string,
    icon: PropTypes.string,
    noBorder: PropTypes.bool,
};

const defaultProps = {
    noBorder: false,
    icon: '',
    className: '',
    title: '',
    tooltip: '',
};

export default class Badge extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            noBorder,
            title,
            icon,
            tooltip,
        } = this.props;

        return (
            <div
                title={tooltip}
                className={
                    _cs(
                        className,
                        styles.badge,
                        noBorder && styles.noBorder,
                        !isTruthyString(icon) && styles.noIcon,
                    )
                }
            >
                {isTruthyString(icon) &&
                    <Icon name={icon} />
                }
                {isTruthyString(title) &&
                    <div className={styles.title}>
                        {title}
                    </div>
                }
            </div>
        );
    }
}
