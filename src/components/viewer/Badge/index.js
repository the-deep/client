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
    iconClassName: PropTypes.string,
    noBorder: PropTypes.bool,
    iconStyle: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    noBorder: false,
    icon: '',
    className: '',
    iconClassName: '',
    iconStyle: undefined,
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
            iconClassName,
            iconStyle,
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
                    <Icon
                        name={icon}
                        style={iconStyle}
                        className={iconClassName}
                    />
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
