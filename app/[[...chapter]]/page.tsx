import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ chapter?: string[] }>;
}) {
  const { chapter = [] } = await params;
  if (
    chapter.length &&
    ![
      "explore",
      "history",
      "inside",
      "hazards",
      "safety",
      "monitoring",
      "compare",
      "sources",
    ].includes(chapter[0])
  )
    notFound();
  if (
    chapter.length > 1 &&
    !(
      chapter[0] === "history" &&
      ["1883", "anak-krakatau", "2018"].includes(chapter[1]) &&
      chapter.length === 2
    )
  )
    notFound();
  return null;
}
