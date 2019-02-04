import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '#rsci/TextInput';
import { DATA_TYPE } from '#entities/tabular';
import _ts from '#ts';

export default class StringFilter extends React.PureComponent {
    static propTypes = {
        disabled: PropTypes.bool,
        // eslint-disable-next-line react/forbid-prop-types
        value: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
    };

    static defaultProps = {
        value: {},
        disabled: false,
        className: '',
    };

    handleFilterChange = (value) => {
        this.props.onChange({
            type: DATA_TYPE.string,
            text: value,
        });
    }

    render() {
        const {
            value = {},
            className,
            disabled,
        } = this.props;
        return (
            <TextInput
                className={className}
                placeholder={_ts('tabular.filter.string', 'searchPlaceholder')}
                disabled={disabled}
                value={value.text}
                onChange={this.handleFilterChange}
                showLabel={false}
                showHintAndError={false}
            />
        );
    }
}
