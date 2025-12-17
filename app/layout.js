import './globals.css'

export const metadata = {
    title: 'Airbnb Toronto',
    description: 'Find your perfect stay in Toronto',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
