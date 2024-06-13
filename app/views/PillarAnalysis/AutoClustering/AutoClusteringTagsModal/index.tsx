import React from 'react';
import {
    Modal,
    Button,
} from '@the-deep/deep-ui';

import TagInput from '#components/TagInput';

interface Props {
    onClose: () => void;
    widgetTags: string[];
    setWidgetTags: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    handleAutoClusteringTriggerClick: () => void;
}

function AutoClusteringTagsModal(props: Props) {
    const {
        onClose,
        widgetTags,
        setWidgetTags,
        handleAutoClusteringTriggerClick,
    } = props;

    return (
        <Modal
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleAutoClusteringTriggerClick}
                >
                    Auto Cluster
                </Button>
            )}
            heading="Auto Clustering Confirmation"
            onCloseButtonClick={onClose}
        >

            Are you sure you want to trigger auto clustering of entries
            into new stories? This will replace current analytical statements
            with suggested groupings using NLP.
            Entries from confidential sources are filtered out to maintain document privacy.
            <TagInput
                name="tags"
                label=""
                value={widgetTags}
                onChange={setWidgetTags}
            />
        </Modal>
    );
}

export default AutoClusteringTagsModal;
