import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaramGroup } from '@togglecorp/faram';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    aryTemplateMetadataSelector,
    assessmentSourcesSelector,
    isStakeholderColumn,
} from '#redux';

import Column from './Column';
import Header from '../Header';
import styles from './styles.scss';

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

    static columnKeySelector = data => data.id;

    getMetadataGroupList = memoize(metadataGroups => Object.values(metadataGroups))

    columnRendererParams = (key, data) => {
        const {
            title,
            fields,
        } = data;
        const {
            sources,
        } = this.props;

        return {
            title,
            fields,
            sources,
            isStakeholder: isStakeholderColumn(data),
        };
    }

    render() {
        const {
            aryTemplateMetadata: metadataGroups,
            pending,
        } = this.props;

        const metadataGroupValues = this.getMetadataGroupList(metadataGroups);

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
                                keySelector={Metadata.columnKeySelector}
                                renderer={Column}
                                rendererParams={this.columnRendererParams}
                            />
                        </div>
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }
}
