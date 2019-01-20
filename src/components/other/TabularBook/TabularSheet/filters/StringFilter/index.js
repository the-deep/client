import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '#rsci/TextInput';

export default class StringFilter extends React.PureComponent {
    static propTypes = {
        disabled: PropTypes.bool,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
    };

    static defaultProps = {
        value: '',
        disabled: false,
        className: '',
    };

    handleFilterChange = (value) => {
        this.props.onChange(value);
    }

    render() {
        const {
            value,
            className,
            disabled,
        } = this.props;
        return (
            <TextInput
                className={className}
                placeholder="Search"
                disabled={disabled}
                value={value}
                onChange={this.handleFilterChange}
                showLabel={false}
                showHintAndError={false}
            />
        );
    }
}
