export const getSpecialistLabel = (count: number) => {
    if (count === 1) return 'Specjalista';

    if (
        count % 10 >= 2 &&
        count % 10 <= 4 &&
        !(count % 100 >= 12 && count % 100 <= 14)
    ) {
        return 'Specjaliści';
    }

    return 'Specjalistów';
};