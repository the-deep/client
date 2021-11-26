import produce from 'immer';
import { isNotDefined } from '@togglecorp/fujs';

import { reorder } from '#utils/common';

import { PartialWidget } from '#components/framework/AttributeInput';

import { Section, Widget } from '../../types';
import { PartialSectionType } from './SectionsEditor';

export interface TempConditional {
    widgetId: string,
    title?: string;
    sectionId: string;
    value: NonNullable<Widget['conditional']> | undefined,
}

export interface TempWidget {
    sectionId: string;
    widget: PartialWidget;
}

export function findWidget(
    sections: Section[] | undefined = [],
    sectionId: string,
    widgetId: string,
): Widget | undefined {
    const selectedSectionIndex = sections.findIndex((s) => s.clientId === sectionId);
    if (selectedSectionIndex === -1) {
        // eslint-disable-next-line no-console
        console.error('The selected section does not exist:', sectionId);
        return undefined;
    }
    const selectedSection = sections[selectedSectionIndex];

    return selectedSection.widgets?.find(
        (w) => w.clientId === widgetId,
    );
}

export function orderWidgets(
    sections: Section[] | undefined = [],
    sectionId: string,
    widgets: Widget[],
): Section[] {
    const selectedSectionIndex = sections.findIndex((s) => s.clientId === sectionId);
    if (selectedSectionIndex === -1) {
        // eslint-disable-next-line no-console
        console.error('The selected section does not exist:', sectionId);
        return sections;
    }

    return produce(sections, (safeSections) => {
        const selectedSection = safeSections[selectedSectionIndex];
        selectedSection.widgets = reorder(widgets);
    });
}

export function injectWidget(
    sections: Section[] | undefined,
    sectionId: string,
    widget: Widget,
): Section[];
export function injectWidget(
    sections: PartialSectionType[] | undefined,
    sectionId: string,
    widget: PartialWidget,
): PartialSectionType[];
export function injectWidget(
    sections: PartialSectionType[] | undefined = [],
    sectionId: string,
    widget: PartialWidget,
) {
    const selectedSectionIndex = sections.findIndex((s) => s.clientId === sectionId);
    if (selectedSectionIndex === -1) {
        // eslint-disable-next-line no-console
        console.error('The selected section does not exist:', sectionId);
        return sections;
    }

    return produce(sections, (safeSections) => {
        const selectedSection = safeSections[selectedSectionIndex];

        if (!selectedSection.widgets) {
            selectedSection.widgets = [];
        }

        const widgetIndex = selectedSection.widgets.findIndex(
            (w) => w.clientId === widget.clientId,
        );

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            const orderList = selectedSection.widgets.map((w) => w.order);
            Math.max(...orderList, 0);

            selectedSection.widgets.push({
                ...widget,
                order: selectedSection.widgets.length,
            });
        } else {
            selectedSection.widgets.splice(widgetIndex, 1, widget);
        }
    });
}

export function deleteWidget(
    sections: Section[] | undefined = [],
    sectionId: string,
    widgetId: string,
): Section[] {
    const selectedSectionIndex = sections.findIndex((s) => s.clientId === sectionId);
    if (selectedSectionIndex === -1) {
        // eslint-disable-next-line no-console
        console.error('The selected section does not exist:', sectionId);
        return sections;
    }

    return produce(sections, (safeSections) => {
        const selectedSection = safeSections[selectedSectionIndex];

        if (!selectedSection.widgets) {
            return;
        }

        const widgetIndex = selectedSection.widgets.findIndex(
            (w) => w.clientId === widgetId,
        );

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            return;
        }

        selectedSection.widgets.splice(widgetIndex, 1);
    });
}

export function injectWidgetConditional(
    sections: Section[] | undefined = [],
    conditional: TempConditional,
) {
    const selectedSectionIndex = sections.findIndex((s) => s.clientId === conditional.sectionId);
    if (selectedSectionIndex === -1) {
        // eslint-disable-next-line no-console
        console.error('The selected section does not exist:', conditional.sectionId);
        return sections;
    }

    return produce(sections, (safeSections) => {
        const selectedSection = safeSections[selectedSectionIndex];

        if (!selectedSection.widgets) {
            return;
        }

        const widgetIndex = selectedSection.widgets.findIndex(
            (w) => w.clientId === conditional.widgetId,
        );

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            return;
        }

        selectedSection.widgets[widgetIndex].conditional = conditional.value;
    });
}
