'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Target, LineChart, PhoneCall, MessageSquare, FormInput, DollarSign, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-neutral-25 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header / Hero */}
                <div className="rounded-3xl bg-white border border-neutral-100 p-6 sm:p-8" data-tour="help-header">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                            <Sparkles className="h-4 w-4" />
                            Introducing LENZ
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">What is LENZ?</h1>
                        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-3xl">
                            LENZ is a SaaS web application that gives small businesses clear and reliable visibility into
                            marketing ROI. It unifies comprehensive lead tracking (calls, forms, chats) with CRM functionality
                            to connect marketing efforts directly to revenue—without enterprise-level complexity or cost.
                        </p>
                    </div>
                </div>

                {/* Core Value Proposition */}
                <Card data-tour="help-core-value">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Core Value Proposition</CardTitle>
                        <CardDescription>How LENZ helps you make smarter marketing decisions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <ValueItem icon={<LineChart className="h-4 w-4" />} title="Track marketing performance" desc="See which channels drive both leads and actual sales." />
                            <ValueItem icon={<PhoneCall className="h-4 w-4" />} title="Compare lead types" desc="Understand calls vs. forms vs. chats and their revenue impact." />
                            <ValueItem icon={<DollarSign className="h-4 w-4" />} title="Optimize budgets" desc="Allocate spend to campaigns, keywords, days and times that convert." />
                            <ValueItem icon={<MessageSquare className="h-4 w-4" />} title="Data you can act on" desc="Identify what works and double down with confidence." />
                            <ValueItem icon={<FormInput className="h-4 w-4" />} title="Unified hub" desc="Lead tracking and CRM in one place—simple, focused, effective." />
                        </div>
                    </CardContent>
                </Card>

                {/* Business Model */}
                <Card data-tour="help-business-model">
                    <CardHeader>
                        <CardTitle>Business Model</CardTitle>
                        <CardDescription>Simple SaaS subscription for small businesses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-neutral-700 leading-relaxed">
                            LENZ operates on a SaaS subscription model and is positioned to replace existing call-tracking
                            platforms and/or CRM systems used by small businesses.
                        </p>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card data-tour="help-contact">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Contact</CardTitle>
                        <CardDescription>Need help or have a question?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-sm text-neutral-700">Reach our team anytime at <Link href="mailto:team@lenzcrm.com" className="text-blue-600 hover:text-blue-800">team@lenzcrm.com</Link>.</p>
                            <Link
                                href="mailto:team@lenzcrm.com"
                                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm bg-black text-white hover:bg-gray-800"
                            >
                                Email Support
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ValueItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 text-neutral-700">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 text-neutral-700">
                    {icon}
                </span>
                <div className="font-medium">{title}</div>
            </div>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{desc}</p>
        </div>
    );
}


