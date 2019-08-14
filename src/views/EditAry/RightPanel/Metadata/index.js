import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaramGroup } from '@togglecorp/faram';

import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    aryTemplateMetadataSelector,
    assessmentSourcesSelector,
} from '#redux';

import { renderWidget } from '../widgetUtils';
import Header from '../Header';
import StakeholderModal from './StakeholderModal';
import styles from './styles.scss';

const StakeholderButton = props => (
    <AccentButton
        iconName="people"
        transparent
        {...props}
    />
);
const ModalButton = modalize(StakeholderButton);


const propTypes = {
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    sources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    aryTemplateMetadata: [],
    pending: false,
};

const mapStateToProps = state => ({
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
    sources: assessmentSourcesSelector(state),
});

@connect(mapStateToProps)
export default class Metadata extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderWidget = (k, data) => renderWidget(k, data, this.props.sources);

    renderReadonlyWidget = (k, data) => renderWidget(
        k,
        data,
        this.props.sources, { readOnly: true },
    );

    renderMetadata = (k, data) => {
        const {
            fields,
            id,
            title,
        } = data;

        const isStakeholderColumn = title.toLowerCase() === 'stakeholders';

        const fieldValues = Object.values(fields);
        return (
            <div
                key={id}
                className={styles.widgetGroup}
            >
                <h4 className={styles.heading}>
                    {title}
                    {isStakeholderColumn &&
                        <ModalButton
                            className={styles.showMoreButton}
                            modal={
                                <StakeholderModal
                                    fields={fieldValues}
                                    sources={this.props.sources}
                                />
                            }
                        />
                    }
                </h4>
                <ListView
                    className={styles.content}
                    data={fieldValues}
                    modifier={
                        isStakeholderColumn
                            ? this.renderReadonlyWidget
                            : this.renderWidget
                    }
                />
            </div>
        );
    }

    render() {
        const {
            aryTemplateMetadata: metadataGroups,
            pending,
        } = this.props;

        // FIXME: use memoize
        const metadataGroupValues = Object.values(metadataGroups);

        return (
            <div className={styles.metadata}>
                {pending && <LoadingAnimation />}
                <FaramGroup faramElementName="metadata">
                    <FaramGroup faramElementName="basicInformation">
                        <div className={styles.basicInformation}>
                            <Header className={styles.header} />
                            <ListView
                                className={styles.content}
                                data={metadataGroupValues}
                                modifier={this.renderMetadata}
                            />
                        </div>
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }
}
