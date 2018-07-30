import React from 'react';
import PropTypes from 'prop-types';

import Numeral from '#rscv/Numeral';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    data: {},
};

export default class NumberListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            data: {
                value,
            },
            className,
        } = this.props;

        const separatorText = ' ';
        const invalidText = '-';

        return (
            <div className={className} >
                <Numeral
                    separator={separatorText}
                    invalidText={invalidText}
                    showThousandSeparator
                    precision={null}
                    value={value}
                />
            </div>
        );
    }
}
