import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';

import Overview from './Overview';
import List from './List';

import styles from './styles.scss';


const propTypes = {
    activeView: PropTypes.string,
    framework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    activeView: undefined,
    className: '',
    framework: undefined,
};


export default class ProjectAfDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const rendererParams = () => ({
            framework: this.props.framework,
            className: styles.view,
            readOnly: true,
            // hideDetails: true,
        });

        this.views = {
            overview: {
                component: Overview,
                rendererParams,
            },

            list: {
                component: List,
                rendererParams,
            },
        };
    }

    render() {
        const {
            className,
            framework,
            activeView,
        } = this.props;

        // FIXME: only show loading animation if it is actually loading
        if (!framework) {
            return <LoadingAnimation />;
        }

        return (
            <div className={_cs(className, styles.preview)}>
                <MultiViewContainer
                    views={this.views}
                    active={activeView}
                />
            </div>
        );
    }
}
