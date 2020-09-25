import PropTypes from 'prop-types';
import React, { useState, useMemo, useCallback } from 'react';

import InternalGallery from '#components/viewer/InternalGallery';
import TabularBook from '#components/other/TabularBook';
import MultiViewContainer from '#rscv/MultiViewContainer';
import AccentButton from '#rsca/Button/AccentButton';
import ScrollTabs from '#rscv/ScrollTabs';

import _ts from '#ts';
import _cs from '#cs';
import styles from './styles.scss';

// FIXME: use is LeadPaneType spreadsheet
const tabularCompatibleFileTypes = [
    'xls',
    'xlsx',
    // 'xlsx2',
    'csv',
    'ods',
];

const isTabularCompatible = (fileType) => {
    if (!fileType) {
        return false;
    }

    return tabularCompatibleFileTypes.some(m => m === fileType);
};

const TAB_TABULAR = 'tabular';
const TAB_ORIGINAL = 'original';

function TabularTabs(props) {
    const {
        className,

        tabularBook,
        projectId,
        onTabularButtonClick,
        tabularBookExtractionDisabled,

        ...otherProps
    } = props;

    const tabTitles = useMemo(
        () => (tabularBook ? {
            [TAB_ORIGINAL]: _ts('viewer.attachment', 'originalTabTitle'),
            [TAB_TABULAR]: _ts('viewer.attachment', 'tabularTabTitle'),
        } : {
            [TAB_ORIGINAL]: _ts('viewer.attachment', 'originalTabTitle'),
        }),
        [tabularBook],
    );

    const [activeTab, setActiveTab] = useState(TAB_ORIGINAL);

    const views = {
        [TAB_TABULAR]: {
            component: TabularBook,
            // TODO: handle if tabularBook is null
            rendererParams: () => ({
                bookId: tabularBook,
                projectId,
                isModal: false,
                viewMode: true,
            }),
        },
        [TAB_ORIGINAL]: {
            component: InternalGallery,
            rendererParams: () => ({
                ...otherProps,
                // galleryId={galleryId}
                // showUrl
                className: styles.gallery,
                notFoundMessage: _ts('addLeads', 'leadFileNotFound'),
            }),
        },
    };

    return (
        <div className={_cs(className, styles.tabsContainer)}>
            <ScrollTabs
                className={styles.tabs}
                tabs={tabTitles}
                active={activeTab}
                onClick={setActiveTab}
            >
                {!tabularBookExtractionDisabled && (
                    <AccentButton
                        className={styles.tabularButton}
                        onClick={onTabularButtonClick}
                    >
                        {tabularBook ?
                            _ts('addLeads', 'tabularButtonTitle') :
                            _ts('addLeads', 'extractTabularButtonTitle')
                        }
                    </AccentButton>
                )}
            </ScrollTabs>
            <MultiViewContainer
                views={views}
                active={activeTab}
            />
        </div>
    );
}
TabularTabs.propTypes = {
    className: PropTypes.string,
    tabularBook: PropTypes.number,
    projectId: PropTypes.number,
    onTabularButtonClick: PropTypes.func.isRequired,
    tabularBookExtractionDisabled: PropTypes.bool,
};
TabularTabs.defaultProps = {
    className: undefined,
    tabularBook: undefined,
    projectId: undefined,
    tabularBookExtractionDisabled: false,
};

function InternalGalleryWithTabular(props) {
    const {
        tabularBook,
        projectId,
        onTabularButtonClick,
        tabularBookExtractionDisabled,

        ...otherProps
    } = props;

    const [response, setResponse] = useState({});

    const handleAttachmentMimeTypeGet = useCallback(
        (res) => {
            const { title = '' } = res;
            // FIXME: move this to common utils
            const fileType = title.toLowerCase().match(/(?:\.([^.]+))?$/)[1];

            const newResponse = {
                ...res,
                fileType,
            };
            setResponse(newResponse);
        },
        [],
    );

    const handleTabularButtonClick = useCallback(
        () => {
            if (onTabularButtonClick) {
                onTabularButtonClick(response);
            }
        },
        [onTabularButtonClick, response],
    );

    const isAlreadyExtracted = !!tabularBook;
    const isExtractable = !tabularBookExtractionDisabled && isTabularCompatible(response.fileType);

    if (!isAlreadyExtracted && !isExtractable) {
        return (
            <InternalGallery
                {...otherProps}
                // className={className}
                // galleryId={galleryId}
                // showUrl
                notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                onMimeTypeGet={handleAttachmentMimeTypeGet}
            />
        );
    }
    return (
        <TabularTabs
            {...otherProps}
            tabularBook={tabularBook}
            tabularBookExtractionDisabled={tabularBookExtractionDisabled}
            projectId={projectId}
            onMimeTypeGet={handleAttachmentMimeTypeGet}
            onTabularButtonClick={handleTabularButtonClick}
        />
    );
}
InternalGalleryWithTabular.propTypes = {
    tabularBook: PropTypes.number,
    projectId: PropTypes.number,
    onTabularButtonClick: PropTypes.func,
    tabularBookExtractionDisabled: PropTypes.bool,
};
InternalGalleryWithTabular.defaultProps = {
    tabularBook: undefined,
    projectId: undefined,
    tabularBookExtractionDisabled: true,
    onTabularButtonClick: undefined,
};

export default InternalGalleryWithTabular;
