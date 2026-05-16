import { showToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/inputs/Input";
import { FormSelect } from "@/components/ui/inputs/Select";
import { companySizeOptions, industries } from "@/constants";
import { convertCompanySizeString } from "@/lib/utils";
import { useUpdateCompanyMutation } from "@/services/home.api";
import { useCompaniesStore } from "@/store/Companies";
import { CompanyDetails, CompanyType, SubscriptionStatus } from "@/types";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type CompanyInfoForm = {
  companyName: string;
  websiteUrl: string;
  industry: string;
  companySize: string;
};

export const ClientGeneralInformation = ({
  companyDetails,
  setShowEditForm,
}: {
  companyDetails?: CompanyDetails;
  setShowEditForm: (open: null) => void;
}) => {
  const { mutateAsync, isPending } = useUpdateCompanyMutation();
  const { setCompanies, companies } = useCompaniesStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    setValue,
  } = useForm<CompanyInfoForm>({
    mode: "all",
    defaultValues: {
      companyName: companyDetails?.name || "",
      websiteUrl: companyDetails?.website || "",
      industry: companyDetails?.industry?.toLowerCase() || "",
      companySize:
        convertCompanySizeString(companyDetails?.company_size || "") || "",
    },
  });
  // Update form values when companyDetails is updated
  useEffect(() => {
    if (companyDetails) {
      setValue("companyName", companyDetails.name || "");
      setValue("websiteUrl", companyDetails.website || "");
      setValue("industry", companyDetails.industry?.toLowerCase() || "");
      setValue(
        "companySize",
        convertCompanySizeString(companyDetails?.company_size || "") || ""
      );
    }
  }, [companyDetails, setValue]);

  const onSubmit: SubmitHandler<CompanyInfoForm> = (data) => {
    mutateAsync(
      {
        ...data,
        selectedPlan: companyDetails?.billing?.plan.id as unknown as string,
        comapanyId: companyDetails?.id || "",
      },
      {
        onSuccess: (data) => {
          showToast({ title: "Company Updated Successfully", type: "success" });
          const updatedCompany: CompanyType = {
            company: {
              id: data.id,
              name: data.name,
              website: data.website,
              created_at: data.created_at,
            },
            role: "admin",
            association: "client",
            linked_at: data.created_at, // using created_at as linked_at
            subscription_status: companyDetails?.billing?.status as SubscriptionStatus || 'trialing'
          };

          const existingCompanyIndex = companies.findIndex(
            (company) => company.company.id === data.id
          );

          if (existingCompanyIndex !== -1) {
            // If company exists, update it
            const updatedCompanies = companies.map((company, index) =>
              index === existingCompanyIndex
                ? { ...company, ...updatedCompany } // Merge updated company data
                : company
            );
            setCompanies(updatedCompanies);
          } else {
            // If company doesn't exist, add the new one
            setCompanies([...companies, updatedCompany]);
          }
          setShowEditForm(null);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Company Name"
        name="companyName"
        register={register}
        rules={{
          required: "Company name is required",
          maxLength: { value: 120, message: "Max length is 120" },
        }}
        requiredMark
        errors={errors}
      />
      <FormInput
        label="Website URL"
        name="websiteUrl"
        register={register}
        rules={{
          required: "Website URL is required",
          pattern: {
            value: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\S*)?$/,
            message: "Enter a valid URL",
          },
        }}
        requiredMark
        errors={errors}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormSelect
          label="Industry"
          name="industry"
          register={register}
          rules={{ required: "Industry is required" }}
          errors={errors}
          options={industries}
          placeholder="Select industry"
          control={control}
          requiredMark
        />
        <FormSelect
          label="Company Size"
          name="companySize"
          register={register}
          rules={{ required: "Company Size is required" }}
          errors={errors}
          options={companySizeOptions}
          placeholder="Select Company Size"
          requiredMark
          control={control}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || isPending}
          className="rounded-full cursor-pointer"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};
