'use client'

import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useCompaniesStore } from '@/store/Companies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, LogOut, Building2, Users, Globe } from 'lucide-react';
import { showToast } from '@/components/Toast';
import { CompanyType } from '@/types';
import RoleBadge from '@/components/accounts/RoleBadge';
import { Role } from '@/enums';
import { useRouter } from 'next/navigation';
import { Tabs } from '@/components/Tabs';
import NotificationsSettingsTab from '@/components/settings/NotificationsSettingsTab';
import { AccountsContainer } from '@/components/accounts/AccountsContainer';

export default function SettingsPage() {
  const { logout, user } = useAuth();
  const { companies } = useCompaniesStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('general');
  const tabs = [
    { label: 'General Information', value: 'general' },
    { label: 'Notifications', value: 'notifications' },
    { label: 'Account Center', value: 'accounts' },

  ];

  const handleCopyId = async (content: string, companyName: string, isEmail: boolean = false) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast({
        title: isEmail ? "Company's Master Agency Email Copied" : "Company ID Copied",
        description: `${isEmail ? "Master Agency Email" : "ID"} for ${companyName} has been copied to clipboard`,
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: "Failed to copy",
        description: `Could not copy the company ${isEmail ? "Master Agency Email" : "ID"}`,
        type: 'error',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showToast({
        title: "Logout failed",
        description: "There was an error logging out",
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-25">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-tour="settings-page-header">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your account and company information</p>
          </div>
          <div className="flex items-center gap-4">
            {!user?.master_agency_id && (
              <Button
                className="flex items-center rounded-2xl gap-2"
                onClick={() => router.push('/onboarding?create_master=1')}
              >
                Create own master agency
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center rounded-2xl gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-1" data-tour="settings-tabs">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="w-full"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="space-y-6" data-tour="main-settings-content">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Profile
                  </CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900 mt-1">{user?.first_name} {user?.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900 mt-1">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Companies Section */}
            <div className="space-y-6" data-tour="all-settings-content">

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Companies
                  </CardTitle>
                  <CardDescription>
                    All companies you have access to. Click the copy button to copy the company ID.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {companies && companies.length > 0 ? (
                    <div className="space-y-4">
                      {companies.map((company: CompanyType, index: number) => (
                        <div
                          key={company.company.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          data-tour={index === 0 ? "company-card" : ""}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{company.company.name}</h3>
                                <RoleBadge role={company.role as Role} />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <label className="text-gray-500">Company ID</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono flex-1">
                                      {company.company.id}
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCopyId(company.company.id, company.company.name)}
                                      className="h-6 w-6 p-0 flex-shrink-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-gray-500">Master Agency Email</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono flex-1">
                                      {company.master_agency_email || 'N/A'}
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCopyId(company?.master_agency_email ?? 'N/A', company.company.name, true)}
                                      className="h-6 w-6 p-0 flex-shrink-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-gray-500">Website</label>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Globe className="h-3 w-3 text-gray-400" />
                                    <a
                                      href={company.company.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-xs truncate"
                                    >
                                      {company.company.website}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                      <p className="text-gray-500">You don't have access to any companies yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationsSettingsTab />
        )}

        {/* Notifications Tab */}
        {activeTab === 'accounts' && (
          <AccountsContainer />
        )}
      </div>
    </div>
  );
}
