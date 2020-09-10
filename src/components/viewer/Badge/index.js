import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import Tooltip from '#rscv/Tooltip';
import Icon from '#rscg/Icon';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    titleClassName: PropTypes.string,
    tooltip: PropTypes.node,
    icon: PropTypes.string,
    iconClassName: PropTypes.string,
    noBorder: PropTypes.bool,
    iconStyle: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    noBorder: false,
    icon: '',
    className: undefined,
    titleClassName: undefined,
    iconClassName: '',
    iconStyle: undefined,
    title: '',
    tooltip: undefined,
};

export default class Badge extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            titleClassName,
            noBorder,
            title,
            icon,
            iconClassName,
            iconStyle,
            tooltip,
        } = this.props;

        return (
            <Tooltip tooltip={tooltip} >
                <div
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
                        <div className={_cs(styles.title, titleClassName)}>
                            {title}
                        </div>
                    }
                </div>
            </Tooltip>
        );
    }
}
