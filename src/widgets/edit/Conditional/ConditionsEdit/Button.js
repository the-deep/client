import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { FaramInputElement } from '@togglecorp/faram';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import _ts from '#ts';

import ConditionsEditModal from '.';

const propTypes = {
    widgetTitle: PropTypes.string.isRequired,
    value: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        list: PropTypes.array,
        operator: PropTypes.oneOf(['AND', 'OR', 'XOR']),
    }).isRequired,
    onChange: PropTypes.func.isRequired,
};

@FaramInputElement
export default class ConditionsEditButton extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleClick = () => {
        this.setState({ showModal: true });
    }

    handleCancel = () => {
        this.setState({ showModal: false });
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
        const {
            value,
            widgetTitle,
        } = this.props;

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
                            widgetTitle={widgetTitle}
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
