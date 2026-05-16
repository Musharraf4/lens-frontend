import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, User } from 'lucide-react';
import { useChatbotBuilder, UserInfoInputs } from '@/store/ChatbotBuilderContext';
import { StatusTag } from '@/components/StatusTag';

export const UserInfoInputsStatusTag: React.FC = () => {
  const { state } = useChatbotBuilder();
  const { collectName, collectEmail, collectPhone, collectCompany, otherFields, emailRequired, askPermission } = state.userInfoInputs;

  const enabledInputs = [];
  if (collectName) enabledInputs.push('Name');
  if (collectEmail) enabledInputs.push('Email');
  if (collectPhone) enabledInputs.push('Phone');
  if (collectCompany) enabledInputs.push('Company');
  if (emailRequired) enabledInputs.push('Email Required');
  if (askPermission) enabledInputs.push("Ask user's permission for messaging");
  if (otherFields.length > 0) enabledInputs.push(`+${otherFields.length} more`);

  if (enabledInputs.length === 0) return null;

  return (
    <>
      {enabledInputs.map((input) => (
        <StatusTag key={input} type="default" className="mr-1 last:mr-0">
          {input}
        </StatusTag>
      ))}
    </>
  );
};

const UserInfoInputsContent: React.FC = () => {
  const { state, setUserInfoInputs } = useChatbotBuilder();
  const { collectEmail, collectPhone, collectName, collectCompany, emailRequired, askPermission } = state.userInfoInputs;

  // Handler functions for updating user info inputs
  const handleEmailToggle = (checked: boolean) => {
    setUserInfoInputs({
      ...state.userInfoInputs,
      collectEmail: checked
    });
  };

  const handlePhoneToggle = (checked: boolean) => {
    setUserInfoInputs({
      ...state.userInfoInputs,
      collectPhone: checked
    });
  };

  const handleNameToggle = (checked: boolean) => {
    setUserInfoInputs({
      ...state.userInfoInputs,
      collectName: checked
    });
  };

  const handleCompanyToggle = (checked: boolean) => {
    setUserInfoInputs({
      ...state.userInfoInputs,
      collectCompany: checked
    });
  };
  const handleToggle = (field: keyof UserInfoInputs) => (value: boolean) => {
    setUserInfoInputs({
      ...state.userInfoInputs,
      [field]: value
    });
  };
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Choose User Info Inputs</h3>
        <div className="space-y-4">
          {/* Email Input */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 ">
              <img src="/attherate.svg" alt="Email" className="w-5 h-5 bg-gray-100 p-1 rounded-full" />
              <span className="text-sm">Email</span>
            </div>
            <Switch
              checked={collectEmail}
              onCheckedChange={handleEmailToggle}
            />
          </div>

          {/* Phone Number Input */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Phone number</span>
            </div>
            <Switch
              checked={collectPhone}
              onCheckedChange={handlePhoneToggle}
            />
          </div>

          {/* Name Input */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">First & Last name</span>
            </div>
            <Switch
              checked={collectName}
              onCheckedChange={handleNameToggle}
            />
          </div>

          {/* Company Input */}
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Company</span>
            </div>
            <Switch
              checked={collectCompany}
              onCheckedChange={handleCompanyToggle}
            />
          </div> */}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Define User Input Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email-required"
              checked={emailRequired}
              onCheckedChange={(checked) =>
                handleToggle('emailRequired')(checked === true)
              }
            />
            <label htmlFor="email-required" className="text-sm">
              Email Required
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ask-permission"
              checked={askPermission}
              onCheckedChange={(checked) =>
                handleToggle('askPermission')(checked === true)
              }
            />
            <label htmlFor="ask-permission" className="text-sm">
              Ask user's permission for messaging
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoInputsContent;