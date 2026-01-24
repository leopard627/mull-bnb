import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppWalletProvider } from "./providers/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Mull - BNB Chain Transaction Explainer | Understand Blockchain Transactions",
    template: "%s | Mull",
  },
  description:
    "Adding colors to the monotonous world of blockchain transactions. Mull transforms BNB Chain transactions into intuitive, colorful visualizations that anyone can understand.",
  keywords: [
    "BNB Chain",
    "BSC",
    "Binance Smart Chain",
    "transaction explainer",
    "blockchain explorer",
    "crypto",
    "web3",
    "DeFi",
    "NFT",
    "PancakeSwap",
    "swap",
    "transfer",
    "gas fees",
    "smart contract",
    "BEP-20",
    "transaction decoder",
    "blockchain analytics",
  ],
  authors: [{ name: "JihunWeb3", url: "https://x.com/JihunWeb3" }],
  creator: "JihunWeb3",
  publisher: "Mull",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Mull - BNB Chain Transaction Explainer",
    description:
      "Adding colors to the monotonous world of blockchain transactions. Transform BNB Chain transactions into intuitive, colorful visualizations.",
    type: "website",
    siteName: "Mull",
    locale: "en_US",
    url: "https://bnb.mull.live",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mull - BNB Chain Transaction Explainer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mull - BNB Chain Transaction Explainer",
    description: "Adding colors to the monotonous world of blockchain transactions",
    creator: "@getMullWeb3",
    site: "@getMullWeb3",
    images: ["/twitter-image.png"],
  },
  alternates: {
    canonical: "https://bnb.mull.live",
  },
  category: "technology",
  classification: "Blockchain Tools",
  metadataBase: new URL("https://bnb.mull.live"),
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mull",
  alternateName: "BNB Chain Transaction Explainer",
  description:
    "Adding colors to the monotonous world of blockchain transactions. Mull transforms BNB Chain transactions into intuitive, colorful visualizations that anyone can understand.",
  url: "https://bnb.mull.live",
  applicationCategory: "BlockchainApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "JihunWeb3",
    url: "https://x.com/JihunWeb3",
  },
  publisher: {
    "@type": "Organization",
    name: "Mull",
    url: "https://bnb.mull.live",
  },
  featureList: [
    "Transaction explanation in plain language",
    "Support for transfers, swaps, DeFi, NFTs",
    "Gas fee analysis",
    "Token transfer tracking",
    "Balance change visualization",
    "Contract call details",
    "Mainnet and Testnet support",
  ],
  screenshot: "https://bnb.mull.live/og-image.png",
  softwareVersion: "1.0.0",
  isAccessibleForFree: true,
  browserRequirements: "Requires JavaScript",
};

// FAQ Schema for AI SEO
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Mull?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mull adds colors to the monotonous world of blockchain transactions. It's a free web application that transforms BNB Chain transactions into intuitive, colorful visualizations. Just as watercolors bring life to a canvas, Mull helps anyone understand transfers, swaps, DeFi operations, NFTs, and smart contract interactions through vibrant visual flows.",
      },
    },
    {
      "@type": "Question",
      name: "How do I use Mull to explain a BNB Chain transaction?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Simply paste a BNB Chain transaction hash into the search box, select your network (Mainnet or Testnet), and click 'Explain'. Mull will fetch the transaction details and provide a clear summary of what happened.",
      },
    },
    {
      "@type": "Question",
      name: "What types of BNB Chain transactions does Mull support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mull supports various transaction types including: BNB transfers, token swaps on PancakeSwap and other DEXs, NFT transfers/mints/sales, DeFi lending (Venus, Alpaca), liquidity operations, bridge transactions, and smart contract deployments.",
      },
    },
    {
      "@type": "Question",
      name: "Is Mull free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Mull is completely free to use. It's an open-source project available on GitHub.",
      },
    },
    {
      "@type": "Question",
      name: "Does Mull support both BNB Mainnet and Testnet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Mull supports both BNB Chain Mainnet and Testnet. You can easily switch between networks using the toggle in the header.",
      },
    },
  ],
};

// Inline script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0VKL25C1RH" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0VKL25C1RH');
            `,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100`}
      >
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}
