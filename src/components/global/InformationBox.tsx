import { SvgIcon } from "../SvgIcon";
import type { IconName } from "../SvgIcon";

interface Props {
    title: string;
    description: string;
    icon: IconName;
}
export const InformationBox = ({ title, description, icon }: Props) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 mb-4 opacity-20">
                <SvgIcon name={icon} width="100%" height="100%" />
            </div>
            <p className="text-lg font-bold text-gray-950">{title}</p>
            <p className="text-xs text-outline-variant mt-1">{description}</p>
        </div>
    );
}