import React from 'react';
import PropTypes from 'prop-types';

import SelectInputWithList from '#rs/components/Input/SelectInputWithList';
// import _ts from '#ts';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class MultiselectWidget extends React.PureComponent {
    static valueKeyExtractor = d => d.key;

    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            widget: {
                properties: {
                    data: {
                        options,
                    },
                },
            },
        } = this.props;
        return (
            <div>
                <SelectInputWithList
                    faramElementName="value"
                    showLabel={false}
                    hideClearButton
                    options={options}
                />
            </div>
        );
    }
}
