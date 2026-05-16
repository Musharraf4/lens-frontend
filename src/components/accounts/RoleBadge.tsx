import React from 'react'
import { IoEyeOutline } from "react-icons/io5";
import { CiStar } from "react-icons/ci";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { Role } from '@/enums';

function RoleBadge({ role }: { role: Role }) {
    const roleMap = {
        [Role.Admin]: "Admin",
        [Role.Editor]: "Editor",
        [Role.Viewer]: "Viewer",
        [Role.Owner]: "Owner",

    }

    const colorMap = {
        [Role.Admin]: 'text-green-500',
        [Role.Owner]: 'text-green-500',
        [Role.Editor]: 'text-[#FB8F10]',
        [Role.Viewer]: 'text-gray-800',
    }

    const roleIconMap = {
        [Role.Admin]: <CiStar className={colorMap[role]} />,
        [Role.Owner]: <CiStar className={colorMap[role]} />,
        [Role.Editor]: <MdOutlineModeEditOutline className={colorMap[role]} />,
        [Role.Viewer]: <IoEyeOutline className={colorMap[role]} />,
    }

    const bgColorMap = {
        [Role.Admin]: 'bg-green-100',
        [Role.Owner]: 'bg-green-100',
        [Role.Editor]: 'bg-[#FFF5E9]',
        [Role.Viewer]: 'bg-gray-100',
    }

    return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-fit h-6 ${bgColorMap[role]}`}>
            <div className="w-3 h-3 flex items-center justify-center">
                {roleIconMap[role]}
            </div>
            <span className={`${colorMap[role]} capitalize font-normal text-xs leading-none`}>
                {roleMap[role]}
            </span>
        </div>
    )
}

export default RoleBadge;
