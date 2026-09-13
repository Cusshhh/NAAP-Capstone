import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/PhilSCA_Logo.png"
            alt="NAAP Logo"
            {...props}
        />
    );
}

