import React, { useCallback } from 'react';
import { BiDownload } from 'react-icons/bi';
import html2canvas from 'html2canvas';
import { Modal, ButtonLikeLink, Button, Container, Heading, useModalState } from '@the-deep/deep-ui';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import Section from '#components/entry/Section';

import { type Framework } from '..';

import styles from './styles.css';
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const emptyObject = {};

interface Props {
    title?: string;
    className?: string;
    exportLink: string | undefined;
    onModalClose: () => void;
    framework: Framework | undefined;
}
function ExportModal(props: Props) {
    const {
        title,
        onModalClose,
        className,
        exportLink,
        framework,
    } = props;

    const [
        pngExport,
        showPngExport,
    ] = useModalState(false);

    const handleExportButtonClick = useCallback(() => {
        const sectionsContainer = document.querySelector('#section') as HTMLElement;
        if (isNotDefined(sectionsContainer)) {
            return;
        }
        html2canvas(sectionsContainer).then((canvas) => {
            const sectionPng = document.createElement('a');
            sectionPng.href = canvas.toDataURL('image/png');
            sectionPng.download = `${title}.png`;
            sectionPng.click();
        });
    }, [title]);

    return (
        <Modal
            className={className}
            heading={pngExport ? 'Preview' : 'Export'}
            size={pngExport ? 'cover' : 'free'}
            onCloseButtonClick={onModalClose}
        >
            {!pngExport ? (
                <div className={styles.exportOption}>
                    {isDefined(exportLink) && (
                        <ButtonLikeLink
                            to={exportLink}
                            variant="tertiary"
                            className={styles.exportButtons}
                            childrenContainerClassName={styles.exportButtonsChildren}
                            title="Export framework in CSV format"
                        >
                            <BiDownload />
                            csv
                        </ButtonLikeLink>
                    )}
                    <Button
                        name=""
                        onClick={showPngExport}
                        variant="tertiary"
                        className={styles.exportButtons}
                        childrenContainerClassName={styles.exportButtonsChildren}
                        title="Export framework image"
                    >
                        <BiDownload />
                        IMAGE
                    </Button>
                </div>
            ) : (
                <Container
                    className={styles.pngExportModal}
                    footerActions={(
                        <Button
                            name={undefined}
                            onClick={handleExportButtonClick}
                        >
                            Export
                        </Button>
                    )}
                >
                    <div
                        id="section"
                    >
                        {framework?.primaryTagging && framework.primaryTagging.length > 0 && (
                            <>
                                <Heading
                                    size="extraSmall"
                                    className={styles.heading}
                                >
                                    Primary Tagging
                                </Heading>
                                {framework?.primaryTagging?.map((section) => (
                                    <React.Fragment
                                        key={section.clientId}
                                    >
                                        <div className={styles.sectionTitle}>
                                            {section.title}
                                        </div>
                                        <Section
                                            allWidgets={undefined}
                                            widgets={section.widgets}
                                            onAttributeChange={noop}
                                            attributesMap={emptyObject}
                                            error={undefined}
                                            readOnly
                                            onGeoAreaOptionsChange={noop}
                                            geoAreaOptions={undefined}
                                            disabled
                                        />
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                        {framework?.secondaryTagging && framework?.secondaryTagging?.length > 0 && (
                            <>
                                <Heading
                                    size="extraSmall"
                                    className={styles.heading}
                                >
                                    Secondary Tagging
                                </Heading>
                                <Section
                                    allWidgets={undefined}
                                    widgets={framework?.secondaryTagging}
                                    onAttributeChange={noop}
                                    attributesMap={emptyObject}
                                    error={undefined}
                                    onGeoAreaOptionsChange={noop}
                                    geoAreaOptions={undefined}
                                    disabled
                                />
                            </>
                        )}
                    </div>
                </Container>
            )}
        </Modal>
    );
}

export default ExportModal;
