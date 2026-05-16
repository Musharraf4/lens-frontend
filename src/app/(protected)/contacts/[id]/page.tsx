import ContactDetailsContainer from '@/components/contactDetails/ContactDetailsContainer';

interface ContactDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailsPage({ params }: ContactDetailsPageProps) {
  const { id } = await params;

  return <ContactDetailsContainer id={id} />;
}
