import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import update from 'immutability-helper';

import WarningButton from '#rs/components/Action/Button/WarningButton';

import { iconNames } from '#constants';

const propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    renderer: PropTypes.func.isRequired,
};

export default class EditButton extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleEditClick = () => {
        this.setState({
            showModal: true,
        });
    }

    handleCancel = () => {
        this.setState({
            showModal: false,
        });
    }

    handleSave = (data, title) => {
        const { widget } = this.props;
        const { title: originalTitle } = widget;

        const settings = {
            title: { $set: title || originalTitle },
            properties: {
                data: { $set: data },
            },
        };

        const newWidget = update(widget, settings);

        this.props.onChange(newWidget);

        this.setState({
            showModal: false,
        });
    }

    render() {
        const {
            renderer: Widget,
            widget,
        } = this.props;
        const { showModal } = this.state;

        return (
            <Fragment>
                <WarningButton
                    iconName={iconNames.edit}
                    // FIXME: use strings
                    title="Edit widget"
                    tabIndex="-1"
                    transparent
                    onClick={this.handleEditClick}
                />
                {
                    showModal &&
                    <Widget
                        title={widget.title}
                        data={widget.properties.data}
                        onSave={this.handleSave}
                        onClose={this.handleCancel}
                    />
                }
            </Fragment>
        );
    }
}

