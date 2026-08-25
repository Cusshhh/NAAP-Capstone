import React from 'react';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'center' | 'left' | 'right';
}

export const CustomTooltip = ({ children, content, side = 'top', align = 'center' }: TooltipProps) => {
    const isTop = side === 'top';
    const isBottom = side === 'bottom';

    const posClass = align === 'right' 
        ? 'right-0 items-end' 
        : align === 'left' 
        ? 'left-0 items-start' 
        : 'left-1/2 -translate-x-1/2 items-center';

    const arrowClass = align === 'right' 
        ? 'mr-4' 
        : align === 'left' 
        ? 'ml-4' 
        : '';

    return (
        <div className="relative group/tooltip inline-block">
            {children}
            <div className={`absolute hidden group-hover/tooltip:flex flex-col z-50 pointer-events-none transition-opacity duration-200 ${posClass} ${
                isTop ? 'bottom-full mb-2' : isBottom ? 'top-full mt-2' : 'bottom-full mb-2'
            }`}>
                {!isTop && (
                    <div className={`w-2 h-2 bg-[#193153] rotate-45 -mb-1 border-t border-l border-blue-900/30 pointer-events-none ${arrowClass}`}></div>
                )}
                <div className="bg-[#193153] text-[#ffdd59] text-[11px] font-bold py-1.5 px-3 rounded-md shadow-xl whitespace-nowrap border border-blue-900/40 pointer-events-none">
                    {content}
                </div>
                {isTop && (
                    <div className={`w-2 h-2 bg-[#193153] rotate-45 -mt-1 border-r border-b border-blue-900/30 pointer-events-none ${arrowClass}`}></div>
                )}
            </div>
        </div>
    );
};

export default CustomTooltip;
