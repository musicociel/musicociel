export const withoutEndingSlash = (address: string) => address.replace(/[/]+$/, "");
export const withEndingSlash = (address: string) => address.replace(/[/]*$/, "/");
