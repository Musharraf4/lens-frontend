import SwitchAccountUser from "./SwitchAccountUser";

interface SwitchToAccountsPageProps {
  params: Promise<{ id: string }>;
}

const SwitchToAccountsPage = async ({ params }: SwitchToAccountsPageProps) => {
  const { id } = await params;

  return (
    <SwitchAccountUser id={id} />
  );
};

export default SwitchToAccountsPage;
