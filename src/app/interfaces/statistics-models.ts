export class SummaryStatsContainer {
    ordersCount: number;
    itemsCount: number;
    avgTime: number;
}

export class StatisticsBarModel {
    name: string;
    value: number;
    tooltipValues: string[];
}

export class StatisticsLineModel {
    label: string;
    values: StatisticsLineValueModel[];
}

export class StatisticsLineValueModel {
    value: number;
    tooltipValue: string;
}
