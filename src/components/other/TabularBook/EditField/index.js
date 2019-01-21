import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '#rsca/Button/AccentButton';
import EditFieldModal from './Modal';

const propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.shape({}).isRequired,
};

const defaultProps = {
    value: {},
};

export default class EditFieldButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
        };
    }

    handleEdit = () => {
        this.setState({ showModal: true });
    }

    handleCancel = () => {
        this.setState({ showModal: false });
    }

    handleChange = (values) => {
        this.setState(
            { showModal: false },
            () => { this.props.onChange(values); },
        );
    }

    render() {
        const {
            value,
            onChange, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const { showModal } = this.state;

        return (
            <React.Fragment>
                <AccentButton
                    {...otherProps}
                    onClick={this.handleEdit}
                />
                {
                    showModal &&
                    <EditFieldModal
                        initialValue={value}
                        onCancel={this.handleCancel}
                        onChange={this.handleChange}
                    />
                }
            </React.Fragment>
        );
    }
}
