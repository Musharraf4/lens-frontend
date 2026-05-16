import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string | React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    "data-tour"?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, breadcrumbs, "data-tour": dataTour }) => (
    <div data-tour={dataTour}>
        {/* Breadcrumbs */}
        {breadcrumbs && (
            <div>
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs?.map((item, idx) => (
                            <React.Fragment key={`${item.label}-${idx}`}>
                                <BreadcrumbItem>
                                    {item.href ? (
                                        <BreadcrumbLink href={item.href} className="text-gray-500">{item.label}</BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage className="text-black">{item.label}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        )}
        {/* Title */}
        <h1 className="text-[32px] font-[600] text-black">{title}</h1>
        {/* Description */}
        {description && (
            <div className="text-neutral-500 text-[14px] mt-1">{description}</div>
        )}
    </div>
);

export default PageHeader;
