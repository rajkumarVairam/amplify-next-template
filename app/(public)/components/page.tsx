import type { Metadata } from "next";
import ComponentsShowcase from "./ComponentsShowcase";

export const metadata: Metadata = {
  title: "Component Showcase",
  description: "All Amplify UI components rendered with the app theme.",
};

export default function ComponentsPage() {
  return <ComponentsShowcase />;
}
