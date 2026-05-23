import { InvitePublicView } from "@/src/components/invites/InvitePublicView";

export const metadata = {
  title: "Etkinlik Davetiyesi | ORIVONA",
  description: "ORIVONA etkinlik davetiyesi ve RSVP",
};

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  return <InvitePublicView token={token} />;
}
