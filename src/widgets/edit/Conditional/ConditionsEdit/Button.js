import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import { FaramInputElement } from '#rscg/FaramElements';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import _ts from '#ts';

import ConditionsEditModal from '.';

const propTypes = {
    value: PropTypes.shape({
        list: PropTypes.array,
        operator: PropTypes.oneOf(['AND', 'OR']),
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onModalVisibilityChange: PropTypes.func,
};

const defaultProps = {
    onModalVisibilityChange: () => {},
};

@FaramInputElement
export default class ConditionsEditButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleClick = () => {
        this.setState({
            showModal: true,
        }, () => this.props.onModalVisibilityChange(true));
    }

    handleCancel = () => {
        this.setState({
            showModal: false,
        }, () => this.props.onModalVisibilityChange(false));
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

        const editConditionsLabel = _ts('widgets.editor.conditional', 'editConditionsLabel');

        return (
            <Fragment>
                <PrimaryButton
                    title={editConditionsLabel}
                    tabIndex="-1"
                    transparent
                    onClick={this.handleClick}
                >
                    {editConditionsLabel}
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
