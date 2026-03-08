import { Link } from 'react-router-dom';
import {
  MapPin,
  Shield,
  Wrench,
  Award,
  ArrowRight,
  GitBranch,
  BellRing,
  CheckCircle2,
  Sparkles,
  Camera,
  Clock3,
  Bell,
  Star,
  Users,
} from 'lucide-react';
import Footer from '../components/common/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-primary-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="NagarSetu Logo"
                  className="h-12 w-auto object-contain"
                />
              <span className="text-2xl font-bold text-gray-900">NagarSetu</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute right-10 bottom-0 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.04),transparent_45%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-semibold uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              Fix cities faster
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 mt-4">
              Report city problems in seconds.
            </h1>
            <p className="text-xl text-primary-50 mb-8">
              NagarSetu helps citizens report civic issues like garbage, potholes, and broken streetlights directly to municipal authorities with real-time tracking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ ['--anim-delay' as any]: '80ms' }}>
              <Link
                to="/citizen/report"
                className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:-translate-y-1"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center">
              <div className="flex flex-col items-center text-primary-100">
                <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
                <div className="mt-2 w-6 h-10 rounded-full border border-white/50 flex items-start justify-center overflow-hidden">
                  <span
                    className="mt-1 h-2 w-2 rounded-full bg-white animate-bounce"
                    style={{ animationDuration: '1.2s' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center animate-fade-up" style={{ ['--anim-delay' as any]: '120ms' }}>
            {[
              { label: 'Reports logged', value: '2K+' },
              { label: 'Avg. verify time', value: '< 48 hrs' },
              { label: 'Hotspots flagged', value: '10' },
              { label: 'Points awarded', value: '30K' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/10 rounded-xl py-4 px-3 border border-white/15 backdrop-blur transition-all duration-300 hover:bg-white/15 hover:-translate-y-1 hover:shadow-xl"
              >
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-sm text-primary-100">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Snapshot value props */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-gray-100 shadow-sm bg-gradient-to-br from-primary-50 to-white animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:rotate-[0.5deg]">
            <div className="flex items-center gap-3 mb-3 text-primary-700">
              <Sparkles className="w-5 h-5" />
              <p className="text-sm font-semibold uppercase tracking-wide">Smart Intake</p>
            </div>
            <p className="text-gray-800 font-semibold mb-2">Duplicate & hotspot detection</p>
            <p className="text-gray-600 text-sm">Auto-merge near-identical reports, highlight clusters, and keep dashboards clean.</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-100 shadow-sm bg-gradient-to-br from-primary-50 to-white animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:rotate-[0.5deg]" style={{ ['--anim-delay' as any]: '80ms' }}>
            <div className="flex items-center gap-3 mb-3 text-primary-700">
              <BellRing className="w-5 h-5" />
              <p className="text-sm font-semibold uppercase tracking-wide">Live Updates</p>
            </div>
            <p className="text-gray-800 font-semibold mb-2">Push alerts & status tracking</p>
            <p className="text-gray-600 text-sm">Citizens follow every change; municipalities get instant hotspot pings.</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-100 shadow-sm bg-gradient-to-br from-yellow-50 to-white animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:rotate-[0.5deg]" style={{ ['--anim-delay' as any]: '160ms' }}>
            <div className="flex items-center gap-3 mb-3 text-yellow-700">
              <Award className="w-5 h-5" />
              <p className="text-sm font-semibold uppercase tracking-wide">Incentives</p>
            </div>
            <p className="text-gray-800 font-semibold mb-2">Points & accountability</p>
            <p className="text-gray-600 text-sm">Citizens earn for verified/resolved issues; contractors are rated after resolution.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Six quick steps from a snap to a solved issue.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Upload a photo', desc: 'Capture garbage, potholes, lights, more.', icon: Camera },
              { title: 'Add details & location', desc: 'Auto location + short description.', icon: MapPin },
              { title: 'Municipality reviews', desc: 'Triages and validates your report.', icon: Shield },
              { title: 'Contractor assigned', desc: 'Work order sent to the right team.', icon: Wrench },
              { title: 'Issue resolved', desc: 'Completion proof and status update.', icon: CheckCircle2 },
              { title: 'Citizen feedback', desc: 'Rate quality and speed of the fix.', icon: Star },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 animate-fade-up"
                  style={{ ['--anim-delay' as any]: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-primary-700">Step {idx + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Built for speed, clarity, and accountability.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Easy issue reporting', desc: 'Snap, describe, submit in under a minute.', icon: Camera },
              { title: 'Automatic location detection', desc: 'GPS pinpointing to the exact spot.', icon: MapPin },
              { title: 'Real-time tracking', desc: 'See every status change instantly.', icon: Clock3 },
              { title: 'Instant notifications', desc: 'Push alerts for verifications, assignments, and resolutions.', icon: Bell },
              { title: 'Feedback & ratings', desc: 'Rate quality and speed after resolution.', icon: Star },
              { title: 'Hotspot intelligence', desc: 'Clusters auto-flagged to speed up municipal action.', icon: GitBranch },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 bg-primary-50 rounded-xl border border-primary-100 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-up"
                  style={{ ['--anim-delay' as any]: `${idx * 70}ms` }}
                >
                  <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center text-primary-700 shadow mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-700 text-sm mt-2">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Who uses NagarSetu?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Aligned incentives for every stakeholder.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Citizens',
                bullets: ['Report issues', 'Track complaints', 'Give feedback'],
                accent: 'from-primary-100 to-white',
              },
              {
                title: 'Municipality',
                bullets: ['Review & verify the issue', 'Assign issue to contractors', 'Monitor hotspots (most issues in a particular area)'],
                accent: 'from-primary-100 to-white',
              },
              {
                title: 'Contractors',
                bullets: ['Receive tasks', 'Update status of work', 'Upload completion proof'],
                accent: 'from-primary-100 to-white',
              },
            ].map((role, idx) => (
              <div
                key={role.title}
                className={`p-6 rounded-xl border border-gray-100 shadow-sm bg-gradient-to-br ${role.accent} animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                style={{ ['--anim-delay' as any]: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-primary-700" />
                  <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                </div>
                <ul className="text-gray-700 text-sm space-y-2">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why it works</h2>
            <p className="text-gray-600">Efficiency, transparency, and collaboration built in.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Faster issue reporting',
              'Transparent complaint tracking',
              'Better communication between citizens and authorities',
              'Improved city management',
              'Data-driven decisions for municipalities',
              'Reward loops that keep citizens engaged',
            ].map((item, idx) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl border border-primary-100 animate-fade-up"
                style={{ ['--anim-delay' as any]: `${idx * 50}ms` }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-primary-500 mt-2" />
                <p className="text-gray-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* City impact stats */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">City impact</h2>
            <p className="text-primary-100">Proof that the loop works.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Issues reported', value: '50+' },
              { label: 'Issues resolved', value: '40' },
              { label: 'Active citizens', value: '100' },
              { label: 'Participating municipalities', value: '10' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="p-5 rounded-xl bg-white/5 border border-white/10 text-center animate-fade-up"
                style={{ ['--anim-delay' as any]: `${idx * 70}ms` }}
              >
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-primary-100 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">FAQ</h2>
            <p className="text-gray-600">Answers to common questions.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Who can report issues?',
                a: 'Any registered citizen can submit issues with a photo and location.',
              },
              {
                q: 'How long does it take to resolve complaints?',
                a: 'Timelines vary by category and priority; you can see live status and ETA in your dashboard.',
              },
              {
                q: 'Is the service free?',
                a: 'Yes, reporting and tracking issues is free for citizens.',
              },
              {
                q: 'Can I track my complaint?',
                a: 'Yes, every submission has real-time status updates and notifications.',
              },
            ].map((item, idx) => (
              <details
                key={item.q}
                className="group border border-gray-200 rounded-xl p-4 transition-all animate-fade-up"
                style={{ ['--anim-delay' as any]: `${idx * 60}ms` }}
              >
                <summary className="flex items-center justify-between cursor-pointer text-gray-900 font-semibold">
                  {item.q}
                  <span className="ml-3 text-primary-600 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-gray-700 mt-3 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 md:p-12 animate-pop-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="w-10 h-10" />
                  <h2 className="text-3xl font-bold">Earn Rewards</h2>
                </div>
                <p className="text-white/90 text-lg max-w-xl">
                  Get rewarded for making your city better! Earn points for reporting valid issues
                  and when they get resolved.
                </p>
                <div className="flex items-center gap-8 mt-6">
                  <div>
                    <span className="text-4xl font-bold">+10</span>
                    <p className="text-white/80">points for verified reports</p>
                  </div>
                  <div>
                    <span className="text-4xl font-bold">+20</span>
                    <p className="text-white/80">points when resolved</p>
                  </div>
                </div>
              </div>
              <Link
                to="/register"
                className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors whitespace-nowrap"
              >
                Start Earning Points
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
