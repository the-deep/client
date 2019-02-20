import PropTypes from 'prop-types';
import React from 'react';

import InternalGallery from '#components/viewer/InternalGallery';
import TabularBook from '#components/other/TabularBook';
import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';

import _ts from '#ts';
import _cs from '#cs';
import styles from './styles.scss';

const TAB_TABULAR = 'tabular';
const TAB_ORIGINAL = 'original';

const tabTitles = {
    [TAB_TABULAR]: 'Tabular',
    [TAB_ORIGINAL]: 'Tabular aaaa',
};

export default class Attachment extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = { activeTab: TAB_TABULAR };

        this.views = {
            [TAB_TABULAR]: {
                component: () => {
                    const {
                        tabularBook,
                        projectId,
                    } = this.props;

                    return (
                        <TabularBook
                            bookId={tabularBook}
                            projectId={projectId}
                            isModal={false}
                            viewMode
                        />
                    );
                },
            },
            [TAB_ORIGINAL]: {
                component: () => {
                    const { attachment } = this.props;

                    return (
                        <InternalGallery
                            galleryId={attachment && attachment.id}
                            notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                            showUrl
                        />
                    );
                },
            },
        };
    }

    handleTabClick = (activeTab) => {
        this.setState({ activeTab });
    };

    render() {
        const {
            attachment,
            tabularBook,
            className,
        } = this.props;

        const { activeTab } = this.state;

        if (tabularBook) {
            return (
                <div className={_cs(className, styles.tabsContainer)}>
                    <ScrollTabs
                        tabs={tabTitles}
                        onClick={this.handleTabClick}
                    />
                    <MultiViewContainer
                        views={this.views}
                        active={activeTab}
                    />
                </div>
            );
        }
        return (
            <InternalGallery
                className={className}
                galleryId={attachment && attachment.id}
                notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                showUrl
            />
        );
    }
}

Attachment.propTypes = {
    attachment: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    tabularBook: PropTypes.number,
    projectId: PropTypes.number,
    className: PropTypes.string,
};

Attachment.defaultProps = {
    tabularBook: undefined,
    projectId: undefined,
    className: '',
};
