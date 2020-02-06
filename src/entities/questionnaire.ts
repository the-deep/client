import {
    FrameworkQuestionElement,
    Matrix2dWidgetElement,
    MiniFrameworkElement,
} from '#typings';

export interface TreeItem {
    key: string;
    parentKey?: string;
    title: string;
}

export const treeItemKeySelector = (item: TreeItem) => item.key;
export const treeItemParentKeySelector = (item: TreeItem) => item.parentKey;
export const treeItemLabelSelector = (item: TreeItem) => item.title;

export function getFrameworkMatrices(framework: MiniFrameworkElement | undefined): TreeItem[] {
    if (!framework) {
        return [];
    }

    const matrix2dWidgets = framework.widgets.filter(
        widget => widget.widgetId === 'matrix2dWidget',
    ) as Matrix2dWidgetElement[];

    const matrices: TreeItem[] = matrix2dWidgets
        .map(widget => [
            {
                key: widget.key,
                title: widget.title || 'Unnamed matrix',
                parentKey: undefined,
            },
            {
                key: `row-${widget.key}`,
                title: 'Row',
                parentKey: widget.key,
            },
            {
                key: `column-${widget.key}`,
                title: 'Column',
                parentKey: widget.key,
            },
        ])
        .flat();

    const dimensions: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.dimensions.map(dimension => ({
                key: dimension.id,
                title: dimension.title || 'Unnamed row',
                parentKey: `row-${widget.key}`,
            }))
        ))
        .flat();

    const subdimensions: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.dimensions.map(dimension => (
                dimension.subdimensions.map(subdimension => ({
                    key: subdimension.id,
                    title: subdimension.title || 'Unnamed sub row',
                    parentKey: dimension.id,
                }))
            )).flat()
        ))
        .flat();

    const sectors: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.sectors.map(sector => ({
                key: sector.id,
                title: sector.title || 'Unnamed column',
                parentKey: `column-${widget.key}`,
            }))
        ))
        .flat();

    const subsectors: TreeItem[] = matrix2dWidgets
        .map(widget => (
            widget.properties.data.sectors.map(dimension => (
                dimension.subsectors.map(subdimension => ({
                    key: subdimension.id,
                    title: subdimension.title || 'Unnamed sub column',
                    parentKey: dimension.id,
                }))
            )).flat()
        ))
        .flat();

    return [
        ...matrices,
        ...dimensions,
        ...sectors,
        ...subdimensions,
        ...subsectors,
    ];
}

export function getFilteredQuestions(questions: FrameworkQuestionElement[], values: string[]) {
    if (values.length <= 0) {
        return questions;
    }

    const filteredQuestions = questions.filter(question => (
        question.frameworkAttribute
        && question.frameworkAttribute.value
        && values.includes(question.frameworkAttribute.value)
    ));
    return filteredQuestions;
}
