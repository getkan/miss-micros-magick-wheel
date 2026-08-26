export interface WheelEntry {
    id: string;
    title: string;
    recommender: string;
    /** Number of slices this recommendation occupies on the wheel. */
    weight: number;
}
