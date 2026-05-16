import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { User } from "@/services/auth.api";
import { useAuth } from "@/store/AuthContext";
import { useCompaniesStore } from "@/store/Companies";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { CompanyType } from "@/types";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";

export function DropDownUserHeader({
  user,
  handleAgencySelect,
}: {
  user: User;
  handleAgencySelect: (agency: CompanyType) => void;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const { companies } = useCompaniesStore();
  const { selectedCompany } = useSelectedCompanyStore();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };


  const handleNavigateOpenAccount = () => {
    const query = new URLSearchParams({ openAccount: 'true' }).toString();
    router.push(`/accounts/switch-to-accounts/${selectedCompany?.company?.id}?${query}`);
  };


  return (
    <>
      {/* User Info */}
      <DropdownMenuItem
        className="cursor-default focus:bg-transparent hover:bg-transparent px-0 py-0"
        asChild
      >
        <div className="flex flex-col items-center gap-3 px-3 py-2">
          <Avatar className="h-10 w-10 sm:h-16 sm:w-16">
            <AvatarImage
              src={user?.profile_picture ?? undefined}
              alt="User Avatar"
            />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-lg sm:text-xl">
              {user?.first_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center">
            <span className="text-sm sm:text-base font-normal text-black">
              {user.first_name} {user.last_name}
            </span>
            <span className="text-xs sm:text-sm text-neutral-500 font-medium">
              {user.email}
            </span>
          </div>
          <div className="flex gap-1 w-full flex-col sm:flex-row mb-2">
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border border-neutral-200 text-xs sm:text-sm font-medium shadow-none w-full sm:flex-1"
              onClick={() => handleNavigateOpenAccount()}
            >
              Open account
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-error-400 text-error-400 text-xs sm:text-sm font-medium w-full sm:flex-1 hover:bg-error-400/10 hover:text-error-400"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </DropdownMenuItem>

      {/* Agency List */}
      <div className="w-full max-h-[200px] sm:max-h-[300px] overflow-y-auto">
        {companies
          .sort((a, b) => {
            // Check if `a` or `b` is the `master_agency_id`
            if (a?.company?.id === user.master_agency_id) return -1;
            if (b?.company?.id === user.master_agency_id) return 1;
            return 0; // If neither matches, maintain the original order
          })
          .map((item) => {
            const isSelected =
              selectedCompany?.company?.id === item?.company?.id;

            return (
              <DropdownMenuItem
                key={item?.company?.id}
                className={`flex items-center justify-between px-3 py-2 
    text-black text-sm cursor-pointer hover:bg-neutral-500/20`}
                onClick={() => handleAgencySelect(item)} // Click for the whole item
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    defaultChecked={!!isSelected}
                    name={item?.company?.name}
                    className="mr-2 cursor-pointer h-4 w-4 accent-black"
                  />
                  <span className="truncate">{item?.company?.name}</span>
                </div>

                {user.master_agency_id === item.company.id && (
                  <div className="relative group z-50">
                    <button
                      onClick={() => router.push("/accounts")}
                      className="flex items-center"
                    >
                      <FaArrowRight className="text-base sm:text-lg w-4 h-4 cursor-pointer" />
                    </button>

                    <div
                      className="
                          fixed
                          bg-black text-white text-xs px-2 py-1 rounded
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200
                          pointer-events-none
                          whitespace-nowrap
                          z-50
                        "
                      style={{ left: "60%", transform: "translateX(-50%)" }}
                    >

                      Go to master agency
                    </div>
                  </div>
                )}

              </DropdownMenuItem>
            );
          })}
      </div>
    </>
  );
}
