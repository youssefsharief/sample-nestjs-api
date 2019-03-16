export const clearUnneededDataFromPayload = (item: { password: string | undefined }) => {
    item.password = undefined;
    return item;
};
