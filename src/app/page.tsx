import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import Content from "./_components/Content";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <Header session={session} />
      <Content />
      <Footer />
    </HydrateClient>
  );
}
