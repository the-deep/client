import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    Button,
    Header,
    useBooleanState,
} from '@the-deep/deep-ui';
import { IoMenuOutline } from 'react-icons/io5';

import {
    AnalysisReportHeadingConfigurationVariantEnum,
} from '#generated/types';

import {
    ReportContainerType,
} from '../schema';
import styles from './styles.css';

const variantToStyleMapping = {
    H1: styles.headingOne,
    H2: styles.headingTwo,
    H3: styles.headingThree,
    H4: styles.headingFour,
} as const;

interface TocItemProps {
    label: string | undefined;
    variant: AnalysisReportHeadingConfigurationVariantEnum | undefined;
}

function TocItem(props: TocItemProps) {
    const {
        label,
        variant,
    } = props;

    return (
        <div
            className={_cs(
                styles.tocItem,
                variant && variantToStyleMapping[variant],
            )}
        >
            {label}
        </div>
    );
}

const containerKeySelector = (item: ReportContainerType) => item.clientId;

interface Props {
    className?: string;
    title?: string;
    data: ReportContainerType[] | undefined;
}

function Toc(props: Props) {
    const {
        className,
        title,
        data,
    } = props;

    const tocRendererParams = useCallback((_: string, item: ReportContainerType) => ({
        label: item.contentConfiguration?.heading?.content,
        variant: item.contentConfiguration?.heading?.variant,
    }), []);

    const [isNavShown, , , , toggleNavVisibility] = useBooleanState(false);

    return (
        <div className={_cs(styles.toc, className)}>
            <Header
                className={styles.header}
                headingSectionClassName={styles.headingSection}
                icons={(
                    <Button
                        className={_cs(
                            styles.menu,
                        )}
                        name="toggle"
                        variant="transparent"
                        onClick={toggleNavVisibility}
                    >
                        <IoMenuOutline className={styles.icon} />
                    </Button>
                )}
                heading={title ?? 'Table of Contents'}
                headingSize="medium"
            />
            <ListView
                className={_cs(
                    styles.list,
                    isNavShown && styles.navShown,
                )}
                keySelector={containerKeySelector}
                renderer={TocItem}
                rendererParams={tocRendererParams}
                data={data}
                filtered={false}
                pending={false}
                errored={false}
            />
        </div>
    );
}

export default Toc;
