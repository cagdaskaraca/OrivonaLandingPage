import { EventInvitePublicView } from "@/src/components/invites/EventInvitePublicView";

export const metadata = {
  title: "Etkinlik Davetiyesi | ORIVONA",
  description: "ORIVONA ortak davet linki — doğrulama, RSVP ve QR bilet",
};

type EventInvitePageProps = {
  params: Promise<{ token: string }>;
};

export default async function EventInvitePage({ params }: EventInvitePageProps) {
  const { token } = await params;
  return <EventInvitePublicView token={token} />;
}
