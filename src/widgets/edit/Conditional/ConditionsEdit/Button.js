import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import FaramElement from '#rsci/Faram/FaramElement';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import { iconNames } from '#constants';
import ConditionsEditModal from '.';


const propTypes = {
    value: PropTypes.shape({
        list: PropTypes.array,
        operator: PropTypes.oneOf(['AND', 'OR']),
    }).isRequired,
    onChange: PropTypes.func.isRequired,
};


@FaramElement('input')
export default class ConditionsEditButton extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleClick = () => {
        this.setState({
            showModal: true,
        });
    }

    handleCancel = () => {
        this.setState({
            showModal: false,
        });
    }

    handleSave = (value) => {
        this.setState({
            showModal: false,
        }, () => {
            this.props.onChange(value);
        });
    }

    render() {
        const { showModal } = this.state;
        const { value } = this.props;

        return (
            <Fragment>
                <PrimaryButton
                    onClick={this.handleClick}
                    iconName={iconNames.edit}
                >
                    Conditions
                </PrimaryButton>
                {
                    showModal && (
                        <ConditionsEditModal
                            conditions={value}
                            onSave={this.handleSave}
                            onClose={this.handleCancel}
                        />
                    )
                }
            </Fragment>
        );
    }
}
