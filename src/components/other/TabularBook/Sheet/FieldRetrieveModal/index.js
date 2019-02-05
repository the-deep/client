import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListSelection from '#rsci/ListSelection';
import FloatingContainer from '#rscv/FloatingContainer';
import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '#rsu/bounds';

import _ts from '#ts';
import styles from './styles.scss';

export default class FieldRetrieveModal extends React.PureComponent {
    static propTypes = {
        closeModal: PropTypes.func,
        // eslint-disable-next-line react/forbid-prop-types
        fields: PropTypes.array.isRequired,
        disabled: PropTypes.bool,
        onFieldRetrieve: PropTypes.func.isRequired,
    };

    static defaultProps = {
        closeModal: () => {},
        disabled: false,
    }

    static labelSelector = s => s.title;

    static keySelector = s => s.id;

    constructor(props) {
        super(props);

        this.state = {
            selectedFields: [],
        };
    }

    handleSelection = (value) => {
        this.setState({ selectedFields: value });
    }

    handleRetrieveClick = () => {
        const {
            onFieldRetrieve,
            closeModal,
        } = this.props;
        const { selectedFields } = this.state;

        onFieldRetrieve(selectedFields);
        closeModal();
    }

    handleInvalidate = (container) => {
        // Note: pass through prop
        // eslint-disable-next-line react/prop-types
        const { parentBCR } = this.props;

        const contentRect = container.getBoundingClientRect();

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect: parentBCR,
                contentRect,
                defaultOffset,
                limit: {
                    ...defaultLimit,
                    minW: 240,
                    maxW: 360,
                },
            })
        );

        return optionsContainerPosition;
    }

    render() {
        const {
            closeModal,
            fields,
            disabled,
        } = this.props;

        const { selectedFields } = this.state;

        return (
            <FloatingContainer
                className={styles.container}
                onInvalidate={this.handleInvalidate}
                focusTrap
            >
                <ListSelection
                    label={_ts('tabular.fieldRetrieveModal', 'fieldsLabel')} // Fields to retrieve
                    disabled={disabled}
                    labelSelector={FieldRetrieveModal.labelSelector}
                    keySelector={FieldRetrieveModal.keySelector}
                    options={fields}
                    value={this.state.selectedFields}
                    onChange={this.handleSelection}

                />
                <div className={styles.actionButtons}>
                    <Button onClick={closeModal}>
                        {_ts('tabular.fieldEditModal', 'cancelFieldButtonLabel')}
                    </Button>
                    <PrimaryButton
                        disabled={disabled || selectedFields.length <= 0}
                        onClick={this.handleRetrieveClick}
                    >
                        {_ts('tabular.fieldRetrieveModal', 'retrieveFieldButtonLabel') /* Retrieve */ }
                    </PrimaryButton>
                </div>
            </FloatingContainer>
        );
    }
}
