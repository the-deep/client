import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import FaramList from '#rsci/Faram/FaramList';
import ListView from '#rscv/List/ListView';
import ModalBody from '#rscv/Modal/Body';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ModalFooter from '#rscv/Modal/Footer';
import { randomString } from '#rsu/common';

import {
    afIdFromRoute,

    afViewAnalysisFrameworkSelector,
} from '#redux';

import WidgetPreview from '../WidgetPreview';
import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: afViewAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: afIdFromRoute(state, props),
});

@connect(mapStateToProps)
export default class ConditionsEditModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = widget => widget.key;

    constructor(props) {
        super(props);

        this.state = {};
    }

    widgetListRendererParams = (key, widget) => {
        const {
            widgetId,
            title,
        } = widget;

        return ({
            title,
            faramInfoForAdd: {
                newElement: () => ({
                    key: `${widgetId}-${randomString(16)}`,
                }),
            },
        });
    }

    render() {
        const {
            analysisFramework: { widgets = [] },
            analysisFrameworkId,
        } = this.props;

        return (
            <Modal className={styles.conditionEditModal} >
                {/* FIXME: Use strings */}
                <ModalHeader
                    title="Conditions Edit"
                />
                <ModalBody className={styles.modalBody} >
                    <div className={styles.leftContainer}>
                        <ListView
                            className={styles.widgetList}
                            data={widgets}
                            renderer={WidgetPreview}
                            keyExtractor={ConditionsEditModal.keyExtractor}
                            rendererParams={this.widgetListRendererParams}
                        />
                    </div>
                    <div className={styles.rightContainer}>
                        Right
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
