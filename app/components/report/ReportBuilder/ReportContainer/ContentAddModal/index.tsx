import React from 'react';
import { isNotDefined, _cs } from '@togglecorp/fujs';
import {
    Modal,
    Message,
    RawButton,
} from '@the-deep/deep-ui';
import {
    IoText,
    IoLinkOutline,
    IoCalendarOutline,
    IoKeyOutline,
    IoTrendingUp,
    IoMapOutline,
    IoBarChartOutline,
    IoImageOutline,
} from 'react-icons/io5';
import { FaHeading } from 'react-icons/fa';

import {
    AnalysisReportContainerContentTypeEnum,
} from '#generated/types';

import styles from './styles.css';

interface Props {
    onCloseButtonClick: () => void;
    onSelect: (contentType: AnalysisReportContainerContentTypeEnum) => void;
    reportId: string | undefined;
}

function ContentAddModal(props: Props) {
    const {
        onCloseButtonClick,
        reportId,
        onSelect,
    } = props;

    return (
        <Modal
            className={styles.contentAddModal}
            heading="Add content"
            bodyClassName={styles.modalBody}
            onCloseButtonClick={onCloseButtonClick}
            freeHeight
        >
            {isNotDefined(reportId) && (
                <Message
                    message="You need to first save your report to enable addition of charts and maps."
                />
            )}
            <div className={styles.content}>
                <RawButton
                    name="HEADING"
                    onClick={onSelect}
                    className={styles.button}
                >
                    <FaHeading className={styles.icon} />
                    Heading
                </RawButton>
                <RawButton
                    name="TEXT"
                    onClick={onSelect}
                    className={styles.button}
                >
                    <IoText className={styles.icon} />
                    Text
                </RawButton>
                <RawButton
                    name="IMAGE"
                    onClick={isNotDefined(reportId) ? undefined : onSelect}
                    className={_cs(styles.button, isNotDefined(reportId) && styles.disabled)}
                    title={isNotDefined(reportId) ? 'Image can be added only after the report is saved' : undefined}
                    disabled={isNotDefined(reportId)}
                >
                    <IoImageOutline className={styles.icon} />
                    Image
                </RawButton>
                <RawButton
                    name="URL"
                    onClick={onSelect}
                    className={styles.button}
                >
                    <IoLinkOutline className={styles.icon} />
                    URL
                </RawButton>
                <RawButton
                    name="TIMELINE_CHART"
                    onClick={onSelect}
                    className={_cs(styles.button, isNotDefined(reportId) && styles.disabled)}
                    title={isNotDefined(reportId) ? 'Charts can be added only after the report is saved' : undefined}
                    disabled={isNotDefined(reportId)}
                >
                    <IoCalendarOutline className={styles.icon} />
                    Timeline Chart
                </RawButton>
                <RawButton
                    name="KPI"
                    onClick={onSelect}
                    className={styles.button}
                >
                    <IoKeyOutline className={styles.icon} />
                    KPIs
                </RawButton>
                <RawButton
                    name="BAR_CHART"
                    onClick={onSelect}
                    className={_cs(styles.button, isNotDefined(reportId) && styles.disabled)}
                    title={isNotDefined(reportId) ? 'Charts can be added only after the report is saved' : undefined}
                    disabled={isNotDefined(reportId)}
                >
                    <IoBarChartOutline className={styles.icon} />
                    Bar Chart
                </RawButton>
                <RawButton
                    name="LINE_CHART"
                    onClick={onSelect}
                    className={_cs(styles.button, isNotDefined(reportId) && styles.disabled)}
                    title={isNotDefined(reportId) ? 'Charts can be added only after the report is saved' : undefined}
                    disabled={isNotDefined(reportId)}
                >
                    <IoTrendingUp className={styles.icon} />
                    Line Chart
                </RawButton>
                <RawButton
                    name="MAP"
                    onClick={onSelect}
                    className={_cs(styles.button, isNotDefined(reportId) && styles.disabled)}
                    title={isNotDefined(reportId) ? 'Charts can be added only after the report is saved' : undefined}
                    disabled={isNotDefined(reportId)}
                >
                    <IoMapOutline className={styles.icon} />
                    Map
                </RawButton>
            </div>
        </Modal>
    );
}

export default ContentAddModal;
