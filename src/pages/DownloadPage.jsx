import React from 'react';
import { Monitor, Download, HardDrive, FileArchive, Apple, Sparkles, Smartphone } from 'lucide-react';
import { trackClick } from '../services/analytics';
import SEO from '../components/SEO';

const DOWNLOADS = [
  {
    id: 'windows-installer',
    label: 'Windows Installer',
    description: 'Recommended for most users. Installs Kreatix Mail like any other Windows app.',
    icon: Monitor,
    filename: 'KreatixMail_Setup_1.0.0.exe',
    size: '126 MB',
    badge: 'Windows 10/11',
    primary: true,
  },
  {
    id: 'windows-portable',
    label: 'Windows Portable',
    description: 'Run Kreatix Mail without installing. Great for USB drives or locked-down machines.',
    icon: FileArchive,
    filename: 'KreatixMail_Portable_1.0.0.exe',
    size: '125 MB',
    badge: 'Windows 10/11',
    primary: false,
  },
  {
    id: 'android-apk',
    label: 'Android App',
    description: 'Install the Kreatix Mail APK directly on your Android phone or tablet.',
    icon: Smartphone,
    filename: 'KreatixMail_1.0.1.apk',
    size: '3.2 MB',
    badge: 'Android 8+',
    primary: false,
  },
];

const COMING_SOON = [
  { icon: Apple, label: 'macOS', text: 'Apple Silicon & Intel builds coming soon.' },
  { icon: Sparkles, label: 'Linux', text: 'AppImage and .deb packages in development.' },
];

export default function DownloadPage() {
  const handleDownload = (id, filename) => {
    trackClick('download_kreatix_mail', { file: filename });
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <SEO
        title="Download Kreatix Mail"
        description="Download the Kreatix Mail desktop app for Windows. Secure, fast email built for Kreatix Technologies."
      />

      <section className="pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-orange text-xs font-semibold uppercase tracking-widest mb-4 sm:mb-6">
              Desktop App
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6 sm:mb-8">
              Kreatix Mail
            </h1>
            <p className="text-grey-dark text-lg max-w-2xl leading-relaxed">
              The same secure, cloud-synced email experience you use in the browser, now as a
              dedicated desktop app. Download for Windows below.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-5">
            {DOWNLOADS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-paper border border-border rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-orange/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-orange" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-grey bg-offwhite border border-border rounded-full px-3 py-1">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-ink text-xl font-black mb-2">{item.label}</h3>
                  <p className="text-grey-dark text-sm leading-relaxed mb-6">{item.description}</p>
                  <div className="flex items-center gap-3 text-xs text-grey mb-6">
                    <HardDrive className="h-3.5 w-3.5" />
                    <span>{item.size}</span>
                    <span className="text-border">|</span>
                    <span>Version {item.id === 'android-apk' ? '1.0.1' : '1.0.0'}</span>
                  </div>
                  <a
                    href={`/downloads/${encodeURIComponent(item.filename)}`}
                    download
                    onClick={() => handleDownload(item.id, item.filename)}
                    className={`
                      inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 font-bold text-sm rounded-full transition-all duration-200
                      ${item.primary
                        ? 'bg-ink text-white hover:bg-orange hover:-translate-y-0.5'
                        : 'border border-border text-ink hover:border-ink hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <Download className="h-4 w-4" />
                    Download {item.label}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mb-6">
            More platforms soon
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {COMING_SOON.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-paper border border-border rounded-2xl p-6 flex items-center gap-4 opacity-70">
                  <div className="w-10 h-10 bg-offwhite rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-grey" />
                  </div>
                  <div>
                    <p className="font-bold text-ink">{item.label}</p>
                    <p className="text-sm text-grey-dark">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
