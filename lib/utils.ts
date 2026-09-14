export { cn } from "cn"
export function getLabelText(label: number | null | undefined): string {
    switch (label) {
        case 0:
            return "SAFE";
        case 1:
            return "OFFENSIVE";
        case 2:
            return "HATE";
        default:
            return "CHƯA ĐÁNH GIÁ";
    }
}