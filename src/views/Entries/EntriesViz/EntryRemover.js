import React from 'react';
import PropTypes from 'prop-types';

import DangerButton from '#rsca/Button/DangerButton';

export default class EntryRemover extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string.isRequired,
        disabled: PropTypes.bool.isRequired,
        value: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    };

    handleClick = () => {
        const {
            value: entries,
            onChange,
        } = this.props;

        const randIndex = Math.floor(Math.random() * entries.length);

        // removing a random entry from entries
        onChange([
            ...entries.slice(0, randIndex),
            ...entries.slice(randIndex + 1),
        ]);
    };

    render() {
        const {
            disabled,
            className,
        } = this.props;

        return (
            <span className={className}>
                <DangerButton
                    onClick={this.handleClick}
                    disabled={disabled}
                >
                    Remove random entry
                </DangerButton>
            </span>
        );
    }
}
